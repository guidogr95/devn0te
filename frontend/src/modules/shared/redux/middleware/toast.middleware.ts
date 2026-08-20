import { Middleware } from "@reduxjs/toolkit";
import { toastActions } from "../slice/toast.slice";
import { ToastService } from "devnote/core/toast-service";
import { CustomShowToastPayload, ShowToastPayloadType, ToastTypes } from "../../core/toast-types";
import { ReactNode } from "react";
import { ExternalToast } from "sonner";

type ToastToActionMapTypes = {
  [K in Exclude<ToastTypes, "custom">]: (message: ReactNode, data?: ExternalToast) => void;
} & {
  custom: (jsx: (id: number | string) => React.ReactElement, data?: ExternalToast) => void;
};

const toastTypeToActionMap: ToastToActionMapTypes = {
	"success": ToastService.showSuccess,
	"warning": ToastService.showWarning,
	"error": ToastService.showError,
	"info": ToastService.showInfo,
	"custom": ToastService.showCustom
};

function isCustomToastPayload(value: ShowToastPayloadType): value is CustomShowToastPayload {
	return value.type === "custom";
}

export const showToastMiddleware: Middleware = (_api) => next => async action => {
  next(action);

  if (toastActions.showToast.match(action)) {

		if (isCustomToastPayload(action.payload)) {
			toastTypeToActionMap[action.payload.type](action.payload.jsx, action.payload.data);
		} else {
			toastTypeToActionMap[action.payload.type](
				action.payload.message,
				{
					richColors: typeof action.payload.data?.richColors == "boolean"
						? action.payload.data.richColors
						: true,
					...action.payload.data
				}
			);
		}

  }
};

export const dismissToastMiddleware: Middleware = (_api) => next => async action => {
  next(action);

  if (toastActions.dismissToast.match(action)) {

		ToastService.dismiss(action.payload);

  }
};
