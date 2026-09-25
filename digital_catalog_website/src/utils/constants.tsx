export const BASE_URL = "https://api.kellplus.com/CatalogMakerPro";
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const authConstants = {
  IS_AUTHENTICATED: "isAuthenticated",
  USER_DATA: "userData",
  EXPIRY_TIME: "expiryTime",
  USER_TYPE: "userType",
};