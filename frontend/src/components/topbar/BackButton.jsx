import { useLocation, useNavigate } from "react-router-dom";

function getProjectIdFromPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "projects" && segments[1]) {
    return segments[1];
  }

  return "";
}

function BackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    const projectId = getProjectIdFromPath(location.pathname);

    if (projectId) {
      navigate(`/projects/${projectId}`);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <button
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-lg font-bold text-slate-600 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
      type="button"
      title="Go back"
      aria-label="Go back"
      onClick={handleBack}
    >
      &lt;
    </button>
  );
}

export default BackButton;
