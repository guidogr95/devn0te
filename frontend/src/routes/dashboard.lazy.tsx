import { createLazyFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardLayout } from "devnote/layouts/dashboard-layout";
import { ProtectedRoute } from "devnote/modules/auth/ui/protected-route/protected-route";

export const Route = createLazyFileRoute("/dashboard")({
  component: () => 
		<ProtectedRoute>
			<DashboardLayout>
				<Outlet/>
			</DashboardLayout>
		</ProtectedRoute>
});
