import { HttpError } from "devnote/modules/auth/core/http-error";
import { GetNoteError } from "../../core/value-object/note-error-value-object";

export class GetNoteErrorMapper {
  static httpErrorToNoteError(httpError: HttpError, noteId?: number): GetNoteError {
    switch (httpError.statusCode) {
      case 404:
        return GetNoteError.notFound(noteId || 0);
      default:
        return GetNoteError.unknownError(httpError.message);
    }
  }
}
