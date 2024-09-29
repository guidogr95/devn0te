import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserEntity } from "../../core/entities/user-entity";
import { HttpError } from "../../core/http-error";
import { VerifyTokenResponse } from "../../core/verify-token.response";

type AuthState = {
  user: UserEntity | null
	isLoadingLogin: boolean
  isLoadingAuth: boolean
  error?: string
}

const initialState: AuthState = {
  user: null,
	isLoadingLogin: false,
  isLoadingAuth: true
};

const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    verifyTokenRequest(state) {
      state.isLoadingAuth = true;
    },
    verifyTokenSuccess(state, action: PayloadAction<VerifyTokenResponse>) {
      state.user = action.payload.user;
    },
    verifyTokenFailure(state) {
      state.isLoadingAuth = true;
      state.user = null;
    },
    verifyTokenFinalized(state) {
      state.isLoadingAuth = false;
    },
     
    loginRequest(state, _action: PayloadAction<{ username: string, password: string }>) {
      state.isLoadingLogin = true;
      state.error = "";
    },
    loginSuccess(state, action: PayloadAction<UserEntity>) {
      state.user = action.payload;
    },
    loginFailure(state, action: PayloadAction<HttpError>) {
      state.error = action.payload.message;
    },
    loginFinalized(state) {
      state.isLoadingLogin = false;
    }
  }
});

export const authActions = authSlice.actions;

export const { loginRequest, loginFailure, loginSuccess, loginFinalized, verifyTokenRequest } = authSlice.actions;

export const authReducer = authSlice.reducer;
