<template>
  <div class="profile-page">

    <!-- NAVBAR -->
    <Nav />

    <div class="profile-container">
      <!-- HEADER -->
      <div class="profile-header">
        <div class="profile-avatar"></div>

        <div class="profile-info">
          <h1 class="username">{{ username }}</h1>
        </div>

        <div class="profile-stats">
  <div class="stat-block">
    <span class="stat-number">0</span>
    <span class="stat-label">Games</span>
  </div>

  <div class="divider"></div>

  <div class="stat-block">
    <span class="stat-number">0</span>
    <span class="stat-label">Followers</span>
  </div>

  <div class="divider"></div>

  <div class="stat-block">
    <span class="stat-number">0</span>
    <span class="stat-label">Following</span>
  </div>
</div>

      </div>

      <!-- TABS -->
      <nav class="profile-tabs">
        <a 
          v-for="tab in tabs"
          :key="tab"
          href="#"
          :class="{ active: activeTab === tab }"
          @click.prevent="setTab(tab)"
        >
          {{ tab }}
        </a>

        <div class="search-icons"></div>
      </nav>

      <!-- SECCIONES -->
      <section v-show="activeTab === 'PROFILE'" class="section">
        <h2 class="section-title">FAVORITE GAMES</h2>
        <p class="section-text">Don't forget to select your favorite Games!</p>

        <h2 class="section-title" style="margin-top: 40px;">RECENT ACTIVITY</h2>
      </section>

      <section v-show="activeTab === 'ACTIVITY'" class="section">
        <h2 class="section-title">RECENT ACTIVITY</h2>
        <p class="section-text">Nothing here yet.</p>
      </section>

      <section v-show="activeTab === 'GAMES'" class="section">
        <h2 class="section-title">GAMES</h2>
        <p class="section-text">No games logged yet.</p>
      </section>

      <section v-show="activeTab === 'DIARY'" class="section">
        <h2 class="section-title">DIARY</h2>
        <p class="section-text">Diary is empty.</p>
      </section>

      <section v-show="activeTab === 'REVIEWS'" class="section">
        <h2 class="section-title">REVIEWS</h2>
        <p class="section-text">No reviews yet.</p>
      </section>

      <section v-show="activeTab === 'PLAYLIST'" class="section">
        <h2 class="section-title">PLAYLIST</h2>
        <p class="section-text">No playlists created.</p>
      </section>

      <section v-show="activeTab === 'FILMS'" class="section">
        <h2 class="section-title">FILMS</h2>
        <p class="section-text">No films logged yet.</p>
      </section>

      <section v-show="activeTab === 'LISTS'" class="section">
        <h2 class="section-title">LISTS</h2>
        <p class="section-text">
          No lists yet.
          <button class="start-list-btn">Start one?</button>
        </p>
      </section>

      <section v-show="activeTab === 'LIKES'" class="section">
        <h2 class="section-title">LIKES</h2>
        <p class="section-text">You haven't liked anything yet.</p>
      </section>

      <section v-show="activeTab === 'TAGS'" class="section">
        <h2 class="section-title">TAGS</h2>
        <p class="section-text">No tags added.</p>
      </section>

      <section v-show="activeTab === 'NETWORK'" class="section">
        <h2 class="section-title">NETWORK</h2>
        <p class="section-text">No connections yet.</p>
      </section>
    </div>    
  </div> 
    <Footer />
</template>


<script setup>
import { ref, onMounted } from "vue"
import Nav from "@/components/common/Nav.vue"
import Footer from "@/components/common/Footer.vue"

// username dinámico
const username = ref("")

// obtener usuario local
onMounted(() => {
  const storedName = localStorage.getItem("username")
  username.value = storedName || "User"
})


// Tabs
const activeTab = ref("PROFILE")

const tabs = [
  "PROFILE",
  "ACTIVITY",
  "GAMES",
  "DIARY",
  "REVIEWS",
  "PLAYLIST",
  "FILMS",
  "LISTS",
  "LIKES",
  "TAGS",
  "NETWORK"
]

const setTab = tab => {
  activeTab.value = tab
}
</script>


<style scoped>
/* Tu CSS tal cual, no lo moví */
.profile-page {
  display: flex;
  flex-direction: column;
}

/* Contenido completo */
.profile-container {
  width: 90%;
  max-width: 1100px;
  margin: 40px auto;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #000;
  border: 5px solid #111;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-start;
  margin-left: -270px;
}

.username {
  font-size: 32px;
  margin: 0;
}

.profile-stats {
  display: flex;
  align-items: center;
  gap: 25px;
}

.stat-block {
  text-align: center;
  min-width: 80px;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  display: block;
}

.stat-label {
  font-size: 13px;
  color: #555;
}

.divider {
  width: 1px;
  height: 30px;
  background: #999;
}


.profile-tabs {
  display: flex;
  align-items: center;
  gap: 18px;
  border-bottom: 1px solid #999;
  margin-top: 30px;
  padding-bottom: 10px;
}

.profile-tabs a {
  text-decoration: none;
  font-size: 13px;
  color: #444;
}

.profile-tabs a.active {
  color: #00aaff;
  font-weight: bold;
  border-bottom: 2px solid #00aaff;
  padding-bottom: 8px;
}

.section {
  margin-top: 40px;
}

.section-title {
  font-size: 14px;
  margin-bottom: 8px;
  border-bottom: 1px solid #aaa;
  padding-bottom: 5px;
}

.section-text {
  font-size: 13px;
  color: #444;
}
.profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.profile-container {
  flex: 1; /* empuja el footer hacia abajo */
}

</style>
