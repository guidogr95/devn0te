import { useSelector } from "react-redux";
import { useAuthStorage } from "../../hooks/use-auth-storage";
import { selectIsLoadingAuth, selectUser } from "../../redux/selector/auth-selectors";
import { useEffect } from "react";
import { useAuthActions } from "../../hooks/use-auth-actions";

export function useProtectedRoute() {
	const isLoadingAuth = useSelector(selectIsLoadingAuth);
	const user = useSelector(selectUser);
  const { verifyToken } = useAuthActions();
	

	const {
		isAuthenticated: isTokenStored
	} = useAuthStorage();

	useEffect(() => {
		verifyToken();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isAuthenticated = isTokenStored && user;

	return {
		isLoadingAuth,
		isAuthenticated
	};
}
