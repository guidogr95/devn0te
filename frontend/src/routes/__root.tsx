import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "devnote/modules";
import { store } from "devnote/redux/store/store";
import { Provider } from "react-redux";

export const Route = createRootRoute({
  component: () => (
    <>
      <Provider store={store}>
        <Outlet />
        <TanStackRouterDevtools />
        <Toaster closeButton={false} />
      </Provider>
    </>
  ),
});
