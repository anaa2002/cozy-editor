import { Feather } from "lucide-react";
import { Link } from "react-router-dom";

function Brand({ to = "/projects" }: { to?: string }) {
  return (
    <Link to={to} className="brand" aria-label="Cozy Editor home">
      <Feather className="brand__icon" aria-hidden />
      <span>
        <span className="brand__name">Cozy Editor</span>
        <span className="brand__tagline">Your stories. Remembered.</span>
      </span>
    </Link>
  );
}

export default Brand;
