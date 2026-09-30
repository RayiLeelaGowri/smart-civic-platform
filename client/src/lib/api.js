const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://smart-civic-platform-tox2.onrender.com/api";

export async function apiRequest(path, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (!token) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw new Error("Please sign in as an administrator.");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Your admin session is invalid or has expired.");
  }

  return response;
}