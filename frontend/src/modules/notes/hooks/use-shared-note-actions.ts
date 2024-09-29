import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store/store";
import { getNoteBySharingUrlRequest } from "../redux/slice/shared-note.slice";
import { GetNoteBySharingUrlInput } from "../core/get-note-by-sharing-url-input";

export const useSharedNoteActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleGetNoteBySharingUrl = (sharingUrl: string, input: GetNoteBySharingUrlInput) => {
    dispatch(getNoteBySharingUrlRequest({ sharingUrl, input }));
  };

  return {
    handleGetNoteBySharingUrl
  };
};
