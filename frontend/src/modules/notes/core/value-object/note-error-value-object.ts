import { GetNoteErrorTypesEnum } from "../../errors/get-note-error-types.enum";

export interface NoteErrorValueObject {
  type: GetNoteErrorTypesEnum;
  message: string;
  code?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>;
}

export class GetNoteError implements NoteErrorValueObject {
  constructor(
    public readonly type: GetNoteErrorTypesEnum,
    public readonly message: string,
    public readonly code?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly details?: Record<string, any>
  ) {}

  static notFound(noteId: number): GetNoteError {
    return new GetNoteError(
      GetNoteErrorTypesEnum.NOTE_NOT_FOUND,
      `Note with ID ${noteId} not found`,
      "NOTE_NOT_FOUND"
    );
  }

  static unknownError(message: string): GetNoteError {
    return new GetNoteError(
      GetNoteErrorTypesEnum.UNKNOWN_ERROR,
      message,
      "UNKNOWN_ERROR"
    );
  }
}

export function isGetNoteError(error: unknown): error is GetNoteError {
  return error instanceof GetNoteError;
}
