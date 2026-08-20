import { Middleware } from "@reduxjs/toolkit";
import { configActions, fetchConfigFinalized, fetchConfigSuccess } from "../slice/config.slice";
import { ConfigAdapter } from "../../interface/adapters/config.adapter";
import { isHttpError } from "devnote/modules/auth/core/http-error";

export const fetchConfigMiddleware: Middleware = (api) => next => async action => {
  next(action);

  if (configActions.fetchConfigRequest.match(action)) {
    try {
      const response = await ConfigAdapter.getConfig();

      if (isHttpError(response)) {
        return;
      }

      api.dispatch(fetchConfigSuccess(response.serverSyncEnabled));
    } finally {
      api.dispatch(fetchConfigFinalized());
    }
  }
};
