import CONFIG from "../config";

// Helper function untuk mendapatkan token (bisa dipisah ke auth.js jika lebih kompleks)
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Helper function untuk fetch dengan penanganan error dasar dan otentikasi
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers, // Gabungkan header yang ada
  };

  // Tambahkan header Authorization jika token ada dan bukan request FormData
  // Fetch API akan otomatis set Content-Type untuk FormData
  if (token && !(options.body instanceof FormData)) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Set Content-Type ke JSON jika bukan FormData dan belum diset
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Cek jika response tidak OK (status bukan 2xx)
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      // Coba parse response error dari API jika ada
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorMessage;
    } catch (e) {
      // Biarkan errorMessage default jika response error tidak bisa diparse
      console.error("Could not parse error response body:", e);
    }
    console.error(`API call failed for ${url}: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  // Handle response tanpa konten (misal status 204 No Content)
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return null; // Atau kembalikan objek/nilai yang sesuai
  }

  // Parse JSON response
  try {
    const responseJson = await response.json();
    // Cek error flag dari API Dicoding
    if (responseJson.error) {
      console.error(`API returned error for ${url}: ${responseJson.message}`);
      throw new Error(responseJson.message || "API returned an error");
    }
    return responseJson;
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    throw new Error("Failed to parse server response.");
  }
};

const DicodingStoryAPI = {
  // Fungsi untuk Registrasi
  async register({ name, email, password }) {
    return fetchWithAuth(`${CONFIG.BASE_URL}/register`, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  // Fungsi untuk Login
  async login({ email, password }) {
    const responseJson = await fetchWithAuth(`${CONFIG.BASE_URL}/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    // Simpan token setelah login berhasil
    if (
      responseJson &&
      responseJson.loginResult &&
      responseJson.loginResult.token
    ) {
      localStorage.setItem("authToken", responseJson.loginResult.token);
      console.log("Token saved to localStorage");
      return responseJson.loginResult;
    } else {
      throw new Error("Login response did not contain token.");
    }
  },

  // Fungsi Logout (opsional, menghapus token)
  logout() {
    localStorage.removeItem("authToken");
    console.log("Token removed from localStorage");
    // Tambahkan langkah lain jika perlu (misal redirect)
  },

  // Fungsi untuk Mendapatkan Semua Stories
  async getAllStories(page = 1, size = 10, location = 0) {
    // Tambahkan parameter jika API mendukung
    // Periksa token sebelum request
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required to fetch stories.");
    }
    // Tambahkan query parameter jika ada
    const queryParams = new URLSearchParams({
      page,
      size,
      location,
    }).toString();
    const response = await fetchWithAuth(
      `${CONFIG.BASE_URL}/stories?${queryParams}`,
      {
        method: "GET",
        // headers sudah dihandle fetchWithAuth
      }
    );
    return response.listStory; // Kembalikan array listStory
  },

  // Fungsi untuk Menambah Story Baru
  async addNewStory({ description, photo, lat, lon }) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required to add a new story.");
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo); // photo harus berupa File object
    if (lat !== undefined && lat !== null) formData.append("lat", lat);
    if (lon !== undefined && lon !== null) formData.append("lon", lon);

    // Untuk FormData, fetchWithAuth tidak akan set Content-Type: application/json
    // Header Authorization tetap ditambahkan jika token ada
    return fetchWithAuth(`${CONFIG.BASE_URL}/stories`, {
      method: "POST",
      body: formData, // Kirim sebagai FormData
    });
  },

  // Fungsi untuk Add New Story (Guest) - Jika API mendukung endpoint terpisah
  async addNewStoryGuest({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat !== undefined && lat !== null) formData.append("lat", lat);
    if (lon !== undefined && lon !== null) formData.append("lon", lon);

    return fetch(`${CONFIG.BASE_URL}/stories/guest`, {
      // Ganti URL jika endpoint guest berbeda
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          // Handle error response
          return response.json().then((err) => {
            throw new Error(err.message || "Failed to add story as guest");
          });
        }
        return response.json();
      })
      .then((responseJson) => {
        if (responseJson.error) {
          throw new Error(
            responseJson.message || "API returned an error for guest story"
          );
        }
        return responseJson;
      });
  },

  // Fungsi untuk Mendapatkan Detail Story
  async getStoryDetail(id) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required to fetch story detail.");
    }
    const response = await fetchWithAuth(`${CONFIG.BASE_URL}/stories/${id}`, {
      method: "GET",
    });
    return response.story; // Kembalikan objek story
  },
};

export default DicodingStoryAPI;
