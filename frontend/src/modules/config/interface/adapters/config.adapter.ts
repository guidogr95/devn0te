import axiosInstance from "devnote/config/api/axios-instance";
import { ConfigResponse } from "../../core/config-response";
import { HttpError } from "devnote/modules/auth/core/http-error";
import { handleApiRequest } from "devnote/utils/handle-api-request";

export class ConfigAdapter {
  static async getConfig(): Promise<ConfigResponse | HttpError> {
    return handleApiRequest(() =>
      axiosInstance.get<ConfigResponse>("/config").then(response => response.data)
    );
  }
}
