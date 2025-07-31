document.addEventListener("DOMContentLoaded", () => {
  if (typeof API_BASE_URL === "undefined" || typeof showSnackbar === "undefined" || typeof apiFetch === "undefined") {
    console.error("Dependency JavaScript tidak ditemukan.");
    return;
  }

  const LOGIN_REDIRECT_URL = "../auth/login_screen.html";
  const PROFILE_API_ENDPOINT = `${API_BASE_URL}/accounts/api/driver/profile/`;
  const AMBULANCE_API_BASE_URL = `${API_BASE_URL}/ambulances/api/`;
  const MAINTENANCE_API_ENDPOINT = `${API_BASE_URL}/maintenance/api/create/`;
  const vehicleDetailsContainer = document.getElementById("vehicle-details");
  const statusSelect = document.getElementById("status");
  const saveStatusBtn = document.getElementById("saveStatusBtn");
  const maintenanceModal = document.getElementById("maintenanceModal");
  const maintenanceForm = document.getElementById("maintenanceForm");
  const cancelMaintenanceBtn = document.getElementById("cancelMaintenanceBtn");

  let currentAmbulance = null;
  let initialStatus = null;

  const showModal = (modal) => modal?.classList.remove("hidden");
  const closeModal = (modal) => modal?.classList.add("hidden");

  const populateVehicleForm = (ambulanceData) => {
    document.getElementById("license_plate").value = ambulanceData.license_plate || "-";
    document.getElementById("brand").value = ambulanceData.brand || "-";
    document.getElementById("model").value = ambulanceData.model || "-";
    document.getElementById("year").value = ambulanceData.year || "-";
    document.getElementById("type").value = ambulanceData.ambulance_type_display || "-";
    document.getElementById("capacity").value = ambulanceData.capacity || "-";
    document.getElementById("city").value = ambulanceData.base_location || "-";
    document.getElementById("equipment").value = ambulanceData.equipment_list || "-";
    statusSelect.value = ambulanceData.status;
    initialStatus = ambulanceData.status;
  };

  const showVehicleDetails = (shouldShow) => {
    const detailsAndStatus = document.querySelector(".bg-white.p-6.rounded-lg");
    if (shouldShow) {
      detailsAndStatus.style.display = "block";
      const existingMessage = document.getElementById("no-vehicle-message");
      if (existingMessage) existingMessage.remove();
    } else {
      detailsAndStatus.style.display = "none";
      if (!document.getElementById("no-vehicle-message")) {
        const noVehicleMessage = document.createElement("div");
        noVehicleMessage.id = "no-vehicle-message";
        noVehicleMessage.className = "bg-white p-6 rounded-lg shadow-xl text-center text-gray-600";
        noVehicleMessage.textContent = "Tidak ada ambulans yang ditugaskan untuk Anda.";
        detailsAndStatus.parentElement.appendChild(noVehicleMessage);
      }
    }
  };

  const loadVehicleData = async () => {
    saveStatusBtn.disabled = true;
    statusSelect.disabled = true;
    try {
      const profileData = await apiFetch(PROFILE_API_ENDPOINT, {}, LOGIN_REDIRECT_URL);
      const assignedVehicle = profileData.assigned_vehicle;
      if (!assignedVehicle || !assignedVehicle.id) {
        showVehicleDetails(false);
        return;
      }
      showVehicleDetails(true);
      const ambulanceData = await apiFetch(`${AMBULANCE_API_BASE_URL}${assignedVehicle.id}/`, {}, LOGIN_REDIRECT_URL);
      currentAmbulance = ambulanceData;
      populateVehicleForm(ambulanceData);
      statusSelect.disabled = false;
    } catch (error) {
      showSnackbar(error.message || "Gagal memuat data kendaraan.", "error");
      showVehicleDetails(false);
    }
  };

  saveStatusBtn.addEventListener("click", async () => {
    const newStatus = statusSelect.value;
    if (newStatus === initialStatus) return;

    if (newStatus === "under_maintenance") {
      showModal(maintenanceModal);
      return;
    }

    try {
      await apiFetch(`${AMBULANCE_API_BASE_URL}${currentAmbulance.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      initialStatus = newStatus;
      saveStatusBtn.disabled = true;
      showSnackbar("Status ambulans berhasil diperbarui!", "success");
    } catch (error) {
      showSnackbar(error.message || "Gagal memperbarui status.", "error");
      statusSelect.value = initialStatus;
    }
  });

  maintenanceForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const description = document.getElementById("maintenanceDescription").value;
    if (!description.trim()) {
      showSnackbar("Keterangan tidak boleh kosong.", "error");
      return;
    }

    try {
      await apiFetch(MAINTENANCE_API_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({ ambulance: currentAmbulance.id, description }),
      });
      await apiFetch(`${AMBULANCE_API_BASE_URL}${currentAmbulance.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: "under_maintenance" }),
      });

      initialStatus = "under_maintenance";
      saveStatusBtn.disabled = true;
      closeModal(maintenanceModal);
      maintenanceForm.reset();
      showSnackbar("Laporan kerusakan berhasil dikirim!", "success");
    } catch (error) {
      showSnackbar(error.message || "Gagal mengirim laporan.", "error");
    }
  });

  statusSelect.addEventListener("change", () => {
    saveStatusBtn.disabled = statusSelect.value === initialStatus;
  });

  cancelMaintenanceBtn.addEventListener("click", () => {
    closeModal(maintenanceModal);
    statusSelect.value = initialStatus;
    saveStatusBtn.disabled = true;
    maintenanceForm.reset();
  });

  loadVehicleData();
});
