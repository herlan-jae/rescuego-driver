/**
 * @param {string} eyeIconId
 * @param {string} passwordInputId
 * @param {string} eyeOnSrc
 * @param {string} eyeOffSrc
 */

function togglePassword(eyeIconId, passwordInputId, eyeOnSrc, eyeOffSrc) {
  const passwordInput = document.getElementById(passwordInputId);
  const eyeIcon = document.getElementById(eyeIconId);

  if (!passwordInput || !eyeIcon) {
    console.warn(`Element with ID '${passwordInputId}' or '${eyeIconId}' not found.`);
    return;
  }

  const isPassword = passwordInput.getAttribute("type") === "password";
  passwordInput.setAttribute("type", isPassword ? "text" : "password");
  eyeIcon.src = isPassword ? eyeOffSrc : eyeOnSrc;
}

/**
 * @param {string} loginFormId
 * @param {string} emailInputId
 * @param {string} passwordInputI
 * @param {string} errorMsgId
 * @param {string} redirectUrl
 */

function handleLoginFormSubmit(loginFormId, emailInputId, passwordInputId, errorMsgId, redirectUrl) {
  const loginForm = document.getElementById(loginFormId);
  const loginButton = document.getElementById("loginButton");
  const buttonText = document.getElementById("buttonText");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const errorMsg = document.getElementById(errorMsgId);

  if (!loginForm) {
    console.warn(`Login form with ID '${loginFormId}' not found.`);
    return;
  }

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById(emailInputId)?.value.trim();
    const password = document.getElementById(passwordInputId)?.value.trim();

    if (errorMsg) errorMsg.classList.add("hidden");

    if (!email || !password) {
      const msg = "Email dan password tidak boleh kosong.";
      if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove("hidden");
      }
      showSnackbar(msg, "error");
      return;
    }

    if (buttonText) buttonText.classList.add("hidden");
    if (loadingSpinner) loadingSpinner.classList.remove("hidden");
    if (loginButton) loginButton.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.tokens.access);
        if (data.tokens.refresh) {
          localStorage.setItem("refreshToken", data.tokens.refresh);
        }

        showSnackbar("Login berhasil!", "success");
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      } else {
        let errorMessage = data.detail || Object.values(data).flat().join(" ") || "Login gagal. Periksa kembali kredensial Anda.";
        if (errorMsg) {
          errorMsg.textContent = errorMessage;
          errorMsg.classList.remove("hidden");
        }
        showSnackbar(errorMessage, "error");
      }
    } catch (error) {
      const msg = "Terjadi masalah pada jaringan atau server. Silakan coba lagi.";
      if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove("hidden");
      }
      showSnackbar(msg, "error");
      console.error("Login error:", error);
    } finally {
      if (buttonText) buttonText.classList.remove("hidden");
      if (loadingSpinner) loadingSpinner.classList.add("hidden");
      if (loginButton) loginButton.disabled = false;
    }
  });
}

/**
 * @param {string} formId
 * @param {string} usernameId
 * @param {string} firstNameId
 * @param {string} lastNameId
 * @param {string} emailId
 * @param {string} cityId
 * @param {string} phoneNumberId
 * @param {string} passwordId
 * @param {string} confirmPasswordId
 * @param {string} errorMsgId
 * @param {string} redirectUrl
 */

function handleRegisterFormSubmit(formId, usernameId, firstNameId, lastNameId, emailId, cityId, phoneNumberId, passwordId, confirmPasswordId, errorMsgId, redirectUrl) {
  const registerForm = document.getElementById(formId);
  const registerButton = document.getElementById("registerButton");
  const buttonText = document.getElementById("buttonText");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const errorMsg = document.getElementById(errorMsgId);

  if (!registerForm) {
    console.warn(`Register form with ID '${formId}' not found.`);
    return;
  }

  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById(usernameId)?.value.trim();
    const first_name = document.getElementById(firstNameId)?.value.trim();
    const last_name = document.getElementById(lastNameId)?.value.trim();
    const email = document.getElementById(emailId)?.value.trim();
    const city = document.getElementById(cityId)?.value.trim();
    const phone_number = document.getElementById(phoneNumberId)?.value.trim();
    const password = document.getElementById(passwordId)?.value.trim();
    const password_confirm = document.getElementById(confirmPasswordId)?.value.trim();

    if (errorMsg) errorMsg.classList.add("hidden");

    if (!username || !first_name || !email || !city || !password || !password_confirm) {
      const msg = "Semua kolom yang wajib (*), harus diisi.";
      if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove("hidden");
      }
      showSnackbar("Lengkapi semua kolom wajib.", "error");
      return;
    }

    if (password !== password_confirm) {
      const msg = "Password dan konfirmasi password tidak cocok.";
      if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove("hidden");
      }
      showSnackbar(msg, "error");
      return;
    }

    if (buttonText) buttonText.classList.add("hidden");
    if (loadingSpinner) loadingSpinner.classList.remove("hidden");
    if (registerButton) registerButton.disabled = true;

    try {
      const payload = {
        username,
        first_name,
        last_name: last_name || "",
        email,
        city,
        phone_number,
        password,
        password_confirm,
      };

      const response = await fetch(`${API_BASE_URL}/accounts/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Registrasi berhasil! Anda akan diarahkan...", "success");
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1500);
      } else {
        let errorMessage = "Registrasi gagal. ";
        if (data && typeof data === "object") {
          errorMessage += Object.values(data).flat().join(" ");
        } else if (data) {
          errorMessage += data.toString();
        } else {
          errorMessage += "Terjadi kesalahan yang tidak diketahui.";
        }

        if (errorMsg) {
          errorMsg.textContent = errorMessage;
          errorMsg.classList.remove("hidden");
        }
        showSnackbar(errorMessage, "error");
      }
    } catch (error) {
      const msg = "Terjadi masalah pada jaringan atau server.";
      if (errorMsg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove("hidden");
      }
      showSnackbar(msg, "error");
      console.error("Register error:", error);
    } finally {
      if (buttonText) buttonText.classList.remove("hidden");
      if (loadingSpinner) loadingSpinner.classList.add("hidden");
      if (registerButton) registerButton.disabled = false;
    }
  });
}
