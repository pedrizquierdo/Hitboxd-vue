<template>
  <footer class="footer">
    <p>© Hitboxd Limited. Made by <a href="#">fans</a> in Sonora Mexico. Game data from IGDB.</p>

    <div class="socials">
      <span><img src="/assets/Twitter Bird.png" alt="twitter icon" /></span>
      <span><img src="/assets/Facebook Circled.png" alt="facebook icon" /></span>
      <span><img src="/assets/Instagram.png" alt="instagram icon" /></span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  width: 100%;
  padding: 2rem;
  background-color: #F2F3F5;
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  color: #666;
  border-top: 1px solid #d1d5db;
}

.footer a {
  color: #2D2D2D;
  text-decoration: underline;
}

.socials {
  display: flex;
  gap: 15px;
}

.socials img {
  width: 50px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.socials img:hover {
  opacity: 1;
}
</style>