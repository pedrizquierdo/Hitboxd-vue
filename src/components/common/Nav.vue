<template>
  <nav class="navbar">
    <div class="navbar-inner">

      <!-- LOGO -->
      <HitboxdLogo />

      <!-- MENU -->
      <ul class="nav-links">
        <li class="nav-item dropdown">
          <span @click="toggleProfileMenu">
            PROFILE ▾
          </span>

          <!-- submenu -->
          <ul v-if="profileMenu" class="dropdown-menu">
            <li><router-link to="/profile">My Profile</router-link></li>
            <li><router-link to="/settings">Settings</router-link></li>
          </ul>
        </li>

        <li><router-link to="/games">GAMES</router-link></li>
        <li><router-link to="/lists">LISTS</router-link></li>
        <li><router-link to="/members">MEMBERS</router-link></li>
      </ul>

      <!-- SEARCH + LOGIN -->
      <div class="nav-right">
        <button
          v-if="!isLoggedIn"
          @click="$router.push('/login')"
          class="login-btn"
        >
          + Log in
        </button>

        <button
          v-else
          @click="logout"
          class="logout-btn"
        >
          Log out
        </button>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from "vue";
import HitboxdLogo from "@/components/common/Logo.vue";

defineOptions({ name: "NavBar" });

const profileMenu = ref(false);

const toggleProfileMenu = () => {
  profileMenu.value = !profileMenu.value;
};

const isLoggedIn = computed(() => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
});

const logout = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.reload();
};
</script>

<style scoped>
/* --- EL MISMO ESTILO QUE PEDISTE, SIN CAMBIOS --- */

.navbar {
  width: 100%;
  background-color: #e5e7eb;
  border-bottom: 1px solid #d1d5db;
  padding: 0.6rem 0;
  display: flex;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}

.navbar-inner {
  width: 100%;
  max-width: 1300px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;
  list-style: none;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}

.nav-item {
  position: relative;
}

.nav-links a,
.nav-links span {
  color: #2d2d2d;
  text-decoration: none;
  cursor: pointer;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.dropdown-menu {
  position: absolute;
  top: 22px;
  left: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0;
  min-width: 150px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.dropdown-menu li {
  padding: 0.4rem 1rem;
}

.dropdown-menu li:hover {
  background: #f3f4f6;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  opacity: 0.7;
  transition: 0.2s;
}

.search-btn:hover {
  opacity: 1;
}

.search-btn img {
  width: 20px;
  height: 20px;
}

.login-btn {
  background: #2ecc71;
  color: white;
  font-weight: 600;
  border: none;
  padding: 6px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
}

.login-btn:hover {
  background: #29c164;
}

.logout-btn {
  background: #ff5353;
  color: white;
  font-weight: 600;
  border: none;
  padding: 6px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
}

.logout-btn:hover {
  background: #ff3d3d;
}

@media (max-width: 850px) {
  .nav-links {
    display: none;
  }
}
</style>
