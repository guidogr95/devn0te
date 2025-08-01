import { AppDispatch } from "devnote/redux/store/store";
import { useDispatch } from "react-redux";
import { deltaSyncNotesRequest } from "../redux/slice/notes.slice";

export const useNotesDeltaSyncActions = () => {
  const dispatch = useDispatch<AppDispatch>();

	const handleTriggerDeltaSync = (userId: number) => {
		dispatch(deltaSyncNotesRequest(userId));
	};

	return {
		handleTriggerDeltaSync
	};
};
