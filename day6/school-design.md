# School Database Design

## Tables

**students** — stores each student's basic details: `id` (primary key), `name`, and a unique `email` so no two students can share the same email address.

**courses** — stores each course offered: `id` (primary key) and `title`.

**enrolments** — the join table that records which student is enrolled in which course, along with their `grade`. It holds foreign keys to both `students` and `courses`, plus a `UNIQUE (student_id, course_id)` constraint to stop the same student enrolling in the same course twice.

## Relationships

- **students to enrolments** is one-to-many: one student can have many enrolments, but each enrolment belongs to exactly one student.
- **courses to enrolments** is one-to-many: one course can have many enrolments, but each enrolment belongs to exactly one course.
- **students to courses** is many-to-many: a student can take many courses, and a course can have many students. Because a plain foreign key can't represent many-to-many directly, the `enrolments` table acts as a join table, breaking the many-to-many relationship into two one-to-many relationships.

## Index

I would add an index on `enrolments.student_id`, since the application frequently looks up "all courses for one student" (Query 1). Without an index, this lookup requires scanning the entire `enrolments` table; an index lets the database find a student's rows directly.

## SQL or NoSQL?

I would choose **SQL** for this system. The data has a clear, fixed structure (students, courses, enrolments), and the relationships between them, especially the many-to-many link between students and courses, are naturally expressed with foreign keys and joins. The app also needs accurate counts and consistent data (e.g. preventing a duplicate enrolment), which relational databases enforce directly through constraints like `UNIQUE` and `FOREIGN KEY`. A NoSQL database would require manually enforcing these rules in application code instead of the database guaranteeing them.