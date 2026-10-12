import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import FullPageLoader from "./FullPageLoader";

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;
  if (user) return <Navigate to="/projects" replace />;

  return <>{children}</>;
}

export default PublicOnlyRoute;
