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
main { max-width: 600px; margin: 20px auto; font-family: sans-serif; }
</style>
