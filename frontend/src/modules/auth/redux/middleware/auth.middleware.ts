import { Middleware } from "@reduxjs/toolkit";
import { authActions, loginFailure, loginFinalized, loginSuccess } from "../slice/auth.slice";
import { AuthAdapter } from "../../interface/adapters/auth.adapter";
import { isHttpError } from "../../core/http-error";
import LocalStorage from "devnote/core/local-storage";
import { TOKEN_KEY } from "devnote/core/constants/storage";

export const loginFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (authActions.loginRequest.match(action)) {
    const response = await AuthAdapter.login(action.payload.username, action.payload.password);
    if (isHttpError(response)) {
      api.dispatch(loginFailure(response));
    } else {
      LocalStorage.setItem(TOKEN_KEY, response.token);
      api.dispatch(loginSuccess(response.user));
    }
    api.dispatch(loginFinalized());
  }
};

export const verifyTokenFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (authActions.verifyTokenRequest.match(action)) {
    const response = await AuthAdapter.verifyToken();
    if (isHttpError(response)) {
      api.dispatch(authActions.verifyTokenFailure());
      LocalStorage.removeItem(TOKEN_KEY);
    } else {
      api.dispatch(authActions.verifyTokenSuccess(response));
    }
    api.dispatch(authActions.verifyTokenFinalized());
  }
};
