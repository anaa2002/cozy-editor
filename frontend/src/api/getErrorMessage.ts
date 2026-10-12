import axios from "axios";

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;
    if (typeof serverMessage === "string" && serverMessage)
      return serverMessage;

    if (!error.response)
      return "Can't reach the server. Check your connection.";
  }
  return fallback;
}
