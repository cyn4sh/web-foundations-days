# SnapShare Scaling Plan

## Assumptions

- There are 10,000,000 registered users.
- 10% of them use the app on a given day, so there are 1,000,000 daily active users (DAU).
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- An average photo is 2 MB, and each photo also gets a 50 KB thumbnail.
- Rounding facts used: 1 day ≈ 100,000 seconds; 1 KB = 1,000 bytes, 1 MB = 1,000 KB, 1 GB = 1,000 MB, 1 TB = 1,000 GB.

## The calculation

**Uploads (writes):**
1,000,000 users × 1 photo = 1,000,000 uploads per day
1,000,000 ÷ 100,000 ≈ 10 uploads per second

**Feed views (reads):**
1,000,000 users × 50 views = 50,000,000 views per day
50,000,000 ÷ 100,000 ≈ 500 views per second

**Peak traffic (busy hours are ~5× the average):**
≈ 50 uploads/s and ≈ 2,500 views/s

**Storage per year:**
Photos: 1,000,000 uploads/day × 2 MB = 2,000,000 MB = 2,000 GB per day
Thumbnails: 1,000,000 uploads/day × 50 KB = 50,000,000 KB = 50,000 MB = 50 GB per day
Total: 2,050 GB per day
2,050 GB × 365 ≈ 748,250 GB per year ≈ 748 TB per year

## Read-heavy or write-heavy?

SnapShare is **read-heavy**: 500 feed views per second against only 10 uploads per second, a ratio of 50 reads for every write. This means the design should prioritize making reads fast and cheap, through caching and a CDN, since most of the system's load comes from people scrolling feeds, not uploading photos.

## Architecture diagram

```
                     ┌─────────────┐
   Users ───────────▶│     CDN     │ (serves cached photos/thumbnails)
                     └──────┬──────┘
                            │ (cache miss)
                            ▼
                     ┌─────────────┐
                     │Load Balancer│
                     └──────┬──────┘
                            ▼
                     ┌─────────────┐
                     │ App Servers │
                     └──┬───┬──────┘
                        │   │
            ┌───────────┘   └───────────┐
            ▼                           ▼
     ┌─────────────┐            ┌──────────────┐
     │    Cache     │            │Object Storage│
     │ (feed data)  │            │ (photo files)│
     └──────┬───────┘            └──────┬───────┘
            ▼                           │
     ┌─────────────┐                    │
     │  Database    │                   │
     │ + Read       │                   │
     │   Replica    │                   │
     └─────────────┘                    │
                                         ▼
                                  ┌─────────────┐
                                  │Queue + Worker│
                                  │(thumbnails)  │
                                  └─────────────┘
```

## Components, one sentence each

- **CDN:** caches and serves photos and thumbnails close to users, so most feed views never hit the origin servers.
- **Load balancer:** spreads incoming requests across multiple app servers so no single server gets overwhelmed.
- **App servers:** run the application logic, handling uploads and feed requests.
- **Cache:** stores frequently-requested feed data in memory so repeated reads don't need to hit the database every time.
- **Database with a read replica:** the main database handles writes (new uploads), while a read replica handles the much larger volume of read queries, splitting the load.
- **Object storage:** stores the actual photo and thumbnail files, since large binary files don't belong in a database.
- **Queue with a worker:** holds thumbnail-generation jobs so the upload request can finish quickly, while a separate worker processes thumbnails in the background.

## Upload flow, step by step

1. User selects a photo and submits it through the app.
2. The load balancer routes the request to an available app server.
3. The app server uploads the original photo directly to object storage.
4. The app server saves a record in the database (photo metadata: owner, timestamp, URL) and pushes a "generate thumbnail" job onto the queue.
5. The app server responds to the user immediately, confirming the upload, without waiting for the thumbnail.
6. A background worker picks up the job from the queue, generates a 50 KB thumbnail from the original photo, and saves it to object storage.
7. Once cached, both the original and thumbnail are served through the CDN for future feed views.

## Why photos shouldn't be stored in the database

Databases are built for structured, relatively small records (text, numbers, IDs) that need fast querying and indexing. A 2 MB photo file is large, unstructured binary data, storing it inside the database would bloat the database, slow down backups, and waste the database's optimized query engine on data it isn't designed to handle. Object storage is purpose-built for large files like this. Photos are stored in object storage, and the database only holds a lightweight reference (URL/path) to each file.

## Trade-offs

1. **CDN caching vs. freshness:** caching photos aggressively makes reads fast and cheap, but it means a deleted or updated photo might still be served briefly from cache until it expires or gets invalidated. Trading perfect freshness for speed is worth it here, since photos rarely change once uploaded.
2. **Asynchronous thumbnails vs. simplicity:** generating thumbnails via a queue and background worker instead of doing it synchronously during upload adds complexity (a queue, a worker process, handling job failures), but it keeps the upload response fast for the user. A simpler synchronous approach would be easier to build but would make every upload slower.