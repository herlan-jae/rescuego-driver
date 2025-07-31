document.addEventListener("DOMContentLoaded", () => {
  if (typeof API_BASE_URL === "undefined" || typeof showSnackbar === "undefined" || typeof apiFetch === "undefined") {
    console.error("Dependency JavaScript tidak ditemukan.");
    return;
  }

  const driverNameSpan = document.getElementById("driverName");
  const requestsTodayCountP = document.getElementById("requestsTodayCount");
  const requestsCompletedCountP = document.getElementById("requestsCompletedCount");
  const currentRequestContainer = document.getElementById("currentRequestContainer");

  const PROFILE_API = `${API_BASE_URL}/accounts/api/driver/profile/`;
  const RESERVATIONS_API = `${API_BASE_URL}/reservations/api/`;
  const LOGIN_REDIRECT_URL = "../auth/login_screen.html";

  const modal = document.getElementById("requestDetailModal");
  const modalBox = document.getElementById("modalBox");
  const closeModalBtn = document.getElementById("closeModal");
  const modalActions = document.getElementById("modal-actions");
  let currentReservationId = null;

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
      rejected: "Ditolak",
    }[status] || status);

  const loadDashboardData = async () => {
    try {
      const [profileData, reservationsData] = await Promise.all([apiFetch(PROFILE_API, {}, LOGIN_REDIRECT_URL), apiFetch(RESERVATIONS_API, {}, LOGIN_REDIRECT_URL)]);

      const firstName = profileData.first_name || profileData.username;
      driverNameSpan.textContent = firstName;

      const reservations = reservationsData.results || reservationsData || [];
      const completedCount = reservations.filter((req) => req.status === "completed").length;
      requestsTodayCountP.textContent = reservations.length;
      requestsCompletedCountP.textContent = completedCount;

      const activeRequest = reservations.find((req) => !["completed", "cancelled", "rejected"].includes(req.status));

      currentRequestContainer.innerHTML = "";
      if (activeRequest) {
        const card = document.createElement("button");
        card.className = "bg-white rounded-xl shadow py-4 px-6 flex items-center justify-between w-full text-left transition hover:bg-gray-100 cursor-pointer";
        card.dataset.id = activeRequest.id;

        card.innerHTML = `
          <div class="flex items-center space-x-4">
            <div class="p-2 bg-yellow-100 rounded-full">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
                <p class="font-semibold text-gray-800">Pasien: ${activeRequest.patient_name}</p>
                <p class="text-sm text-gray-600">Tujuan: ${activeRequest.destination_city || "N/A"}</p>
            </div>
          </div>
          <span class="text-[#5B2EFF] text-base font-semibold">Lihat Detail</span>
        `;
        currentRequestContainer.appendChild(card);
      } else {
        currentRequestContainer.innerHTML = `<div class="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">Tidak ada permintaan aktif saat ini.</div>`;
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      showSnackbar("Gagal memuat data dashboard.", "error");
    }
  };

  const showDetailModal = async (reservationId) => {
    // alert(`Fungsi untuk membuka detail reservasi ID: ${reservationId} perlu diimplementasikan di sini.`);
    window.location.href = "request_screen.html";
  };

  currentRequestContainer.addEventListener("click", (event) => {
    const requestButton = event.target.closest("button[data-id]");
    if (requestButton) {
      window.location.href = "request_screen.html";
    }
  });

  loadDashboardData();
});
