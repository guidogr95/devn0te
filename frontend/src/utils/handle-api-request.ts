import axios from "axios";
import { HttpError } from "devnote/modules/auth/core/http-error";

export async function handleApiRequest<T, E = HttpError>(
  request: () => Promise<T>,
  errorMapper?: (error: HttpError) => E
): Promise<T | E> {
  try {
    return await request();
  } catch (error) {

    const httpError = axios.isAxiosError(error) ? new HttpError(
      error.status || 500,
      error.message || "",
      error.response?.data || {},
      error.response?.data.code
    ) : new HttpError(500, "An unexpected error occurred");

    return errorMapper
      ? errorMapper(httpError)
      : (httpError as E);
  }
}
