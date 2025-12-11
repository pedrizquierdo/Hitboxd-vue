<template>
  <div class="profile-container">

    <!-- HEADER -->
    <div class="profile-header">
      <div class="profile-avatar">
        <!-- Icono de usuario -->
      </div>

      <div class="profile-info">
        <h1 class="username">USERNAME</h1>
      </div>

      <div class="profile-stats">
        <div>
          <span class="stat-number">0</span>
          <span class="stat-label">Games</span>
        </div>
        <div>
          <span class="stat-number">0</span>
          <span class="stat-label">Followers</span>
        </div>
        <div>
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

      <div class="search-icons">
        <!-- iconos derecha -->
      </div>
    </nav>

    <!-- SECCIONES -->
    <section v-show="activeTab === 'PROFILE'" class="section">
      <h2 class="section-title">FAVORITE FILMS</h2>
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
</template>
<script>
export default {
  data() {
    return {
      activeTab: "PROFILE",

      tabs: [
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
    };
  },

  methods: {
    setTab(tab) {
      this.activeTab = tab;
    }
  }
};
</script>
<style scoped>
/* Fondo estilo Letterboxd */
body {
  margin: 0;
  background: #e6e6e6;
  font-family: Arial, Helvetica, sans-serif;
  color: #333;
}

/* Contenedor principal */
.profile-container {
  width: 90%;
  max-width: 1100px;
  margin: 40px auto;
}

/* HEADER */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Avatar */
.profile-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #000;
  border: 5px solid #111;
}

/* User info */
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

/* Botones */
.edit-btn, .more-btn {
  border: none;
  padding: 5px 12px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
}

.edit-btn { background: #ccc; }
.more-btn { background: #ddd; font-weight: bold; }

/* Stats */
.profile-stats {
  display: flex;
  gap: 25px;
  text-align: center;
}

.profile-stats div {
  padding: 0 15px;
  border-right: 1px solid #aaa;
}

.profile-stats div:last-child {
  border-right: none;
}

.stat-number {
  display: block;
  font-size: 22px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
}

/* Tabs */
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

/* Start one? */
.start-list-btn {
  background: none;
  border: none;
  color: #00aaff;
  cursor: pointer;
  font-size: 14px;
}

.start-list-btn:hover { text-decoration: underline; }

/* Icons */
.search-icons {
  margin-left: auto;
  display: flex;
  gap: 12px;
}

.icon { cursor: pointer; }

/* Secciones */
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
</style>
