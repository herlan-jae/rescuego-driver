// const API_BASE_URL = "http://localhost:8000";
// const API_BASE_URL = "http://1277.0.0.1:8000";
const API_BASE_URL = "https://herlanjae.pythonanywhere.com";

/**
 * @param {string} message
 * @param {string} type
 * @param {string} [title='']
 * @param {number} [duration=3000]
 */

function showSnackbar(message, type = "info", title = "", duration = 3000) {
  const snackbar = document.getElementById("snackbar");
  const snackbarIcon = document.getElementById("snackbarIcon");
  const snackbarTitle = document.getElementById("snackbarTitle");
  const snackbarMessage = document.getElementById("snackbarMessage");
  const snackbarCloseBtn = document.getElementById("snackbarCloseBtn");

  if (!snackbar || !snackbarIcon || !snackbarTitle || !snackbarMessage || !snackbarCloseBtn) {
    console.warn("One or more snackbar elements not found. Please check HTML IDs.");
    return;
  }

  snackbar.style.visibility = "visible";
  snackbar.classList.remove("show");

  snackbarMessage.textContent = message;

  let iconHtml = "";
  if (!title) {
    switch (type) {
      case "success":
        title = "Berhasil!";
        iconHtml = "&#10004;";
        break;
      case "error":
        title = "Terjadi Kesalahan";
        iconHtml = "!";
        break;
      case "info":
      default:
        title = "Perhatian Dibutuhkan";
        iconHtml = "i";
        break;
    }
  } else {
    switch (type) {
      case "success":
        iconHtml = "&#10004;";
        break;
      case "error":
        iconHtml = "!";
        break;
      case "info":
      default:
        iconHtml = "i";
        break;
    }
  }

  snackbarTitle.textContent = title;
  snackbarIcon.innerHTML = iconHtml;

  snackbar.classList.remove("success", "error", "info");
  snackbar.classList.add(type);

  setTimeout(() => {
    snackbar.classList.add("show");
  }, 10);

  if (snackbar.hideTimeout) {
    clearTimeout(snackbar.hideTimeout);
  }

  snackbar.hideTimeout = setTimeout(function () {
    hideSnackbar();
  }, duration);

  snackbarCloseBtn.onclick = null;

  snackbarCloseBtn.onclick = () => {
    hideSnackbar();
  };

  function hideSnackbar() {
    if (snackbar.hideTimeout) {
      clearTimeout(snackbar.hideTimeout);
      snackbar.hideTimeout = null;
    }

    snackbar.classList.remove("show");

    setTimeout(() => {
      if (!snackbar.classList.contains("show")) {
        snackbar.style.visibility = "hidden";
      }
    }, 400);
  }
}
