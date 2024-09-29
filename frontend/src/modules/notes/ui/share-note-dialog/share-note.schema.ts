import { z } from "zod";
import { NoteSharingTypeEnum } from "../../core/enums/note-sharing-type.enum";

const ZodNoteSharingTypeEnum = z.nativeEnum(NoteSharingTypeEnum);

export const ShareNoteSchema = z.object({
  accessLevel: ZodNoteSharingTypeEnum,
  password: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.accessLevel === NoteSharingTypeEnum.PASSWORD_PROTECTED) {
    if (!data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required for this access level",
        path: ["password"],
      });
    } else if (data.password.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 3,
        type: "string",
        inclusive: true,
        message: "Password must be at least 3 characters",
        path: ["password"],
      });
    } else if (data.password.length > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 20,
        type: "string",
        inclusive: true,
        message: "Password must be at most 20 characters",
        path: ["password"],
      });
    }
  }
});

export type ShareNoteSchemaType = z.infer<typeof ShareNoteSchema>;
