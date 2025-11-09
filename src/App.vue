<template>
  <div class="page">
    <div class="shell">
      <header class="hdr">
        <h1>Berlin Places</h1>
      </header>

      <SwipeDeck :items="places" @rate="onRate" />

      <footer class="stats">
        Gesamt 👍 {{ totalLikes }} • 👎 {{ totalDislikes }}
      </footer>
    </div>
  </div>
</template>

<script>
import SwipeDeck from "./components/SwipeDeck.vue";

export default {
  name: "App",
  components: { SwipeDeck },
  data() {
    return {
      places: [
        {
          name: "HTW Berlin",
          description: "Campus Wilhelminenhof an der Spree",
          rating: 5, like: 42, dislike: 1,
          imageLink: "/images/campus-wilhelminenhof.jpg"
        },
        {
          name: "Tempelhofer Feld",
          description: "Ehemaliger Flughafen, heute Freizeitfläche",
          rating: 4, like: 30, dislike: 2,
          imageLink: "/images/tempelhoferfeld.jpg"
        },
        {
          name: "Tiergarten",
          description: "Großer Park im Herzen von Berlin",
          rating: 5, like: 60, dislike: 3,
          imageLink: "/images/Tiergarten.jpeg"
        }
      ],
      totalLikes: 0,
      totalDislikes: 0
    };
  },
  methods: {
    onRate({ item, like }) {
      const found = this.places.find(p => p.name === item.name);
      if (found) {
        if (like) { found.like = (found.like || 0) + 1; this.totalLikes++; }
        else { found.dislike = (found.dislike || 0) + 1; this.totalDislikes++; }
      }
    }
  }
};
</script>

<style>
/* ==== GLOBAL LAYOUT: sorgt für echtes Centering ==== */
* { box-sizing: border-box; }

html, body, #app {
  height: 100%;
  margin: 0;
}

body {
  min-height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #eef2f3 0%, #8e9eab 100%);
  transform: translateX(60px); 
}

/* Wrapper füllt Breite, Inhalt wird mittig gehalten */
.page {
  width: 100%;
  padding: clamp(16px, 2vw, 40px);
  display: flex;
  justify-content: center; /* horizontal mittig */
}

/* Zentrale „Shell“ */
.shell {
  width: min(960px, 96vw);
  margin-inline: auto;          /* fallback-zentrierung */
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  padding: 24px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hdr { text-align: center; margin-bottom: 10px; }
.hdr h1 { margin: 0; font-size: 2.4rem; color: #0a66ff; }

.stats {
  margin-top: 12px;
  color: #222;
  font-weight: 600;
  background: #ffffffb8;
  padding: 8px 12px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,.1);
}

/* etwas mehr Raum auf sehr breiten Screens */
@media (min-width: 1200px) {
  .shell { padding: 32px 36px 40px; }
  .hdr h1 { font-size: 2.8rem; }
}
</style>
