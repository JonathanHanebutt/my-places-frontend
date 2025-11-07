<template>
  <article class="card">
    <h3>{{ place.name }}</h3>
    <p class="desc">{{ place.description }}</p>
    <p>⭐ {{ place.rating }} • 👍 {{ place.like }} • 👎 {{ place.dislike }}</p>
  </article>
</template>

<script>
export default {
  name: "PlaceItem",
  props: {
    place: { type: Object, required: true }
  }
};
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  margin: 8px 0;
}
.desc { color: #555; }
</style>
