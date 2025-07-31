document.addEventListener("DOMContentLoaded", () => {
  if (typeof API_BASE_URL === "undefined" || typeof showSnackbar === "undefined" || typeof apiFetch === "undefined") {
    console.error("Dependency JavaScript tidak ditemukan.");
    return;
  }

  const requestListContainer = document.getElementById("requestListContainer");
  const modal = document.getElementById("requestDetailModal");
  const modalBox = document.getElementById("modalBox");
  const closeModalBtn = document.getElementById("closeModal");
  const modalActions = document.getElementById("modal-actions");

  let currentReservationId = null;
  const LOGIN_REDIRECT_URL = "../auth/login_screen.html";

  const getStatusDisplayName = (status) =>
    ({
      pending: "Pending",
      accepted: "Diterima",
      on_the_way: "Menuju Lokasi",
      arrived_at_location: "Tiba di Lokasi",
      picking_up: "Menjemput Pasien",
      en_route_to_hospital: "Menuju RS",
      arrived_at_hospital: "Tiba di RS",
      completed: "Selesai",
      cancelled: "Dibatalkan",
    }[status] || status);

  const loadRequests = async () => {
    requestListContainer.innerHTML = `<div class="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">Memuat permintaan...</div>`;
    try {
      const data = await apiFetch(`${API_BASE_URL}/reservations/api/`, {}, LOGIN_REDIRECT_URL);
      const requests = data.results || data || [];
      if (requests.length === 0) {
        requestListContainer.innerHTML = `<div class="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">Tidak ada permintaan saat ini.</div>`;
        return;
      }
      requestListContainer.innerHTML = "";
      requests.forEach((req) => {
        const card = document.createElement("button");
        card.className = `bg-white p-6 rounded-lg shadow-md border-l-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full text-left transition hover:shadow-lg`;
        card.dataset.id = req.id;
        card.innerHTML = `
        <div class="flex-grow">
            <p class="font-semibold text-xl text-gray-800 mb-1">Pasien: ${req.patient_name || "N/A"}</p>
            <p class="text-base text-gray-700">Tujuan: ${req.destination_address || "N/A"}</p> <p class="text-sm text-blue-600 font-medium mt-1">Status: ${getStatusDisplayName(req.status)}</p>
        </div>
          <span class="px-5 py-2 bg-[#5B2EFF] text-white rounded-md text-base font-semibold w-full sm:w-auto mt-2 sm:mt-0">Lihat Detail</span>
        `;
        requestListContainer.appendChild(card);
      });
    } catch (error) {
      showSnackbar(error.message || "Gagal memuat permintaan.", "error");
      requestListContainer.innerHTML = `<div class="bg-white p-6 rounded-lg shadow-sm text-center text-red-500">Gagal memuat permintaan. Coba lagi nanti.</div>`;
    }
  };

  const showDetailModal = async (reservationId) => {
    currentReservationId = reservationId;
    const modalContent = document.getElementById("modal-content");
    const modalActions = document.getElementById("modal-actions");

    if (!modalContent || !modalActions) {
      console.error("Elemen modal content atau actions tidak ditemukan!");
      return;
    }

    modalContent.innerHTML = `<div class="text-center text-gray-500">Memuat detail...</div>`;
    modalActions.innerHTML = "";

    modal.classList.remove("hidden");

    setTimeout(() => {
      modalBox.classList.remove("opacity-0", "scale-95");
    }, 10);

    try {
      const detail = await apiFetch(`${API_BASE_URL}/reservations/api/${reservationId}/`, {}, LOGIN_REDIRECT_URL);

      modalContent.innerHTML = `
            <div>
                <h3 class="text-lg font-bold border-b pb-2 mb-2">Informasi Pasien</h3>
                <p><span class="font-semibold w-28 inline-block">Nama:</span> ${detail.patient_name || "-"}</p>
                <p><span class="font-semibold w-28 inline-block">Umur:</span> ${detail.patient_age || "-"}</p>
                <p><span class="font-semibold w-28 inline-block">Kondisi:</span> ${detail.patient_condition || "-"}</p>
            </div>
            <div>
                <h3 class="text-lg font-bold border-b pb-2 mb-2">Detail Perjalanan</h3>
                <p><span class="font-semibold w-28 inline-block">Status:</span> <b>${getStatusDisplayName(detail.status)}</b></p>
                <p><span class="font-semibold w-28 inline-block">Jemput:</span> ${detail.pickup_address || "-"}</p>
                <p><span class="font-semibold w-28 inline-block">Tujuan:</span> ${detail.destination_address || "-"}</p>
            </div>
        `;
      updateActionButtons(detail.status);
    } catch (error) {
      showSnackbar(error.message || "Gagal memuat detail.", "error");
      closeModal();
    }
  };

  const closeModal = () => {
    modalBox.classList.add("opacity-0", "scale-95");

    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300);

    currentReservationId = null;
  };

  const updateActionButtons = (status) => {
    modalActions.innerHTML = "";
    let actions = [];

    if (status === "accepted") {
      actions.push({ text: "Mulai Jemput Pasien", status: "picking_up", color: "blue" });
    }
    if (status === "picking_up") {
      actions.push({ text: "Mulai Menuju RS", status: "on_route", color: "blue" });
    }
    if (status === "on_route") {
      actions.push({ text: "Selesaikan Tugas", status: "completed", color: "green" });
    }

    actions.forEach((action) => {
      const btn = document.createElement("button");
      btn.className = `flex-1 bg-${action.color}-600 text-white font-bold py-3 rounded-lg hover:bg-${action.color}-700`;
      btn.textContent = action.text;
      btn.onclick = () => handleStatusUpdate(action.status);
      modalActions.appendChild(btn);
    });
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!currentReservationId) return;
    try {
      await apiFetch(`${API_BASE_URL}/reservations/api/${currentReservationId}/status/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      showSnackbar(`Status berhasil diperbarui menjadi: ${getStatusDisplayName(newStatus)}`, "success");
      closeModal();
      loadRequests();
    } catch (error) {
      showSnackbar(error.message || `Gagal memperbarui status.`, "error");
    }
  };

  requestListContainer.addEventListener("click", (e) => {
    const card = e.target.closest("button[data-id]");
    if (card) {
      showDetailModal(card.dataset.id);
    }
  });

  closeModalBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  loadRequests();
});
