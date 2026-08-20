import { Middleware } from "@reduxjs/toolkit";
import { authActions, loginFailure, loginFinalized, loginSuccess } from "../slice/auth.slice";
import { AuthAdapter } from "../../interface/adapters/auth.adapter";
import { isHttpError } from "../../core/http-error";
import LocalStorage from "devnote/core/local-storage";
import { TOKEN_KEY } from "devnote/core/constants/storage";
import { clearUserData } from "../../../../../lib/sqlite";
import { RootState } from "devnote/redux/store/store";
import { showToast } from "devnote/modules/shared/redux/slice/toast.slice";

export const loginFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (authActions.loginRequest.match(action)) {
    const response = await AuthAdapter.login(action.payload.username, action.payload.password);
    if (isHttpError(response)) {
      api.dispatch(loginFailure(response.message));
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

export const signupFlowMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (authActions.signupRequest.match(action)) {
    const { name, email, password, passwordConfirmation } = action.payload;
    const response = await AuthAdapter.register(name, email, password, passwordConfirmation);
    if (isHttpError(response)) {
      api.dispatch(authActions.signupFailure(response.message));
    } else {
      LocalStorage.setItem(TOKEN_KEY, response.token);
      api.dispatch(authActions.signupSuccess(response.user));
    }
    api.dispatch(authActions.signupFinalized());
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const logoutFlowMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (authActions.logoutRequest.match(action)) {
    const state = api.getState();
    const userId = state.auth.user?.id;

    await clearUserData();

    if (userId) {
      LocalStorage.removeItem(`last_synced_${userId}`);
    }
    LocalStorage.removeItem(TOKEN_KEY);

    api.dispatch(authActions.logoutSuccess());
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const loginFailureMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (authActions.loginFailure.match(action)) {
    api.dispatch(showToast({ type: "error", message: action.payload || "Login failed" }));
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const signupFailureMiddleware: Middleware<{}, RootState> = (api) => next => async action => {
  next(action);

  if (authActions.signupFailure.match(action)) {
    api.dispatch(showToast({ type: "error", message: action.payload || "Signup failed" }));
  }
};
