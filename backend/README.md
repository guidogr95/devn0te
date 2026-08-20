<div align="center">

```
╔═══════════════════════════════════════╗
║  devn0te / backend                    ║
║  Laravel 11 API                       ║
╚═══════════════════════════════════════╝
```

[![Laravel 11](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel&logoColor=white)](https://laravel.com/)
[![PHP 8.2](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![PostgreSQL 15](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![PHPUnit 11](https://img.shields.io/badge/PHPUnit-11-9B4DCA?logo=testing&logoColor=white)](https://phpunit.de/)

</div>

---

The backend for devn0te. A Laravel 11 REST API that handles note CRUD, delta-sync with device cursors and tombstones, GitHub connector management, note sharing, and authentication via Passport personal access tokens.

Built with domain-driven design: two bounded contexts (**Notes** and **Connectors**), each split into Domain, Application, Infrastructure, and Presentation layers.

---

## Setup

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Start the server

```sh
# From the project root
cd devn0te

# Copy environment file
cp backend/.env.example backend/.env

# Start containers (Laravel + PostgreSQL)
docker compose up -d

# Generate the app key (required)
docker compose exec backend php artisan key:generate

# Run database migrations
docker compose exec backend php artisan migrate

# Create the Passport personal access client (required for auth)
docker compose exec backend php artisan passport:client --personal
```

The API is now running at **http://localhost:8000**.

> **Tip:** If register or login returns 500 with "Personal access client not found", you need the `passport:client` command above. A `migrate:fresh` wipes the client row, so re-run it.

---

## Environment Variables

| Variable              | Purpose                                                         | Required | Default            |
|-----------------------|-----------------------------------------------------------------|----------|--------------------|
| `APP_KEY`             | Laravel encryption key: generate with `php artisan key:generate`| Yes      | *none*             |
| `APP_ENV`             | Environment (`local`, `testing`, `production`)                   | Yes      | `local`            |
| `APP_DEBUG`           | Show detailed error pages                                        | No       | `true`             |
| `APP_URL`             | Base URL of the backend                                          | No       | `http://localhost`  |
| `SERVER_SYNC_ENABLED` | Toggle server delta-sync on/off                                  | No       | `true`             |
| `DB_CONNECTION`       | Database driver (`pgsql` in Docker, `sqlite` locally)            | Yes      | `pgsql`            |
| `DB_HOST`             | PostgreSQL host                                                  | Docker   | `db`               |
| `DB_PORT`             | PostgreSQL port                                                  | Docker   | `5432`             |
| `DB_DATABASE`         | Database name                                                    | Docker   | `pgsqldb`          |
| `DB_USERNAME`         | Database user                                                    | Docker   | `my_user`          |
| `DB_PASSWORD`         | Database password                                                | Docker   | `my_password`      |

The `.env.example` also includes standard Laravel variables for logging, sessions, cache, queue, mail, Redis, and AWS S3. These work out of the box for local development.

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Public

| Method | Endpoint                      | Description                              |
|--------|-------------------------------|------------------------------------------|
| `GET`  | `/config`                     | App config (returns `serverSyncEnabled`)  |
| `POST` | `/register`                   | Register a new account                   |
| `POST` | `/login`                      | Log in, returns a Passport token         |
| `GET`  | `/shared-notes/{sharingUrl}`  | View a shared note (public or password)  |

### Authenticated (`Authorization: Bearer <token>`)

| Method   | Endpoint                           | Description                              |
|----------|------------------------------------|------------------------------------------|
| `GET`    | `/user`                            | Get the authenticated user               |
| `GET`    | `/notes`                           | List notes (paginated)                   |
| `POST`   | `/notes`                           | Create a note                            |
| `GET`    | `/notes/{id}`                      | Get a single note                        |
| `PATCH`  | `/notes/{id}`                      | Update a note                            |
| `DELETE` | `/notes/{id}`                      | Delete a note                            |
| `GET`    | `/note/{id}`                       | Get a note by ID (alternate route)       |
| `POST`   | `/notes/{id}/share`                | Share a note (public/password)           |
| `DELETE` | `/notes/{id}/share`                | Remove sharing from a note               |
| `GET`    | `/user/notes/titles`               | Get all note titles (for wiki-link autocomplete) |
| `GET`    | `/user/notes/links`                | Get all note links (for graph view)      |
| `GET`    | `/user/notes/sync`                 | Full snapshot sync                       |
| `GET`    | `/user/notes/delta`                | Delta sync (changed since cursor)        |
| `GET`    | `/user/notes/preview`              | Note previews (paginated)                |
| `POST`   | `/user/notes/sync/push`            | Push local changes (batch)               |
| `GET`    | `/user/connectors`                 | List connectors                          |
| `POST`   | `/user/connectors`                 | Create a connector                       |
| `DELETE` | `/user/connectors/{type}`          | Delete a connector by type               |

> **Note:** Note titles must be alphanumeric with hyphens and underscores only (`^[a-zA-Z0-9_-]+$`), max 50 characters, no spaces. Leading/trailing hyphens and double hyphens are not allowed.

---

## Artisan Commands

| Command                       | Description                                                    |
|-------------------------------|----------------------------------------------------------------|
| `notes:sync-links`            | Re-sync all `[[id]]` wiki-link references from note content into the `note_links` table |
| `notes:migrate-to-connector-ids` | Rewrite `[[integer]]` wiki-links to `[[note-title]]` format in all note content |

---

## Architecture

```
backend/app/
├── Notes/                    Notes bounded context
│   ├── Domain/               Entities, value objects, domain events
│   ├── Application/          Service interfaces and implementations
│   ├── Infrastructure/       Eloquent models, repositories
│   └── Presentation/         API controllers
├── Connectors/               Connectors bounded context (GitHub)
│   ├── Domain/
│   ├── Application/
│   ├── Infrastructure/
│   └── Presentation/
├── Http/                     Auth + config controllers
├── Console/Commands/         Artisan commands
├── Models/                   Shared Eloquent models
├── Policies/                 Authorization policies
├── Providers/                Service providers
├── Repositories/             Repository interfaces
└── Services/                 Shared services
```

---

## Testing

```sh
# Code style (Pint)
./vendor/bin/pint --test

# Static analysis (PHPStan)
./vendor/bin/phpstan analyse --memory-limit=1G

# Tests (PHPUnit)
./vendor/bin/phpunit
```

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
