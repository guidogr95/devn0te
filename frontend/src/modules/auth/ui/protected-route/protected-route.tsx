import { PropsWithChildren } from "react";
import { FileRoutesByPath } from "@tanstack/react-router";
import { useProtectedRoute } from "./use-protected-route";
import { Routes } from "devnote/config/routing/routing";
import { AppLoader } from "devnote/modules/shared/ui/app-loader/app-loader";

type Props = PropsWithChildren<{
  isHideWhenAuthenticated?: boolean
}>

const loginPath: FileRoutesByPath["/login"]["fullPath"] = Routes.login.path;
const dashboardPath: FileRoutesByPath["/dashboard"]["fullPath"] = Routes.dashboard.path;

const hideWhenAuthenticatedRoutes: string[] = [
  loginPath
];

const authProtectedRoutes: string[] = [
  dashboardPath
];

function isAuthProtectedRoute(path: string) {
  return authProtectedRoutes.some(route => path.includes(route));
}

export const ProtectedRoute = ({ children, isHideWhenAuthenticated }: Props) => {
  const {
    isAuthenticated,
    isLoadingAuth
  } = useProtectedRoute();

  if (isLoadingAuth) {
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-bg-primary">
        <AppLoader/>
      </div>
    );
  }

  if (!isAuthenticated && !isAuthProtectedRoute(window.location.pathname)) {
    return <>{children}</>;
  }

  if (!isAuthenticated && isAuthProtectedRoute(window.location.pathname)) {
    window.location.href = loginPath;
    return null;
  }

  if (isHideWhenAuthenticated && isAuthenticated && hideWhenAuthenticatedRoutes.includes(window.location.pathname)) {
    window.location.href = dashboardPath;
    return null;
  }

	return <>{children}</>;
};
