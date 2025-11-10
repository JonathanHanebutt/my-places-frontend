<link rel="stylesheet" href="../assets/base.css">
<template>
  <article class="card">
    <h3>{{ place.name }}</h3>
    <p class="desc" v-if="place.description">{{ place.description }}</p>
    <p class="rating" v-if="place.rating != null">
      ⭐ {{ place.rating }} • 👍 {{ place.like ?? 0 }} • 👎 {{ place.dislike ?? 0 }}
    </p>
  </article>
</template>

<script>
export default {
  name: "PlaceItem",
  props: { place: { type: Object, required: true } }
};
</script>

