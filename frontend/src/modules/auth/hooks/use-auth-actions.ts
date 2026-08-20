import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store/store";
import { loginRequest, logoutRequest, signupRequest, verifyTokenRequest } from "../redux/slice/auth.slice";

export const useAuthActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  const login = (username: string, password: string) => {
    dispatch(loginRequest({ username, password }));
  };

  const verifyToken = () => {
    dispatch(verifyTokenRequest());
  };

  const logout = () => {
    dispatch(logoutRequest());
  };

  const signup = (name: string, email: string, password: string, passwordConfirmation: string) => {
    dispatch(signupRequest({ name, email, password, passwordConfirmation }));
  };

  return {
    login,
    logout,
    signup,
    verifyToken
  };
};
