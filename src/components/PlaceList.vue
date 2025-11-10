<template>
  <section class="grid">
   
    <PlaceItem
      v-for="(p, i) in places"
      :key="p.name ?? i"
      :place="p"
      :index="i"
      @rate="$emit('rate', $event)"
    />
  </section>
</template>

<script>
import PlaceItem from "./PlaceItem.vue";

export default {
  name: "PlaceList",
  components: { PlaceItem },
  props: { places: { type: Array, required: true } },
  emits: ["rate"]
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}
</style>
