/**
 * Universal API Fetch Helper
 * @param {string} url - The full URL to fetch.
 * @param {object} options - Fetch options (method, body, etc.).
 * @param {string} redirectUrl - URL to redirect to on authentication failure.
 * @returns {Promise<object | void>} - The JSON response or void for empty responses.
 * @throws {Error} - Throws an error on network failure or non-ok response.
 */

async function apiFetch(url, options = {}, redirectUrl = "login_screen.html") {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    showSnackbar("Sesi Anda telah berakhir. Silakan login kembali.", "error");
    setTimeout(() => (window.location.href = redirectUrl), 1500);
    throw new Error("No access token found.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 204 || response.status === 205) {
      return;
    }

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      showSnackbar("Sesi Anda tidak valid. Silakan login kembali.", "error");
      setTimeout(() => (window.location.href = redirectUrl), 1500);
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      let errorMessage = `Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || Object.values(errorData).flat().join("; ");
      } catch (jsonError) {
        console.warn("Could not parse error response as JSON.");
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Fetch Error to ${url}:`, error);
    throw error;
  }
}
