import { AppDispatch } from "devnote/redux/store/store";
import { useDispatch } from "react-redux";
import { DialogType } from "../core/dialog-type.type";
import { toggleOpen as handleToggleOpen, toggleClose as handleToggleClose } from "../redux/slice/action-dialog.slice";

export const useActionDialogsActions = () => {
  const dispatch = useDispatch<AppDispatch>();


	const toggleOpen = (dialogType: DialogType) => {
		dispatch(handleToggleOpen(dialogType));
	};

	const toggleClose = (dialogType: DialogType) => {
		dispatch(handleToggleClose(dialogType));
	};

	return {
		toggleOpen,
		toggleClose
	};
};
