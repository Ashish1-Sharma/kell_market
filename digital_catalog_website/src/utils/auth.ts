import { authConstants } from "./constants";

export const isAuthenticated = (): boolean => {
  const auth = localStorage.getItem(authConstants.IS_AUTHENTICATED);
  const expiry = localStorage.getItem(authConstants.EXPIRY_TIME);

  if (auth === "true" && expiry) {
    return Date.now() < Number(expiry);
  }

  return false;
};
