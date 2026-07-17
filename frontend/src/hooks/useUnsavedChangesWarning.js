import { useEffect } from "react";

/**
 * Warns before a reload, tab close, or navigation away from the app while
 * changes are pending.
 *
 * ponytail: covers browser-level navigation only. Blocking in-app route
 * changes needs useBlocker, which requires migrating main.jsx from
 * BrowserRouter to a data router (createBrowserRouter). Not worth it while
 * the editor autosaves and confirms on section switch.
 */
function useUnsavedChangesWarning(when) {
  useEffect(() => {
    if (!when) return undefined;

    function onBeforeUnload(event) {
      event.preventDefault();
      // Legacy browsers require returnValue to be set for the prompt to show.
      event.returnValue = "";
      return "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [when]);
}

export default useUnsavedChangesWarning;
