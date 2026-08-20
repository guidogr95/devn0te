import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "devnote/redux/store/store";
import {
  checkConnectorHealthRequest,
  checkStaleNotesRequest,
  deleteConnectorRequest,
  removeStaleNotesRequest,
  saveConnectorRequest,
} from "../../redux/slice/connector.slice";
import { CONNECTOR_GITHUB_TOKEN_KEY } from "devnote/core/constants/storage";
import LocalStorage from "devnote/core/local-storage";

export function useConnectorSettings() {
  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector((state: RootState) => state.connector.settings);
  const isSavingConnector = useSelector((state: RootState) => state.connector.isSavingConnector);
  const healthStatus = useSelector((state: RootState) => state.connector.healthStatus);
  const isCheckingHealth = useSelector((state: RootState) => state.connector.isCheckingHealth);
  const lastHealthCheck = useSelector((state: RootState) => state.connector.lastHealthCheck);
  const staleNotes = useSelector((state: RootState) => state.connector.staleNotes);
  const isCheckingStale = useSelector((state: RootState) => state.connector.isCheckingStale);

  const [owner, setOwner] = useState(settings?.type === "github" ? settings.owner : "");
  const [repo, setRepo] = useState(settings?.type === "github" ? settings.repo : "");
  const [branch, setBranch] = useState(settings?.type === "github" ? settings.branch : "main");
  const [token, setToken] = useState(LocalStorage.getItem<string>(CONNECTOR_GITHUB_TOKEN_KEY) ?? "");

  useEffect(() => {
    if (settings?.type === "github") {
      setOwner(settings.owner);
      setRepo(settings.repo);
      setBranch(settings.branch);
    }
  }, [settings]);

  function handleSave() {
    if (token) {
      LocalStorage.setItem(CONNECTOR_GITHUB_TOKEN_KEY, token);
    }
    dispatch(saveConnectorRequest({ type: "github", owner, repo, branch }));
  }

  function handleDelete() {
    dispatch(deleteConnectorRequest("github"));
    LocalStorage.removeItem(CONNECTOR_GITHUB_TOKEN_KEY);
    setOwner("");
    setRepo("");
    setBranch("main");
    setToken("");
  }

  function handleCheckHealth() {
    dispatch(checkConnectorHealthRequest());
  }

  function handleCheckStale() {
    dispatch(checkStaleNotesRequest());
  }

  function handleRemoveStale() {
    dispatch(removeStaleNotesRequest());
  }

  return {
    owner,
    setOwner,
    repo,
    setRepo,
    branch,
    setBranch,
    token,
    setToken,
    isSavingConnector,
    hasExistingConnector: settings !== null,
    healthStatus,
    isCheckingHealth,
    lastHealthCheck,
    staleNotes,
    isCheckingStale,
    handleSave,
    handleDelete,
    handleCheckHealth,
    handleCheckStale,
    handleRemoveStale,
  };
}
