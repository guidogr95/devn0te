import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store/store";
import { ShowToastPayloadType } from "../core/toast-types";
import { showToast as showToastAction } from "../redux/slice/toast.slice";
import { dismissToast as dismissToastAction } from "../redux/slice/toast.slice";

export const useToastActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  const showToast = (args: ShowToastPayloadType) => {
    dispatch(showToastAction(args));
  };

  const dismissToast = (id: string | number) => {
    dispatch(dismissToastAction(id));
  };

  return {
    showToast,
    dismissToast
  };
};
