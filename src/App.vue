<template>
  <main>
    <PlaceList :places="places" />
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
        { name: "HTW Berlin", description: "Campus Wilhelminenhof an der Spree", rating: 5, like: 42, dislike: 1 },
        { name: "Tempelhofer Feld", description: "Ehemaliger Flughafen, heute Freizeitfläche", rating: 4, like: 30, dislike: 2 },
        { name: "Tiergarten", description: "Großer Park im Herzen von Berlin", rating: 5, like: 60, dislike: 3 }
      ]
    };
  }
};
</script>

<style scoped>
main {
  max-width: 960px;
  width: 100%;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2rem;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.6s ease;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 1.5rem;
  text-align: center;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
</script>

