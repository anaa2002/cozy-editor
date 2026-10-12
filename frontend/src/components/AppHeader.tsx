import { LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";
import Brand from "./Brand";

function AppHeader() {
  const { user } = useAuth();
  const { handleLogout, isLoggingOut } = useLogout();

  if (!user) return null;

  return (
    <header className="app-header">
      <Brand />
      <div className="app-header__user">
        <span className="avatar" aria-hidden>
          {user.username.charAt(0).toUpperCase()}
        </span>
        <span className="app-header__name">{user.username}</span>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut size={16} aria-hidden />
          {isLoggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
