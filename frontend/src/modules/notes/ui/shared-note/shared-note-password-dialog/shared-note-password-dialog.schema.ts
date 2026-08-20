import { z } from "zod";

export const SharedNotePasswordDialogSchema = z.object({
  password: z.string()
});

export type SharedNotePasswordDialogSchemaType = z.infer<typeof SharedNotePasswordDialogSchema>;
