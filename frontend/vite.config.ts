import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// File-change events don't reach WSL for projects on the Windows drive (/mnt/c),
// so poll for changes there.
const isWsl = Boolean(process.env.WSL_DISTRO_NAME);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: isWsl ? { usePolling: true, interval: 300 } : undefined,
  },
});
