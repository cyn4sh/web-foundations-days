# Library API — Books Resource

A REST API design for managing books in a library system.

## Endpoints

### 1. List all books
- **Method:** GET
- **Path:** `/books`
- **Description:** Returns a list of all books in the library.
- **Success response:** `200 OK`

### 2. Get one book
- **Method:** GET
- **Path:** `/books/:id`
- **Description:** Returns a single book by its ID.
- **Success response:** `200 OK`
- **Error responses:**
  - `404 Not Found` — if no book exists with the given ID.

### 3. Create a book
- **Method:** POST
- **Path:** `/books`
- **Description:** Adds a new book to the library.
- **Example request body:**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "publishedYear": 1925
}
```
- **Success response:** `201 Created`
- **Error responses:**
  - `400 Bad Request` — if `title` or `author` is missing.

### 4. Update a book
- **Method:** PUT
- **Path:** `/books/:id`
- **Description:** Updates an existing book's details.
- **Example request body:**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "9780743273565",
  "publishedYear": 1925
}
```
- **Success response:** `200 OK`
- **Error responses:**
  - `400 Bad Request` — if the request body is missing required fields.
  - `404 Not Found` — if no book exists with the given ID.

### 5. Delete a book
- **Method:** DELETE
- **Path:** `/books/:id`
- **Description:** Removes a book from the library.
- **Success response:** `200 OK`
- **Error responses:**
  - `404 Not Found` — if no book exists with the given ID.

### 6. List books by author
- **Method:** GET
- **Path:** `/books?author=:authorName`
- **Description:** Returns all books written by a specific author, using a query parameter.
- **Success response:** `200 OK`
- **Error responses:**
  - `400 Bad Request` — if the `author` query parameter is missing or empty.

## Error codes summary

- **400 Bad Request** — the request body or query parameter is missing or invalid (e.g. creating a book without a title, or searching by author with no name given).
- **404 Not Found** — the requested book ID doesn't exist in the library (e.g. `GET /books/9999` when no book has that ID).