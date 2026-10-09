# BikeCare — JDK-only motorcycle service manager

BikeCare runs on the installed JDK 27, Java's built-in `com.sun.net.httpserver.HttpServer`, HTML/CSS/vanilla JavaScript, and the SQLite JDBC JAR already present at `src/main/resources/sqlite-jdbc.jar`. It does not use Maven, Spring, Gradle, Node.js, npm, downloads, or newly installed dependencies.

## Start locally

In Command Prompt, open the project folder and run:

```bat
run.bat
```

This runs `build.bat` first, compiles the active Java source with `C:\Program Files\Java\jdk-27\bin\javac.exe`, then starts the server. Browse to **http://localhost:8080**. `PORT` changes the port. The SQLite file is `database\bikecare.db` by default; set `BIKECARE_DB` to use a different path.

For example, to run locally on another port and keep the database in another folder:

```bat
set "PORT=8090"
set "BIKECARE_DB=database\local-test.db"
run.bat
```

## Administrator setup

The existing database had no ADMIN account. In the same Command Prompt session, configure a separate administrator email and a unique password of at least 14 characters, then start BikeCare:

```bat
set "BIKECARE_ADMIN_EMAIL=admin@example.com"
set "BIKECARE_ADMIN_PASSWORD=choose-a-unique-long-secret"
run.bat
```

BikeCare creates that account once if the email is unused. It refuses to elevate an existing customer account. Do not use the example values as real credentials. In production, inject secrets through the host's protected environment settings and set `COOKIE_SECURE=true` when serving over HTTPS.

## Services and prices

Initial configurable service catalog values are General Service ₹599, Engine Repair ₹1,499, Oil Change ₹399, and Brake Service ₹499. They are starting configuration values, not market-verified quotes. Administrators can change them in the protected dashboard. Prices are stored in SQLite and are read by the server when each booking is created; browser-submitted prices are ignored. Existing bookings keep their original saved quote. Legacy bookings without a quote remain preserved and cannot be approved until an administrator assigns them a service and server-controlled catalog quote.

## Booking and invoices

Customers must sign in to book. A booking starts Pending. Admin transitions are Pending → Approved, Rejected or Cancelled; Approved → In Progress or Cancelled; In Progress → Completed or Cancelled. Approval creates one Draft invoice per booking. Admin can set parts and tax, then finalize it. Drafts are marked not payable. Cancelled or rejected bookings void associated invoices. Only finalized invoices can be printed, and the server calculates totals using `BigDecimal` rounded to two decimals. No online payments are connected.

## Data safety and security

The app applies additive `CREATE TABLE IF NOT EXISTS`/`ALTER TABLE` migrations and does not drop or recreate existing tables. Existing user and booking rows are retained. SQL uses prepared statements. Customer APIs enforce ownership; admin APIs check the server-side session role. Passwords use PBKDF2-HMAC-SHA256, sessions are server-side with HttpOnly SameSite cookies and an eight-hour expiry, and state-changing API requests require a CSRF token. Back up `database\bikecare.db` before copying the project or changing machines.

## Pages and API

Pages: `/`, `/signup.html`, `/login.html`, `/admin-login.html`, `/dashboard.html`, `/booking.html`, `/booking-history.html`, `/booking-details.html?id=BOOKING_ID`, `/admin.html`, `/billing.html`. The homepage and service cards use locally stored optimized motorcycle-workshop photos; no runtime image service is required.

API: `GET /api/health`, `GET /api/csrf`, auth endpoints under `/api/auth`, `GET /api/services`, `GET|POST /api/bookings`, `GET /api/bookings/{id}`, `GET /api/admin/stats`, `GET|PATCH /api/admin/services`, `PATCH /api/admin/bookings/{id}/status`, `PATCH /api/admin/bookings/{id}/quote`, `GET /api/bills`, and `PATCH /api/admin/bills/{id}`.

The `*.spring-legacy` files retain the prior Spring implementation for reference and are not active Java sources. The active build compiles the standalone server source only. The old `mvnw` scripts are disabled.

## Deploy on Render with Docker

The repository includes a `Dockerfile` that compiles the app with `javac` in an Eclipse Temurin JDK 27 image. It uses only the source file, static assets, and the SQLite JDBC JAR already in this project; it does not use Maven, Spring, Gradle, Node.js, or npm. Render builds the Docker image from this Dockerfile, so a Docker installation is not needed on the local machine. The hosting build must be able to pull the JDK base image.

1. Push this project to a Git repository and create a new Render Blueprint from that repository (or create a Docker web service using the repository root as its Docker build context).
2. Keep the `bikecare-data` persistent disk configured by `render.yaml`; it mounts at `/var/data`. `BIKECARE_DB=/var/data/bikecare.db` stores SQLite on that disk. The Java app creates the database parent folder before opening SQLite.
3. In the Render service environment settings, provide `BIKECARE_ADMIN_EMAIL` and `BIKECARE_ADMIN_PASSWORD`. Use a unique password of at least 14 characters and enter real secret values only in Render's protected settings, never in this repository. `COOKIE_SECURE=true` is configured for HTTPS.
4. Render supplies `PORT` to the container. The app binds to `0.0.0.0` and uses that port; it defaults to 8080 when `PORT` is not set. Render checks `GET /api/health`.
5. After deployment, open the Render service URL and verify `/api/health` returns `{"status":"ok"}`.

The database is initialized and migrated additively. Startup does not drop, recreate, or overwrite existing database tables or rows. Keep the persistent disk attached to retain data across deploys; back up the SQLite database before disk or service changes. SQLite is intended for this single service instance and its attached persistent disk. The local `run.bat` and `build.bat` continue to use the installed JDK 27 and the project's local JDBC JAR.

