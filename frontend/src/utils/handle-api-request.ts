import axios from "axios";
import { HttpError } from "devnote/modules/auth/core/http-error";

export async function handleApiRequest<T>(
  request: () => Promise<T>
): Promise<T | HttpError> {
  try {
    return await request();
  } catch (error) {

    return axios.isAxiosError(error) ? new HttpError(
      error.status || 500,
      error.message || "",
      error.response?.data || {},
      error.response?.data.code
    ) : new HttpError(500, "An unexpected error occurred");
  }
}
