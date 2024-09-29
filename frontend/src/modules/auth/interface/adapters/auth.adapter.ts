import axiosInstance from "devnote/config/api/axios-instance";
import { LoginResponse } from "../../core/login.response";
import { HttpError } from "../../core/http-error";
import { handleApiRequest } from "devnote/utils/handle-api-request";
import { VerifyTokenResponse } from "../../core/verify-token.response";

export class AuthAdapter {
  static async login(email: string, password: string): Promise<LoginResponse | HttpError> {
		const body = { email, password };

		return handleApiRequest(() =>
      axiosInstance.post<LoginResponse>("/login", body).then(response => response.data)
    );
  }

  static async verifyToken(): Promise<VerifyTokenResponse | HttpError> {

		return handleApiRequest(() =>
      axiosInstance.get<VerifyTokenResponse>("/user").then(response => response.data)
    );
  }
}
