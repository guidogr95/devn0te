import { useEffect } from "react";

export function useBeforeUnloadGuard(shouldGuard: boolean) {
  useEffect(() => {
    if (!shouldGuard) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [shouldGuard]);
}
