<template>
  <main>
    <header class="hdr">
      <h1>Berlin Places</h1>
    </header>

    <SwipeDeck :items="places" @rate="onRate" />

    <footer class="stats">
      <div>Gesamt 👍 {{ totalLikes }} • 👎 {{ totalDislikes }}</div>
    </footer>
  </main>
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
          imageLink: "https://images.unsplash.com/photo-1520975922284-c0d71e7cd6b6?q=80&w=1200&auto=format&fit=crop"
        },
        {
          name: "Tempelhofer Feld",
          description: "Ehemaliger Flughafen, heute Freizeitfläche",
          rating: 4, like: 30, dislike: 2,
          imageLink: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1200&auto=format&fit=crop"
        },
        {
          name: "Tiergarten",
          description: "Großer Park im Herzen von Berlin",
          rating: 5, like: 60, dislike: 3,
          imageLink: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
        }
      ],
      totalLikes: 0,
      totalDislikes: 0
    };
  },
  methods: {
    onRate({ item, like }) {
      // Zähler im Item hochsetzen
      const found = this.places.find(p => p.name === item.name);
      if (found) {
        if (like) { found.like = (found.like || 0) + 1; this.totalLikes++; }
        else { found.dislike = (found.dislike || 0) + 1; this.totalDislikes++; }
      }
      // Optional: nach Swipe ans Ende anhängen, um endlos zu blättern
      // this.places.push(item);
    }
  }
};
</script>

<style scoped>
main {
  min-height: 100vh;
  padding: 32px 16px 40px;
  background: linear-gradient(135deg, #eef2f3 0%, #8e9eab 100%);
  display: grid;
  place-items: center;
}
.hdr h1 {
  color: #0a66ff;
  text-align: center;
  margin-bottom: 14px;
}
.stats { margin-top: 10px; color: #333; font-weight: 600; }
</style>
