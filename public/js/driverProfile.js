document.addEventListener("DOMContentLoaded", () => {
  if (typeof API_BASE_URL === "undefined" || typeof showSnackbar === "undefined" || typeof apiFetch === "undefined") {
    console.error("Dependency JavaScript tidak ditemukan.");
    return;
  }

  const API_PROFILE_URL = `${API_BASE_URL}/accounts/api/driver/profile/`;
  const LOGIN_REDIRECT_URL = "../views/login_screen.html";

  const profileForm = document.getElementById("profileForm");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const profileNameDisplay = document.getElementById("profile-name");
  const profileEmailDisplay = document.getElementById("profile-email");

  let initialProfileData = {};

  const inputs = {
    username: document.getElementById("username"),
    full_name: document.getElementById("full_name"),
    email: document.getElementById("email"),
    phone_number: document.getElementById("phone_number"),
    driver_license_number: document.getElementById("driver_license_number"),
    city: document.getElementById("city"),
    status: document.getElementById("status"),
    address: document.getElementById("address"),
    emergency_contact_name: document.getElementById("emergency_contact_name"),
    emergency_contact_phone: document.getElementById("emergency_contact_phone"),
  };

  const populateForm = (data) => {
    const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim();

    profileNameDisplay.textContent = fullName || data.username || "Driver";
    profileEmailDisplay.textContent = data.email || "N/A";

    inputs.username.value = data.username || "";
    inputs.email.value = data.email || "";
    inputs.full_name.value = fullName;
    inputs.phone_number.value = data.phone_number || "";
    inputs.driver_license_number.value = data.driver_license_number || "";
    inputs.city.value = data.city || "";
    inputs.status.value = data.status || "available";
    inputs.address.value = data.address || "";
    inputs.emergency_contact_name.value = data.emergency_contact_name || "";
    inputs.emergency_contact_phone.value = data.emergency_contact_phone || "";

    initialProfileData = {
      full_name: fullName,
      phone_number: data.phone_number || "",
      driver_license_number: data.driver_license_number || "",
      city: data.city || "",
      status: data.status || "available",
      address: data.address || "",
      emergency_contact_name: data.emergency_contact_name || "",
      emergency_contact_phone: data.emergency_contact_phone || "",
    };

    checkForChanges();
  };

  const loadProfileData = async () => {
    saveBtn.disabled = true;
    cancelBtn.disabled = true;
    try {
      const data = await apiFetch(API_PROFILE_URL, {}, LOGIN_REDIRECT_URL);
      populateForm(data);
    } catch (error) {
      showSnackbar(error.message || "Gagal memuat data profil.", "error");
    }
  };

  const checkForChanges = () => {
    const currentData = {
      full_name: inputs.full_name.value,
      phone_number: inputs.phone_number.value,
      driver_license_number: inputs.driver_license_number.value,
      city: inputs.city.value,
      status: inputs.status.value,
      address: inputs.address.value,
      emergency_contact_name: inputs.emergency_contact_name.value,
      emergency_contact_phone: inputs.emergency_contact_phone.value,
    };
    const hasChanged = JSON.stringify(initialProfileData) !== JSON.stringify(currentData);
    saveBtn.disabled = !hasChanged;
    cancelBtn.disabled = !hasChanged;
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const fullName = inputs.full_name.value.trim();
    const nameParts = fullName.split(" ");
    const firstName = nameParts.shift() || "";
    const lastName = nameParts.join(" ") || "";

    const dataToUpdate = {
      first_name: firstName,
      last_name: lastName,
      phone_number: inputs.phone_number.value,
      driver_license_number: inputs.driver_license_number.value,
      city: inputs.city.value,
      status: inputs.status.value,
      address: inputs.address.value,
      emergency_contact_name: inputs.emergency_contact_name.value,
      emergency_contact_phone: inputs.emergency_contact_phone.value,
    };

    saveBtn.disabled = true;
    try {
      await apiFetch(
        API_PROFILE_URL,
        {
          method: "PATCH",
          body: JSON.stringify(dataToUpdate),
        },
        LOGIN_REDIRECT_URL
      );
      showSnackbar("Perubahan berhasil disimpan!", "success");
    } catch (error) {
      showSnackbar(error.message || "Gagal menyimpan perubahan.", "error");
    } finally {
      saveBtn.disabled = false;
      checkForChanges();
    }
  };

  profileForm.addEventListener("submit", handleSaveProfile);
  Object.values(inputs).forEach((input) => input?.addEventListener("input", checkForChanges));
  cancelBtn.addEventListener("click", () => {
    populateForm({ ...initialProfileData, username: inputs.username.value, email: inputs.email.value });
    showSnackbar("Perubahan dibatalkan.", "info");
  });

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    const confirmationModal = document.getElementById("confirmationModal");
    document.getElementById("confirm-title").textContent = "Konfirmasi Logout";
    document.getElementById("confirm-message").textContent = "Apakah Anda yakin ingin keluar?";
    document.getElementById("confirm-ok-btn").textContent = "Ya, Logout";
    confirmationModal.classList.remove("hidden");

    const handleConfirm = async () => {
      confirmationModal.classList.add("hidden");
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          await apiFetch(`${API_BASE_URL}/accounts/api/logout/`, {
            method: "POST",
            body: JSON.stringify({ refresh: refreshToken }),
          });
        }
      } catch (error) {
        console.error("Gagal blacklist token di server, tapi tetap logout.", error);
      } finally {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        showSnackbar("Anda telah berhasil logout.", "success");
        setTimeout(() => (window.location.href = LOGIN_REDIRECT_URL), 1000);
        cleanup();
      }
    };
    const handleCancel = () => {
      confirmationModal.classList.add("hidden");
      cleanup();
    };
    const cleanup = () => {
      document.getElementById("confirm-ok-btn").removeEventListener("click", handleConfirm);
      document.getElementById("confirm-cancel-btn").removeEventListener("click", handleCancel);
    };
    document.getElementById("confirm-ok-btn").addEventListener("click", handleConfirm, { once: true });
    document.getElementById("confirm-cancel-btn").addEventListener("click", handleCancel, { once: true });
  });

  loadProfileData();
});
