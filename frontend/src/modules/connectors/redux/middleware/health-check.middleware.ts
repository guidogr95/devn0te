import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "devnote/redux/store/store";
import { getConnector } from "../../interface/connector-factory";
import {
  connectorActions,
  checkConnectorHealthSuccess,
  checkConnectorHealthFinalized,
} from "../slice/connector.slice";

export const healthCheckMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (connectorActions.checkConnectorHealthRequest.match(action)) {
    try {
      const { connector: connectorState } = api.getState() as RootState;
      const connector = getConnector(connectorState.settings);

      if (!connector) {
        api.dispatch(checkConnectorHealthSuccess(false));
        return;
      }

      const healthy = await connector.healthCheck();
      api.dispatch(checkConnectorHealthSuccess(healthy));
    } catch {
      api.dispatch(checkConnectorHealthSuccess(false));
    } finally {
      api.dispatch(checkConnectorHealthFinalized());
    }
  }
};
