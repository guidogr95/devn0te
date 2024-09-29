import {
	Button,
	DevNoteInput,
	GenericDialog,
	Label,
} from "devnote/modules/shared";
import { useSharedNotePasswordDialog } from "./use-shared-note-password-dialog";

type Props = {
  sharingUrl: string
}

export const SharedNotePasswordDialog = ({
  sharingUrl
}: Props) => {

  const {
    handleSubmit,
		errors,
		register,
		onSubmitPassword
  } = useSharedNotePasswordDialog({ sharingUrl });

  return (
    <GenericDialog
      title="Password Required"
      description="This note is password-protected. Please enter the password to view its contents."
      hideCancelButton
      hideOkButton
      contentSlot={
        <form onSubmit={handleSubmit(onSubmitPassword)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">
                Password
              </Label>
              <DevNoteInput
                id="password"
                type="password"
                {...register("password")}
                error={errors.password}
                placeholder="Enter password"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              type="submit">
              Submit
            </Button>
          </div>
        </form>
      }/>
  );
};
