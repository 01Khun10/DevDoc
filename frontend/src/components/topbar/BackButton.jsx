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
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      type="button"
      title="Go back"
      aria-label="Go back"
      onClick={handleBack}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

export default BackButton;
