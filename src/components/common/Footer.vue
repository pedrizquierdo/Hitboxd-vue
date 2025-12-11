<template>
  <footer class="footer">
    <div class="footer-content">
      <p>© Hitboxd Limited. Made by <a href="#">fans</a> in Sonora Mexico. Game data from IGDB.</p>

      <div class="socials">
        <span><img src="/assets/Twitter Bird.png" alt="twitter icon" /></span>
        <span><img src="/assets/Facebook Circled.png" alt="facebook icon" /></span>
        <span><img src="/assets/Instagram.png" alt="instagram icon" /></span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  width: 100%;            
  background-color: #F2F3F5;
  border-top: 1px solid #d1d5db;
  display: flex;
  justify-content: center;   
  padding: 2rem 0;
  margin-top: auto;       
}

.footer-content {
  width: 100%;
  max-width: 1200px;         
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 1rem;
  
  padding: 0 2rem; 
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

/* Ajuste Responsivo simple por si acaso */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>