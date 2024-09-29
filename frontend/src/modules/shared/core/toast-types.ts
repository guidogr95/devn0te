import { ExternalToast } from "sonner";

export type ToastTypes = "success" | "error" | "warning" | "info" | "custom";

export type BaseShowToastPayload = {
	type: Exclude<ToastTypes, "custom">
	message: string | React.ReactNode
	data?: ExternalToast
} 

export type CustomShowToastPayload = {
	type: "custom"
	jsx: (id: number | string) => React.ReactElement
	data?: ExternalToast
}

export type ShowToastPayloadType = BaseShowToastPayload | CustomShowToastPayload
