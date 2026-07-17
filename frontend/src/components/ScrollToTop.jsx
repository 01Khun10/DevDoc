import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Resets scroll on forward navigation. POP (back/forward) is left alone so the
 * browser can restore the previous scroll position.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, navigationType]);

  return null;
}

export default ScrollToTop;
