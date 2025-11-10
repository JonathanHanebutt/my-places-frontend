<template>
  <article class="card">
    <div class="image-wrap" v-if="place.imageLink">
      <img class="hero" :src="place.imageLink" :alt="place.name" />
    </div>

    <div class="content">
      <header class="title">
        <h3>{{ place.name }}</h3>
        <span class="rating" v-if="place.rating != null">⭐ {{ place.rating }}</span>
      </header>

      <p class="desc" v-if="place.description">{{ place.description }}</p>

      <div class="actions">
        <button class="btn like"  @click="$emit('rate', { index, like: true  })">👍 {{ place.like ?? 0 }}</button>
        <button class="btn nope"  @click="$emit('rate', { index, like: false })">👎 {{ place.dislike ?? 0 }}</button>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: "PlaceItem",
  props: {
    place: { type: Object, required: true },
    index: { type: Number, required: true }
  },
  emits: ["rate"]
};
</script>

<style scoped>
.card { background:#fff; border-radius:12px; box-shadow:0 6px 16px rgba(0,0,0,.05); overflow:hidden; }
.image-wrap { height: 180px; background:#f8fafc; overflow:hidden; }
.hero { width:100%; height:100%; object-fit:cover; object-position:center; display:block; }
.content { padding: 14px 16px 16px; }

.title { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:6px; }
h3 { margin:0; font-size:1.1rem; color:#0f172a; }
.rating { color:#475569; font-weight:600; }
.desc { margin:6px 0 12px; color:#334155; font-size:.95rem; }

.actions { display:flex; gap:10px; }
.btn { border:none; border-radius:8px; padding:8px 12px; cursor:pointer; font-weight:600; }
.like { background:#e6f9ec; color:#166534; }
.nope { background:#fdecec; color:#9f1239; }
</style>
