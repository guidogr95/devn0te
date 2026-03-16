---
applyTo: "**"
---

# Coding Style Guide

## Implementation Plans

- All implementation plans must be created as Markdown files inside `.local_files/notes/`.
- Every plan filename must use the prefix `PLAN-` followed by a short kebab-case descriptor, e.g. `PLAN-editor-view-toggle.md`.
- Plans are the source of truth for multi-phase feature work; reference them when resuming interrupted work.

---

This guide defines the exact coding conventions used in this project. All generated code must match these patterns. Deviating — even if the deviation is "cleaner" or "more idiomatic" — is wrong.

---

## General Rules (All Code)

- **Match, do not improve.** Write code in the style of the file you are editing. If the file uses a pattern, use that pattern. Do not silently refactor, rename, or restructure things outside the scope of the task.
- **No unsolicited changes.** Do not reformat, reorganize imports, reorder methods, or clean up surrounding code when making a targeted edit.
- **No comments explaining obvious code.** Only add a comment when the logic is genuinely non-obvious and the reason cannot be expressed through naming alone.
- **No task markers.** Never add `// TODO`, `// FIXME`, `// NOTE`, or similar annotations unless explicitly asked.
- **No revision markers.** Never add `// Added by AI`, `// Updated`, `// Step 1:`, or any comment documenting the change itself.

---

## AI Pollution — What to Avoid

These are the most common ways AI degrades codebases. Every one of these is forbidden:

1. **Docblock/comment inflation.** Adding PHPDoc or JSDoc to every method, especially trivial ones. Only document methods with complex generic return types (e.g., `@return LengthAwarePaginator<Note>`).
2. **Interface for everything.** Do not create a new interface unless there are (or will clearly be) multiple concrete implementations. The project only has repository interfaces, not service interfaces.
3. **Helper/utility sprawl.** Do not create a new utility class, helper function, or constant file for something used in one place.
4. **Premature abstraction.** Do not add optional parameters, strategy patterns, or configurable behaviours for hypothetical future requirements.
5. **Defensive overvalidation.** Do not validate internal method arguments that can only receive validated data from trusted layers.
6. **Error handling theater.** Do not add try/catch blocks that only rethrow or that catch exceptions the code cannot actually throw.
7. **Dead code.** Do not leave unused imports, variables, or parameters.
8. **Verbose naming.** `$userId` not `$authenticatedUserIdFromCurrentSession`. `response` not `apiResponseFromServer`.
9. **Redundant type annotations.** Do not annotate what the language already infers.
10. **Rewording existing code.** Do not rename working variables, methods, or parameters because a "better" name exists.

### DOM Interaction
- **Prefer React-idiomatic solutions over direct DOM manipulation.** Before reaching for `querySelector`, `getBoundingClientRect`, or manual scroll arithmetic, check whether the problem can be solved with a `ref` on a specific element, `scrollIntoView()`, or an `IntersectionObserver` on a sentinel element.
- **Use shadcn/ui components as-is before reaching for Radix primitives.** If a shadcn component (`ScrollArea`, `Dialog`, etc.) covers the use case, use it. Only drop down to the underlying Radix primitive when you genuinely need access to a sub-element (e.g. `Viewport`) that the shadcn wrapper does not expose.
- **Never query internal Radix DOM attributes** (e.g. `[data-radix-scroll-area-viewport]`). These are implementation details that can change. Access scroll containers through a `ref` on a concrete element you control, or use `scrollIntoView()` on a sentinel node.
- **Sentinel pattern for auto-scroll.** When a list needs to auto-scroll to the bottom, place an empty `<div ref={bottomRef} />` at the end of the list. Use `IntersectionObserver` on it to track whether the user is at the bottom, and call `bottomRef.current?.scrollIntoView()` when new items arrive and `isAtBottom` is true.

---

## PHP / Laravel (Backend)

### Formatting
- Tabs for indentation throughout.
- Opening brace for classes: same line as `class` declaration.
- Opening brace for methods: same line (single-line signature) or on the same line as the closing `)` (multiline signature).
- No blank line after opening brace.
- No blank line before closing brace.
- Trailing comma on the last constructor parameter when the constructor spans multiple lines.

### Classes
- `protected` typed properties declared at the top of the class, assigned in the constructor body — not constructor property promotion — unless the existing file already uses promotion (match the file).
- No `public` properties on service or repository classes.

### DTOs
- All properties are `public readonly`.
- Constructor only — no getters, no setters, no methods except a static `fromRequest()` factory when needed.
- No docblocks on the constructor.

