import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../redux/store/store";
import { loginRequest, verifyTokenRequest } from "../redux/slice/auth.slice";

export const useAuthActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  const login = (username: string, password: string) => {
    dispatch(loginRequest({ username, password }));
  };

  const verifyToken = () => {
    dispatch(verifyTokenRequest());
  };

  return {
    login,
    verifyToken
  };
};
