import axiosInstance from "devnote/config/api/axios-instance";
import { handleApiRequest } from "devnote/utils/handle-api-request";
import { HttpError } from "devnote/modules/auth/core/http-error";
import { GetConnectorsResponse, SaveConnectorResponse } from "../../core/connector-api-response";
import { ConnectorSettings } from "../../core/sync-connector";

export class ConnectorsAdapter {
  static async getConnectors(): Promise<GetConnectorsResponse | HttpError> {
    return handleApiRequest(() =>
      axiosInstance.get<GetConnectorsResponse>("/user/connectors").then(r => r.data)
    );
  }

  static async saveConnector(type: string, settings: ConnectorSettings): Promise<SaveConnectorResponse | HttpError> {
    const { type: _discriminant, ...settingsPayload } = settings;
    return handleApiRequest(() =>
      axiosInstance.post<SaveConnectorResponse>("/user/connectors", { type, settings: settingsPayload }).then(r => r.data)
    );
  }

  static async deleteConnector(type: string): Promise<void | HttpError> {
    return handleApiRequest(() =>
      axiosInstance.delete(`/user/connectors/${type}`).then(() => undefined)
    );
  }
}
