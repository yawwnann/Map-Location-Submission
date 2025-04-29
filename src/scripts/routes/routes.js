// src/scripts/routes/routes.js
import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/login/login-page";

const routes = {
  "/": HomePage, // Gunakan objek HomePage langsung
  "/home": HomePage, // Alias jika perlu
  "/about": AboutPage, // Contoh halaman about
  "/login": LoginPage,
};

export default routes;
