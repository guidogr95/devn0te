import { useCallback, useEffect, useRef } from "react";
import { useAuthStorage } from "devnote/modules/auth/hooks/use-auth-storage";
import { selectUser } from "devnote/modules/auth/redux/selector/auth-selectors";
import { useSelector } from "react-redux";
import { useNotesDeltaSyncActions } from "../../hooks/use-notes-delta-sync-actions";

export const NotesSyncManager = () => {
  const {
		isAuthenticated
	} = useAuthStorage();
	const user = useSelector(selectUser);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const {
		handleTriggerDeltaSync
	} = useNotesDeltaSyncActions();

	const performDeltaSync = useCallback(() => {
		if (!isAuthenticated || !user) return;
		handleTriggerDeltaSync(user.id);
	}, [handleTriggerDeltaSync, isAuthenticated, user]);

	const startInterval = useCallback(() => {
		if (intervalRef.current) clearInterval(intervalRef.current);
		intervalRef.current = setInterval(performDeltaSync, 5 * 60 * 1000);
	}, [performDeltaSync]);

	// delta sync on load/login/user change
	useEffect(() => {
		performDeltaSync();
	}, [performDeltaSync]);

	useEffect(() => {
    if (!isAuthenticated || !user) return;

    startInterval();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        performDeltaSync();
        startInterval();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, user, performDeltaSync, startInterval]);
  
  return null;
};
