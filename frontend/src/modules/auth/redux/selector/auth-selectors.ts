import { RootState } from "../../../../redux/store/store";

export const selectAuthState = (state: RootState) => state.auth;

export const selectUser = (state: RootState) => state.auth.user;

export const selectIsLoadingLogin = (state: RootState) => state.auth.isLoadingLogin;

export const selectIsLoadingAuth = (state: RootState) => state.auth.isLoadingAuth;

export const selectIsLoadingSignup = (state: RootState) => state.auth.isLoadingSignup;
