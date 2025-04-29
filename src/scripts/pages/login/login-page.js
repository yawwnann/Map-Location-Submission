import DicodingStoryAPI from "../../data/api"; // Pastikan path import benar
// import helper lain jika perlu

const LoginPage = {
  async render() {
    // Kode HTML untuk form login (gunakan backtick ` ` jika multi-baris)
    return `
      <div>
        <h2>Login</h2>
        <form id="loginForm">
          {/* ... input email, password, button ... */}
        </form>
        <div id="loginError"></div>
      </div>
    `;
  },

  async afterRender() {
    // Kode untuk menambahkan event listener ke form
    const loginForm = document.querySelector("#loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        // Ambil data form
        // Panggil DicodingStoryAPI.login(...)
        // Handle success/error
      });
    } else {
      console.error("Login form not found");
    }
  }, // Pastikan ada koma jika ada method lain setelah ini
}; // Pastikan object ditutup dengan benar

export default LoginPage; // Export objeknya
