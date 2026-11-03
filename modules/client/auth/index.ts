import cookies from "js-cookie";
export const AUTH_TOKEN = "AUTH_TOKEN";

export const getAuthToken = (): string => {
  if (usingLocalAuth()) {
    return localStorage.getItem(AUTH_TOKEN) ?? "";
  }
  return cookies.get("app-jwt-cookie") ?? "";
};

export const setAuthToken = (authToken: string) => {
  return localStorage.setItem(AUTH_TOKEN, authToken);
};

export const clearAuthToken = () => {
  cookies.remove("app-jwt-cookie");
  return localStorage.removeItem(AUTH_TOKEN);
};

export const usingLocalAuth = (): boolean => {
  return process.env.AUTH_LOCAL === "true" ? true : false;
};
