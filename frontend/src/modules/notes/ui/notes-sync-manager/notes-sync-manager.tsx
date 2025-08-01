import { useCallback, useEffect } from "react";
import { useAuthStorage } from "devnote/modules/auth/hooks/use-auth-storage";
import { selectUser } from "devnote/modules/auth/redux/selector/auth-selectors";
import { useSelector } from "react-redux";
import { useNotesDeltaSyncActions } from "../../hooks/use-notes-delta-sync-actions";

export const NotesSyncManager = () => {
  const {
		isAuthenticated
	} = useAuthStorage();
	const user = useSelector(selectUser);

	const {
		handleTriggerDeltaSync
	} = useNotesDeltaSyncActions();

	const performDeltaSync = useCallback(() => {
		console.log("called performDeltaSync");

		if (!isAuthenticated || !user) return;

		console.log("running performDeltaSync");

		handleTriggerDeltaSync(user.id);
		
	}, [handleTriggerDeltaSync, isAuthenticated, user]);

	// delta sync on load/login/user change
	useEffect(() => {
		performDeltaSync();
	}, [performDeltaSync]);

	useEffect(() => {
    if (!isAuthenticated || !user) return;

    const intervalId = setInterval(performDeltaSync, 5 * 60 * 1000);  // 5 mins

    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performDeltaSync]);
  
  return null;
};
