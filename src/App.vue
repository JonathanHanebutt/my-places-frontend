<template>
  <main class="page">
    <section class="shell">
      <h1>Berlin Places</h1>

      <!-- M2-Kern: Unterkomponente rendert mit v-for -->
      <PlaceList :places="places" @rate="onRate" />

      <p class="stats">
        Gesamt: 👍 {{ totalLikes }} • 👎 {{ totalDislikes }}
      </p>
    </section>
  </main>
</template>

<script>
import PlaceList from "./components/PlaceList.vue";

export default {
  name: "App",
  components: { PlaceList },
  data() {
    return {
      places: [
        {
          name: "HTW Berlin",
          description: "Campus Wilhelminenhof an der Spree",
          rating: 5,
          like: 42,
          dislike: 1,
          imageLink: "/images/campus-wilhelminenhof.jpg"
        },
        {
          name: "Tempelhofer Feld",
          description: "Ehemaliger Flughafen, heute Freizeitfläche",
          rating: 4,
          like: 30,
          dislike: 2,
          imageLink: "/images/tempelhoferfeld.jpg"
        },
        {
          name: "Tiergarten",
          description: "Großer Park im Herzen von Berlin",
          rating: 5,
          like: 60,
          dislike: 3,
          imageLink: "/images/Tiergarten.jpeg"
        }
      ]
    };
  },
  computed: {
    totalLikes()   { return this.places.reduce((a,p) => a + (p.like     || 0), 0); },
    totalDislikes(){ return this.places.reduce((a,p) => a + (p.dislike  || 0), 0); }
  },
  methods: {
    onRate({ index, like }) {
      const item = this.places[index];
      if (!item) return;
      if (like)  item.like    = (item.like    || 0) + 1;
      else       item.dislike = (item.dislike || 0) + 1;
    }
  }
};
</script>

<style>
/* schlankes, ruhiges Layout */
:root { --bg1:#eef2f3; --bg2:#cfd6dc; --surface:#fff; --text:#111;
        --accent:#2563eb; --radius:16px; --shadow:0 12px 28px rgba(0,0,0,.08); }

* { box-sizing: border-box; }
html, body, #app { height: 100%; margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Inter, sans-serif; color: var(--text); }

.page {
  min-height: 100%;
  background: linear-gradient(135deg, var(--bg1), var(--bg2));
  display: flex; justify-content: center; align-items: flex-start;
  padding: 32px 16px;
}
.shell {
  width: min(960px, 96vw);
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 24px 20px 28px;
}
h1 { margin: 0 0 14px; color: var(--accent); font-size: 1.9rem; text-align: center; }
.stats { margin-top: 16px; text-align: center; font-weight: 600; color: #475569; }
</style>
