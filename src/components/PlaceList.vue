<template>
  <section>
    <PlaceItem v-for="(p,i) in places" :key="p.name ?? i" :place="p" />
  </section>
</template>

<script>
import PlaceItem from "./PlaceItem.vue";

export default {
  name: "PlaceList",
  components: { PlaceItem },
  props: { places: { type: Array, required: true } }
};
</script>


