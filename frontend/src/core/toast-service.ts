import { ReactElement } from "react";
import { ExternalToast, toast } from "sonner";

export class ToastService {

	static showSuccess(message: string | React.ReactNode, data?: ExternalToast) {
		const toastId = toast.success(message, data);
		ToastService.afterShow(toastId, data);
	}

	static showError(message: string | React.ReactNode, data?: ExternalToast) {
		const toastId = toast.error(message, data);
		ToastService.afterShow(toastId, data);
	}

	static showWarning(message: string | React.ReactNode, data?: ExternalToast) {
		const toastId = toast.warning(message, data);
		ToastService.afterShow(toastId, data);
	}

	static showInfo(message: string | React.ReactNode, data?: ExternalToast) {
		const toastId = toast.info(message, data);
		ToastService.afterShow(toastId, data);
	}

	static showCustom(jsx: (id: number | string) => ReactElement, data?: ExternalToast) {
		const toastId = toast.custom(jsx, data);
		ToastService.afterShow(toastId, data);
	}

	static afterShow(toastId: string | number, data?: ExternalToast) {
		if (data?.duration === Infinity) return;
		setTimeout(() => {
			this.dismiss(toastId);
		}, data?.duration || 3000);
	}

	static dismiss(id?: number | string) {
		toast.dismiss(id);
	}

}
