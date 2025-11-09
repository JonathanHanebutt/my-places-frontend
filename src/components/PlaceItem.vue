<template>
  <article class="card">
    <h3>{{ place.name }}</h3>
    <p class="desc">{{ place.description }}</p>
    <p class="rating">⭐ {{ place.rating }} • 👍 {{ place.like }} • 👎 {{ place.dislike }}</p>
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
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 15px rgba(0,0,0,.1);
  padding: 1.25rem;
  transition: transform .25s ease, box-shadow .25s ease;
}
.card:hover { transform: translateY(-4px); box-shadow: 0 6px 20px rgba(0,0,0,.15); }
h3 { margin-bottom: .25rem; color: #0077ff; }
.desc { color: #555; margin-bottom: .5rem; }
.rating { color: #444; font-weight: 600; }
</style>

