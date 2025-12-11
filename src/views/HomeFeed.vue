<template>
  <div class="page-wrapper">

    <div class="home-container">

      <!-- PAGE HEADER -->
      <h1 class="home-title fade-in">
        Welcome {{ user?.name }}. Here’s what we’ve been gaming...
      </h1>
      <p class="subtitle fade-in-delay">
        This homepage will become customized as you
        <a href="#" class="link">follow active members</a> on Hitboxd.
      </p>

      <!-- NEW ON HITBOXD -->
      <section class="section NewOnHitboxd">
        <h2 class="section-title">NEW ON HITBOXD</h2>
        <div class="game-row">
          <div v-for="i in 5" :key="i" class="game-card-placeholder">
            <span class="placeholder-title">game title</span>
            <div class="stars">
              <StarRating :modelValue="3" disabled />
            </div>
          </div>
        </div>
      </section>

      <!-- YOUR ACTIVITY -->
      <section class="section YourActivity">
        <h2 class="section-title">YOUR ACTIVITY</h2>
        <div class="game-row">
          <div v-for="i in 5" :key="i" class="game-card-placeholder">
            <span class="placeholder-title">game title</span>
            <div class="stars">
              <StarRating :modelValue="4" disabled />
            </div>
          </div>
        </div>
      </section>

      <!-- POPULAR ON HITBOXD -->
      <section class="section PopularOnHitboxd">
        <h2 class="section-title">POPULAR ON HITBOXD</h2>
        <div class="game-row">
          <div v-for="game in popularGames" :key="game.id"
            class="game-card-placeholder"
            @click="goToDetail(game.id)"
          >
            <span class="placeholder-title">{{ game.title }}</span>

            <div class="stars">
              <StarRating :modelValue="game.rating" disabled />
            </div>
          </div>
        </div>
      </section>

      <!-- POPULAR REVIEWS -->
      <section class="sectiotn PopularReviews">
        <h2 class="section-title">POPULAR REVIEWS THIS WEEK</h2>

        <div class="review-row">
          <div
            v-for="review in popularReviews"
            :key="review.id"
            class="review-card"
          >
            <p class="review-user">{{ review.user }}</p>
            <p class="review-game">{{ review.game }}</p>
            <p class="review-text">{{ review.text }}</p>
          </div>
        </div>
      </section>
      </div>
    </div>
<Footer />
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import StarRating from "@/components/reviews/starRating.vue";
import Footer from '@/components/common/Footer.vue'

const router = useRouter();

/* Temporary sample data */
const popularGames = ref([
  { id: 1, title: "GTA V ", rating: 4 },
  { id: 2, title: "The witcher 3", rating: 5 },
  { id: 3, title: "Portal 2", rating: 4 },
  { id: 4, title: "The Elder Scrolls V", rating: 5 },
  { id: 5, title: "Portal", rating: 4 },
]);

const popularReviews = ref([
  {
    id: 1,
    user: "Account",
    game: "Game title",
    text: "Review",
  },
  {
    id: 2,
    user: "Account",
    game: "Game title",
    text: "Review",
  },
  {
    id: 3,
    user: "Account",
    game: "Game title",
    text: "Review",
  },
]);

const goToDetail = (id) => router.push(`/game/${id}`);
</script>

<style scoped>

/* PAGE STYLES */
.page-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;

}

.home-container {
  width: 100%;
  max-width: 1050px;
  padding: 2rem 1rem;
  color: white;
  text-align: center;
  margin-bottom: 4rem;
}

/* TITLES */
.home-title {
  font-family: 'Courier Prime', monospace;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color : #000000;
}


.subtitle {
  margin-bottom: 3rem;
  font-size: 0.95rem;
  color: #050505;
}

.link {
  color: var(--brand-cyan);
  text-decoration: none;
}

/* SECTION HEADERS */
.section-title {
  font-family: 'Courier Prime', monospace;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  text-align: left;
  padding: 0 0.5rem;
  color : #504f4f;
}

/* LAYOUTS */
.section-block {
  margin-bottom: 2.5rem;
}

/* GAME ROW */
.game-row {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

/* GAME CARD PLACEHOLDER */
.game-card-placeholder {
  background: #bfbfbf;
  width: 150px;
  height: 140px;
  border-radius: 4px;
  padding: 0.8rem;
  text-align: center;
  cursor: pointer;
  color: #303030;
}

.placeholder-title {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

/* REVIEWS */
.review-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.review-card {
  background: #bfbfbf;
  padding: 1rem;
  width: 240px;
  border-radius: 4px;
  color: #303030;
  text-align: left;
}

.review-user {
  font-weight: bold;
}

.review-game {
  font-size: 0.9rem;
}

.review-text {
  margin-top: 6px;
  font-style: italic;
}



/* ANIMATIONS */
.fade-in {
  animation: fadeIn 0.7s ease;
}

.fade-in-delay {
  animation: fadeIn 1s ease;
}

.slide-up {
  animation: slideUp 0.6s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
