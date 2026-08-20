import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConnectorSettings } from "../../core/sync-connector";
import { ConnectorApiEntry } from "../../core/connector-api-response";
import { CONNECTOR_SETTINGS_KEY } from "devnote/core/constants/storage";
import LocalStorage from "devnote/core/local-storage";

type ConnectorState = {
  settings: ConnectorSettings | null
  isLoadingConnectors: boolean
  isSavingConnector: boolean
  healthStatus: "unknown" | "healthy" | "unhealthy"
  isCheckingHealth: boolean
  lastHealthCheck: string | null
  staleNotes: { connectorId: string; title: string }[] | null
  isCheckingStale: boolean
}

const initialState: ConnectorState = {
  settings: LocalStorage.getItem<ConnectorSettings>(CONNECTOR_SETTINGS_KEY),
  isLoadingConnectors: false,
  isSavingConnector: false,
  healthStatus: "unknown",
  isCheckingHealth: false,
  lastHealthCheck: null,
  staleNotes: null,
  isCheckingStale: false,
};

const connectorSlice = createSlice({
  name: "connector",
  initialState,
  reducers: {
    setConnectorSettings(state, action: PayloadAction<ConnectorSettings | null>) {
      state.settings = action.payload;
      LocalStorage.setItem(CONNECTOR_SETTINGS_KEY, action.payload);
    },

    fetchConnectorsRequest(state) {
      state.isLoadingConnectors = true;
    },
    fetchConnectorsSuccess(state, action: PayloadAction<ConnectorApiEntry | null>) {
      if (action.payload === null) {
        state.settings = null;
        return;
      }
      const mapped: ConnectorSettings = { type: action.payload.type, ...action.payload.settings };
      state.settings = mapped;
      LocalStorage.setItem(CONNECTOR_SETTINGS_KEY, mapped);
    },
    fetchConnectorsFinalized(state) {
      state.isLoadingConnectors = false;
    },

    saveConnectorRequest(_state, _action: PayloadAction<ConnectorSettings>) {
    },
    saveConnectorSuccess(state, action: PayloadAction<ConnectorApiEntry>) {
      const mapped: ConnectorSettings = { type: action.payload.type, ...action.payload.settings };
      state.settings = mapped;
      LocalStorage.setItem(CONNECTOR_SETTINGS_KEY, mapped);
    },
    saveConnectorFinalized(state) {
      state.isSavingConnector = false;
    },

    deleteConnectorRequest(_state, _action: PayloadAction<string>) {
    },
    deleteConnectorSuccess(state) {
      state.settings = null;
      state.healthStatus = "unknown";
      state.lastHealthCheck = null;
      state.staleNotes = null;
      LocalStorage.removeItem(CONNECTOR_SETTINGS_KEY);
    },

    checkConnectorHealthRequest(state) {
      state.isCheckingHealth = true;
    },
    checkConnectorHealthSuccess(state, action: PayloadAction<boolean>) {
      state.healthStatus = action.payload ? "healthy" : "unhealthy";
      state.lastHealthCheck = new Date().toISOString();
    },
    checkConnectorHealthFinalized(state) {
      state.isCheckingHealth = false;
    },

    checkStaleNotesRequest(state) {
      state.isCheckingStale = true;
    },
    checkStaleNotesSuccess(state, action: PayloadAction<{ connectorId: string; title: string }[]>) {
      state.staleNotes = action.payload;
    },
    checkStaleNotesFinalized(state) {
      state.isCheckingStale = false;
    },
    removeStaleNotesRequest(_state) {
    },
    removeStaleNotesSuccess(state) {
      state.staleNotes = null;
    },
  },
});

export const connectorActions = connectorSlice.actions;
export const {
  setConnectorSettings,
  fetchConnectorsRequest,
  fetchConnectorsSuccess,
  fetchConnectorsFinalized,
  saveConnectorRequest,
  saveConnectorSuccess,
  saveConnectorFinalized,
  deleteConnectorRequest,
  deleteConnectorSuccess,
  checkConnectorHealthRequest,
  checkConnectorHealthSuccess,
  checkConnectorHealthFinalized,
  checkStaleNotesRequest,
  checkStaleNotesSuccess,
  checkStaleNotesFinalized,
  removeStaleNotesRequest,
  removeStaleNotesSuccess,
} = connectorSlice.actions;
export const connectorReducer = connectorSlice.reducer;
