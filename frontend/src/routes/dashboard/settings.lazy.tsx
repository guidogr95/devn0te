import { createLazyFileRoute } from "@tanstack/react-router";
import { ConnectorSettings } from "devnote/modules/connectors/ui/connector-settings";

export const Route = createLazyFileRoute("/dashboard/settings")({
  component: () => <ConnectorSettings />,
});
