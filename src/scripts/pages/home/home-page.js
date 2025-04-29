// src/scripts/pages/home/home-page.js
import DicodingStoryAPI from "../../data/api";
// Impor komponen UI lain jika perlu (misal: template untuk item cerita)
// import createStoryItemTemplate from '../templates/template-creator';

const HomePage = {
  async render() {
    // Render struktur HTML dasar halaman
    return `
      <div class="content">
        <h2 class="content__heading">Explore Stories</h2>
        <div id="storiesList" class="stories">
          <p>Loading stories...</p> {/* Pesan loading awal */}
        </div>
        {/* Tambahkan elemen lain jika perlu, misal tombol load more, form add story */}
      </div>
    `;
  },

  async afterRender() {
    console.log("HomePage afterRender executed");
    const storiesListContainer = document.querySelector("#storiesList");

    if (!storiesListContainer) {
      console.error("Error: Element #storiesList not found!");
      return;
    }

    // Langsung coba load stories saat halaman dirender
    try {
      console.log("Attempting to load stories...");
      const stories = await DicodingStoryAPI.getAllStories(); // Default: page 1, size 10
      console.log("Stories fetched:", stories);

      storiesListContainer.innerHTML = ""; // Kosongkan container loading/error sebelumnya

      if (!stories || stories.length === 0) {
        storiesListContainer.innerHTML =
          "<p>No stories found. Be the first to share!</p>";
        console.log("No stories data received or array is empty.");
        return;
      }

      // Render setiap item cerita
      stories.forEach((story) => {
        const storyElement = document.createElement("div"); // Atau gunakan template
        storyElement.classList.add("story-item"); // Tambahkan class untuk styling
        // Format tanggal agar lebih mudah dibaca
        const formattedDate = new Date(story.createdAt).toLocaleString(
          "id-ID",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        );

        storyElement.innerHTML = `
          <img class="story-item__image" src="${
            story.photoUrl
          }" alt="Story by ${story.name}">
          <div class="story-item__content">
             <h3 class="story-item__title">Shared by: ${story.name}</h3>
             <p class="story-item__description">${story.description}</p>
             <p class="story-item__date"><small>Posted on: ${formattedDate}</small></p>
             ${
               story.lat && story.lon
                 ? `<p class="story-item__location"><small>Location: ${story.lat.toFixed(
                     4
                   )}, ${story.lon.toFixed(4)}</small></p>`
                 : ""
             }
          </div>
        `;
        storiesListContainer.appendChild(storyElement);
        // Alternatif jika menggunakan template creator:
        // storiesListContainer.innerHTML += createStoryItemTemplate(story);
      });
      console.log("Finished rendering stories");
    } catch (error) {
      console.error("Error loading or rendering stories:", error);
      storiesListContainer.innerHTML = `<p class="error-message">Error loading stories: ${error.message}. Please try logging in or refresh the page.</p>`;
      // Handle error lebih lanjut: Jika error karena otentikasi, mungkin tampilkan tombol login/redirect
      if (error.message.includes("Authentication")) {
        // Tampilkan pesan/tombol login
      }
    }

    // Tambahkan event listener lain di sini jika perlu (misal untuk tombol load more, delete, dll.)
  },
};

export default HomePage;
