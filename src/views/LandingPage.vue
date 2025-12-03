<template>
  <div class="landing-container">
    
    <nav class="navbar">
      <div class="logo">
        <span class="cube-icon">
            <img src="/assets/logo.png" alt="logo" class="logo-img"/>
        </span> 
        <span class="brand-name">Hitboxd</span>
      </div>
      <div class="nav-links">
        <button @click="openModal('login')" class="nav-btn">SIGN IN</button>
        <button @click="openModal('register')" class="nav-btn">CREATE ACCOUNT</button>
        <a href="#" class="nav-link">GAMES</a>
      </div>
    </nav>

    <header class="hero">
      <div class="hero-image-placeholder">
        <img src="/assets/hero_image.png" alt="Games Collage" class="collage-img" />
      </div>

      <h1 class="main-title">Play. Log. Share.</h1>
      
      <button class="cta-btn" @click="openModal('register')">
        Get started - it's free!
      </button>

      <p class="subtitle">
        The ultimate social platform to manage your backlog and rate your favorites.
      </p>
    </header>

    <section class="trending-section">
      <div v-if="isLoading" class="loading-msg">Cargando juegos...</div>

      <div v-else class="games-grid">
        <div 
          v-for="game in games" 
          :key="game.igdb_id" 
          class="game-card"
          :style="{ backgroundImage: `url(${game.cover_url})` }"
        >
          <div class="game-overlay">
            <span class="game-title">{{ game.title }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <h3>HITBOXD LETS YOU...</h3>
      <div class="features-grid">
        <div class="feature-card">
          <span class="icon">
            <img src="/assets/Eye.png" alt="">
          </span>
          <p>Keep track of every game you've ever played (or just start from the day you join)</p>
        </div>
        <div class="feature-card">
          <span class="icon">
            <img src="/assets/Love.png" alt="heart icon">
          </span>
          <p>Show some love for your favorite games, lists and reviews with a "like"</p>
        </div>
        <div class="feature-card">
          <span class="icon">
            <img src="/assets/Align Left.png" alt="review icon">
          </span>
          <p>Write and share reviews, and follow friends and other players to read theirs</p>
        </div>
        <div class="feature-card">
          <span class="icon">
            <img src="/assets/Star Filled.png" alt="star icon">
          </span>
          <p>Rate each game on a five-star scale (with halves) to record and share your reaction</p>
        </div>
        <div class="feature-card">
          <span class="icon">
            <img src="/assets/Timeline Week.png" alt="stats icon">
          </span>
          <p>Keep a log of your gaming history and unlock personalized stats</p>
        </div>
        <div class="feature-card">
          <span class="icon">
            <img src="/assets/Four Squares.png" alt="">
          </span>
          <p>Compile and share lists on any topic and keep a backlog of games to play</p>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>© Hitboxd Limited. Made by <a href="#">fans</a> in Sonora Mexico. Game data from IGDB.</p>
      <div class="socials">
        <span>
            <img src="/assets/Twitter Bird.png" alt="twitter icon"/>
        </span> 
        <span>
            <img src="/assets/Facebook Circled.png" alt="facebook icon">
        </span> 
        <span>
            <img src="/assets/Instagram.png" alt="instagram icon">
        </span>
      </div>
    </footer>

    <AuthModal 
      v-if="showAuth" 
      :initialView="authView" 
      @close="showAuth = false" 
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import AuthModal from '../components/auth/AuthModal.vue';

const showAuth = ref(false);
const authView = ref('login');
const games = ref([]); 
const isLoading = ref(true);

const openModal = (view) => {
  authView.value = view;
  showAuth.value = true;
};

const fetchTrendingGames = async () => {
  try {
    const response = await axios.get('https://api-proyecto-production-519c.up.railway.app/api/games/trending?limit=12');
    games.value = response.data;
  } catch (error) {
    console.error("Error cargando juegos:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchTrendingGames();
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@700&family=Inter:wght@400;600;800&display=swap');

:root {
  --bg-color: #E3E4E8;
  --text-main: #2D2D2D;
  --card-bg: #757575; 
  --brand-cyan: #00AEEF;
  --brand-red:#FF4444; 
  --brand-green:  #00CC66;
  --brand-yellow: #FFD700;
  --white: #FFFFFF;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-color);
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

#app {
  margin: 0;
  padding: 0;
  width: 100%;
}
</style>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

.landing-container {
  min-height: 100vh;
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  /* Textura de Fondo */
  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-image: url('/assets/bg-texture.jpg'); 
    background-repeat: repeat;
    background-size: 400px; 
    opacity: 0.1; 
    pointer-events: none;
    z-index: 0;
  }

  /* Capas superiores */
  .navbar, .hero, .trending-section, .features-section, .footer {
    position: relative;
    z-index: 1;
  }

  .navbar {
    width: 100%;
    max-width: 1200px;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .logo {
      font-weight: bolder;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      gap: 8px;
      .logo-img { width: 30px; height: 35px; }
    }

    .nav-links {
      display: flex;
      gap: 20px;
      align-items: center;

      .nav-btn, .nav-link { 
        background: none; 
        border: none; 
        cursor: pointer; 
        font-size: 0.85rem; 
        font-weight: 600; 
        color: #444; 
        letter-spacing: 0.5px;
        transition: color 0.2s ease, transform 0.2s ease;
        
        &:nth-child(1):hover {
        color: var(--brand-red);
        transform: translateY(-1px);
      }

      &:nth-child(2):hover {
        color: var(--brand-cyan);
        transform: translateY(-1px);
      }

      &:nth-child(3):hover {
        color: var(--brand-green);
        transform: translateY(-1px);
      }
      }
    }
  }

  .hero {
    text-align: center;
    margin-top: 2rem;
    width: 100%;
    max-width: 900px;

    .hero-image-placeholder {
      margin-bottom: 2rem;
      .collage-img { 
        max-width: 100%; height: auto; 
        mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
        -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
      }
    }

    .main-title {
      font-family: 'Courier Prime', monospace;
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      letter-spacing: -2px;
    }

    .cta-btn {
      background-color: var(--brand-cyan);
      color: var(--white);
      border: none;
      padding: 12px 30px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      transition: transform 0.1s;
      
      &:hover {
        transform: scale(1.05);
        background-color: #0095CC;
      }
    }

    .subtitle { color: #666; margin-top: 2rem; font-size: 1.1rem; }
  }

  .trending-section {
    margin-top: 3rem;
    width: 100%;
    max-width: 1000px;
    padding: 0 20px;

    .loading-msg { text-align: center; color: #666; font-family: monospace; }

    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 20px;
      justify-content: center;

      .game-card {
        width: 100%;
        aspect-ratio: 3/4; 
        background-color: var(--card-bg);
        background-position: center top;
        background-size: cover;
        background-repeat: no-repeat;
        border-radius: 5px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px rgba(0,0,0,0.5);
          border: 2px solid var(--brand-cyan);
          border-radius: 5px;
          
          .game-overlay { opacity: 1; }
        }

        .game-overlay {
          position: absolute;
          bottom: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          display: flex;
          align-items: flex-end;
          padding: 10px;
          opacity: 0;
          transition: opacity 0.2s;

          .game-title {
            color: var(--white);
            font-size: 0.9rem;
            font-weight: bold;
            text-shadow: 0 2px 4px black;
            line-height: 1.2;
          }
        }
      }
    }
  }

  .features-section {
    margin-top: 4rem; margin-bottom: 4rem;
    width: 100%; max-width: 1000px; padding: 0 20px;

    h3 {
      font-size: 0.9rem; text-transform: uppercase; margin-bottom: 1rem; color: #555;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;

      .feature-card {
        background-color: var(--card-bg); /* Aquí se aplica el gris oscuro */
        color: var(--white);
        padding: 1.5rem;
        border-radius: 4px;
        display: flex;
        align-items: flex-start;
        gap: 15px;
        font-size: 0.85rem;
        line-height: 1.4;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;

        &:hover {
          transform: translateY(-5px);
          background-color: #0095CC;
          box-shadow: 0 8px 12px rgba(0,0,0,0.4);
        }

        .icon {
          width: 44px; flex-shrink: 0;
          img { width: 100%; filter: brightness(0) invert(1); /* Iconos blancos */ }
        }
      }
    }
  }

  .footer {
    width: 100%; padding: 2rem;
    background-color: #F2F3F5;
    display: flex; justify-content: space-between;
    font-size: 1rem; color: #666;
    border-top: 1px solid #d1d5db;

    a { color: #2D2D2D; text-decoration: underline; }

    .socials {
      display: flex; gap: 15px;
      img { width: 50px; opacity: 0.7; transition: opacity 0.2s; }
      img:hover { opacity: 1; }
    }
  }
}

/* Media Queries para móviles */
@media (max-width: 768px) {
  .landing-container {
    .features-section .features-grid { grid-template-columns: 1fr; }
    .footer { flex-direction: column; align-items: center; gap: 1rem; }
  }
}
</style>