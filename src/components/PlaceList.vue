<template>
  <section>
    <h2>Places</h2>

    <!-- v-for rendert mehrfach PlaceItem -->
    <PlaceItem
      v-for="(p, index) in places"
      :key="index"
      :place="p"
    />
  </section>
</template>

<script>
import PlaceItem from "./PlaceItem.vue";

export default {
  name: "PlaceList",
  components: { PlaceItem },
  props: {
    places: Array
  }
};
</script>
