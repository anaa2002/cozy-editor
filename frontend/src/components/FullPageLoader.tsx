import { Feather } from "lucide-react";

function FullPageLoader({
  label = "Opening your library…",
}: {
  label?: string;
}) {
  return (
    <div className="full-page-loader" role="status">
      <Feather className="full-page-loader__icon" aria-hidden />
      <p>{label}</p>
    </div>
  );
}

export default FullPageLoader;
