import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

export function useLogout() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Logged out. See you soon! 🌸");
    } catch {
      toast.warning("Logged out here, but the server didn't confirm.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return { handleLogout, isLoggingOut };
}
