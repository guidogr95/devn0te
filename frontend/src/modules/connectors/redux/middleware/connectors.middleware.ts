import { Middleware } from "@reduxjs/toolkit";
import { authActions } from "devnote/modules/auth/redux/slice/auth.slice";
import { ConnectorsAdapter } from "../../interface/adapters/connectors.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";
import {
  connectorActions,
  fetchConnectorsFinalized,
  fetchConnectorsSuccess,
  saveConnectorSuccess,
  saveConnectorFinalized,
  deleteConnectorSuccess,
  checkConnectorHealthRequest,
} from "../slice/connector.slice";
import { getLocalNotesRequest } from "devnote/modules/notes/redux/slice/notes.slice";

export const fetchConnectorsMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (
    authActions.loginSuccess.match(action) ||
    authActions.verifyTokenSuccess.match(action)
  ) {
    api.dispatch(connectorActions.fetchConnectorsRequest());
    api.dispatch(getLocalNotesRequest());
  }

  if (connectorActions.fetchConnectorsRequest.match(action)) {
    try {
      const response = await ConnectorsAdapter.getConnectors();

      if (isHttpError(response)) {
        return;
      }

      const githubConnector = response.connectors.find(c => c.type === "github") ?? null;
      api.dispatch(fetchConnectorsSuccess(githubConnector));

      if (githubConnector) {
        api.dispatch(checkConnectorHealthRequest());
      }
    } finally {
      api.dispatch(fetchConnectorsFinalized());
    }
  }
};

export const saveConnectorMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (connectorActions.saveConnectorRequest.match(action)) {
    try {
      const settings = action.payload;
      const response = await ConnectorsAdapter.saveConnector(settings.type, settings);

      if (isHttpError(response)) {
        return;
      }

      api.dispatch(saveConnectorSuccess(response.connector));
      api.dispatch(checkConnectorHealthRequest());
    } finally {
      api.dispatch(saveConnectorFinalized());
    }
  }
};

export const deleteConnectorMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (connectorActions.deleteConnectorRequest.match(action)) {
    const type = action.payload;
    const response = await ConnectorsAdapter.deleteConnector(type);

    if (isHttpError(response)) {
      return;
    }

    api.dispatch(deleteConnectorSuccess());
  }
};