```php
// Correct
class CreateNoteDTO
{
    public function __construct(
        public readonly int $userId,
        public readonly string $title,
        public readonly ?string $content = null,
    ) {}
}
```

### Domain Events
- Simple POPO. Constructor with `public readonly` properties. No methods, no docblocks.

### Enums
- Backed enums only (`string` or `int`). No pure enums.

### Controllers
- Every public method returns `JsonResponse`.
- Error handling: catch specific exceptions before `\Exception`. Always `Log::error()` or `Log::warning()` before returning an error response. Error messages returned to the client are short and generic; full detail goes to the log only.
- Do not expose raw exception messages in production responses (see existing `AuthController` pattern as a known exception — do not replicate it).
- Validate with `$request->validate()` inline, or with a `FormRequest` — not both.

### Services and Repositories
- No docblocks unless the return type is a generic (`LengthAwarePaginator<T>`, `array{notes: Note[]}`) that cannot be expressed in the return type hint alone.
- Use `phpstan-ignore` only for genuine PHPStan limitations, not to silence real type errors.

### Namespaces
- Follow the directory structure exactly: `App\Notes\Domain\Models`, `App\Notes\Application\DTOs`, etc.
- New Users domain code lives under `App\Users\...`, mirroring the `App\Notes\...` structure.

---

## TypeScript / React (Frontend)

### Formatting
- 2-space indentation.
- Semicolons at end of statements.
- No semicolons in `type` property lists (use newlines only).
- Double quotes for strings, except in JSX attributes (double quotes there too).

### Types
- Always `type`, never `interface`.
- Properties separated by newlines, no separating semicolons or commas in the type body.

```ts
// Correct
type AuthState = {
  user: UserEntity | null
  isLoadingLogin: boolean
  error?: string
}

// Wrong
interface AuthState {
  user: UserEntity | null;
  isLoadingLogin: boolean;
}
```

### File Naming
- All files: kebab-case. `auth-card.tsx`, `use-auth-actions.ts`, `auth.slice.ts`.
- No PascalCase filenames.

### Imports
- Use the `devnote/` path alias for cross-module imports.
- Use relative imports only for files within the same immediate directory.
- No `import type` — use regular imports for types.

### Adapters
- Static class methods only. No instantiation.
- Every method returns `T | HttpError`.
- Always wrap the HTTP call in `handleApiRequest()`.

```ts
// Correct
static async register(name: string, email: string, password: string, passwordConfirmation: string): Promise<RegisterResponse | HttpError> {
  const body = { name, email, password, password_confirmation: passwordConfirmation };
  return handleApiRequest(() =>
    axiosInstance.post<RegisterResponse>("/register", body).then(response => response.data)
  );
}
```

### Redux Slices
- State shape defined as a `type` alias at the top of the file.
- Action naming convention: `verbNounRequest`, `verbNounSuccess`, `verbNounFailure`, `verbNounFinalized`.
- Loading flags named `isLoadingXxx`.
- Export the actions object (`authActions`), individual named actions, and the reducer separately — all from the same file.

### Redux Middleware
- One middleware function per flow (e.g., `loginFlowMiddleware`, `verifyTokenFlowMiddleware`).
- Always call `next(action)` first, then handle the side effect.
- Use `authActions.xxxRequest.match(action)` for type-narrowed matching.

### Hooks
- Named function syntax: `export function useXxx() { ... }` — not arrow functions.
- Return a plain object (not an array).
- Named export only — no default exports for hooks.

### Components
- Arrow function syntax: `export const MyComponent = () => { ... }`.
- Named export only — no default exports for components.
- Call the component's dedicated hook at the top of the function body. Destructure what is needed.
- No inline logic inside JSX that could live in the hook.

### Response Types
- One file per response type in `core/`. Matches the backend JSON shape exactly.

```ts
// src/modules/auth/core/register.response.ts
import { UserEntity } from "./entities/user-entity";

export type RegisterResponse = {
  token: string
  user: UserEntity
}
```

### Module Structure
Every module follows this package structure. Add new files only to the layer that matches their responsibility:

```
{module}/
├── core/          ← types, entities, response shapes — no framework code
├── interface/
│   └── adapters/  ← HTTP adapters (static classes)
├── redux/
│   ├── middleware/
│   ├── selector/
│   └── slice/
├── hooks/         ← dispatch wrappers and state selectors exposed to UI
└── ui/            ← React components and their local hooks
```
