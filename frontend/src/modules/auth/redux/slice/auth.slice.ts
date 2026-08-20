import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserEntity } from "../../core/entities/user-entity";
import { VerifyTokenResponse } from "../../core/verify-token.response";

type AuthState = {
  user: UserEntity | null
	isLoadingLogin: boolean
  isLoadingSignup: boolean
  isLoadingAuth: boolean
  error?: string
}

const initialState: AuthState = {
  user: null,
	isLoadingLogin: false,
  isLoadingSignup: false,
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
    loginFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    loginFinalized(state) {
      state.isLoadingLogin = false;
    },

    signupRequest(state, _action: PayloadAction<{ name: string, email: string, password: string, passwordConfirmation: string }>) {
      state.isLoadingSignup = true;
      state.error = "";
    },
    signupSuccess(state, action: PayloadAction<UserEntity>) {
      state.user = action.payload;
    },
    signupFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    signupFinalized(state) {
      state.isLoadingSignup = false;
    },

    logoutRequest() {},
    logoutSuccess(state) {
      state.user = null;
    }
  }
});

export const authActions = authSlice.actions;

export const { loginRequest, loginFailure, loginSuccess, loginFinalized, verifyTokenRequest, signupRequest, logoutRequest } = authSlice.actions;

export const authReducer = authSlice.reducer;
