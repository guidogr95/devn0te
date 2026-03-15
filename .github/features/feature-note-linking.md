## Note Linking Feature Plan

### 1. Design the Data Model
- Add a new table (e.g., `note_links`) to persist relationships between notes.
	- Columns: `id`, `source_note_id`, `target_note_id`, `created_at`, `updated_at`
- Ensure `notes` table has a unique `id` and `title`.

### 2. Update Domain Layer
- Create a `NoteLink` entity in `app/notes/domain/models/NoteLink.php`.
- Define a repository interface in `app/notes/domain/repositories/NoteLinkRepositoryInterface.php` for managing links.

### 3. Infrastructure Layer
- Implement the repository in `app/notes/infrastructure/repositories/EloquentNoteLinkRepository.php`.
- Add the Eloquent model for `NoteLink` in `app/notes/infrastructure/persistence/NoteLink.php`.
- Create a migration for the `note_links` table.

### 4. Application Layer
- Update or create services in `app/notes/application/services/` to:
	- Parse note content for `[[id]]` references on create/update.
	- Add or remove links in the `note_links` table accordingly.
	- Handle edge cases (note deletion, link removal, note renaming).

### 5. Presentation Layer
- Update `NoteController` to trigger link parsing and relationship updates when notes are created, updated, or deleted.
- Expose endpoints to fetch note links (for rendering maps, backlinks, etc.).

### 6. Edge Case Handling
- **Note deleted:** Remove all links where it is `source_note_id` or `target_note_id`.
- **Link removed from note:** On update, remove links not present in the new content.
- **Note renamed:** Links remain valid (since they use `id`), but display the updated title.
- **Link to non-existent note:** Optionally allow and resolve when the note is created.

### 7. Monaco Editor Plugin
- **Autocomplete:** As the user types `[[`, the plugin shows a dropdown of note titles (excluding the current note).
- **Insert Reference:** On selection, insert `[[note-title:id]]` or just `[[id]]` into the markdown.
- **Store Reference:** In markdown, store as `[[id]]` for backend consistency.
- **Render Title:** When viewing a note, the plugin fetches the current title for each `[[id]]` and displays it as `[[note-title]]`.
- **Handle Renames:** If a note is renamed, the plugin always shows the latest title for each link.
- **Broken Links:** If a referenced note is deleted, show a "broken link" indicator in the editor.

### 8. Next Steps
1. Scaffold the migration for `note_links`.
2. Create the domain entity and repository interface.
3. Implement the infrastructure repository and model.
4. Update application services for link management.
5. Integrate with the controller and API.
6. Develop the Monaco plugin for autocomplete, link insertion, and rendering.

---

**Summary:**  
Start with the migration and domain model, then proceed layer by layer following your DDD structure.  
Begin Monaco plugin development in parallel for frontend UX.  
Let me know which step you want to begin with, and I can help scaffold the code or guide the design.
