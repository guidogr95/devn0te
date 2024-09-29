import { createLazyFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "devnote/modules/auth/ui/protected-route/protected-route";
import { LoginPage } from "devnote/modules/login/ui";

export const Route = createLazyFileRoute("/login")({
  component: () => 
    <ProtectedRoute isHideWhenAuthenticated>
      <LoginPage/>
    </ProtectedRoute>
});
