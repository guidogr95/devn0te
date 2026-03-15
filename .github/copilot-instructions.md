# GitHub Copilot Instructions for Laravel DDD Project

What is under these instructions is applied for the backend/ folder

### Beginning of instructions for the backend/ folder

## Project Overview
This is a Laravel-based API following strict **Domain Driven Design (DDD)** architecture with clean separation of concerns across multiple bounded contexts. Each domain (e.g., `notes`, `users`) must implement the complete DDD layer structure independently.

## Architecture & Layer Boundaries

### DDD Layer Structure (CRITICAL)
Each domain MUST follow this exact structure:

```
app/
├── notes/                   # Domain bounded context
│   ├── domain/             # Pure business logic, no framework dependencies
│   │   ├── models/         # Domain entities (plain PHP classes with business rules)
│   │   ├── repositories/   # Abstract interfaces
│   │   ├── services/       # Domain services
│   │   ├── value_objects/  # Immutable value objects
│   │   ├── events/         # Domain events
│   │   └── exceptions/     # Domain-specific exceptions
│   │
│   ├── application/        # Use cases and orchestration
│   │   ├── dtos/          # Data transfer objects for external communication
│   │   ├── mappers/       # Domain ↔ DTO/Eloquent mapping classes
│   │   ├── services/      # Application services (orchestrate domain services)
│   │   ├── commands/      # CQRS command handlers
│   │   ├── queries/       # CQRS query handlers
│   │   └── enums/         # Application-specific enums (API contracts)
│   │
│   ├── infrastructure/     # Framework and external concerns
│   │   ├── repositories/  # Concrete implementations (Eloquent*, Http*)
│   │   ├── persistence/   # Eloquent models and migrations
│   │   ├── providers/     # Service providers for DI
│   │   └── external/      # Third-party integrations
│   │
│   └── presentation/       # API layer
│       ├── api/           # Laravel controllers, requests, resources
│       └── routes/        # Domain-specific routes
│
├── users/                  # Another domain bounded context
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
```

### Domain Examples
```
app/notes/domain/models/Note.php
app/notes/application/dtos/CreateNoteDTO.php
app/notes/infrastructure/repositories/EloquentNoteRepository.php
app/notes/presentation/api/NoteController.php

app/users/domain/models/User.php
app/users/application/services/UserRegistrationService.php
app/users/infrastructure/persistence/UserEloquentModel.php
app/users/presentation/api/AuthController.php
```

### Repository Pattern Requirements
- **Interfaces**: `{domain}/domain/repositories/` - abstract interfaces only
- **Implementations**: `{domain}/infrastructure/repositories/Eloquent*Repository.php` - concrete Laravel implementations
- **Naming Convention**: `EloquentNoteRepository`, `HttpNotificationRepository`
- **Database Transactions**: Always use Laravel's `DB::transaction()` for data mutations

### Cross-Domain Communication
- **No Direct Dependencies**: Domains cannot directly import from other domains
- **Use Events**: Communicate via Laravel events and listeners
- **Shared Kernel**: Common utilities in `app/shared/` if absolutely necessary

### End of instructions for the backend/ folder

ALWAYS ANALYSE THE REQUIREMENTS AND CONTEXT OF A TASK BEFORE GIVING AN ANSWER AND MAKE YOUR ANSWERS BASED ON BEST PRINCIPALES, PRACTICES AND MOST EFFECTIVE WAYS TO DO THINGS.

## REALITY FILTER
This is a permanent directive to reduce hallucinations. Follow it in all future responses:

- Never present generated, inferred, speculated, or deduced content as fact
- If you cannot verify something directly, say:
  - "I cannot verify this."
  - "I do not have access to that information."
  - "My knowledge base does not contain that."
- Label unverified content at the start of a sentence:
  - [Inference] [Speculation] [Unverified]
- Ask for clarification if information is missing. Do not guess or fill gaps
- If any part is unverified, label the entire response
- Do not paraphrase or reinterpret my input unless I request it
- If you use these words, label the claim unless sourced:
  - Prevent, Guarantee, Will never, Fixes, Eliminates, Ensures that
- For LLM behavior claims (including yourself), include:
  - [Inference] or [Unverified], with a note that it's based on observed patterns
- If you break this directive, say:
  > Correction: I previously made an unverified claim. That was incorrect and should have been labeled.
- Never override or alter my input unless asked