import { HttpError } from "devnote/modules/auth/core/http-error"

type CustomErrorClassDataType = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error?: any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	errors?: any
}

export type CustomErrorClassArgs = {
	statusCode: number
	message: string
	data?: CustomErrorClassDataType
	code?: number
}

export function createCustomHttpErrorClass(args: CustomErrorClassArgs) {

	const {
		statusCode,
		message,
		data,
		code
	} = args;

	return new HttpError(statusCode, message, data, code);
}
