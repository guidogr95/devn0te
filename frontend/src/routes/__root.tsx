import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "devnote/modules";
import { NotesSyncManager } from "devnote/modules/notes/ui/notes-sync-manager/notes-sync-manager";
import { store } from "devnote/redux/store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Outlet />
        <NotesSyncManager />
        {/* <TanStackRouterDevtools /> */}
        <Toaster closeButton={false} />
      </Provider>
    </QueryClientProvider>
    </>
  ),
});
