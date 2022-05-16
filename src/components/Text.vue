<template>
  <div>
    <!-- <q-page class="q-pa-sm"> -->
    <!-- <q-card class="full-width q-ma-sm">
      <q-card-section> -->
    <!-- <div class="text-h6 text-grey-8">
      Editor
    </div> -->
    <!-- </q-card-section>
      <q-card-section class="q-pa-none"> -->
    <vue-simplemde v-model="content" ref="markdownEditor" />
    <!-- </q-card-section>
    </q-card> -->
    <!-- </q-page> -->
  </div>
</template>

<script>
import VueSimplemde from "vue-simplemde";
import "simplemde/dist/simplemde.min.css";
import { useEventStore } from 'stores/event'


export default {
  name: "textEditor",
  label: "Text",
  icon: "edit",
  components: {
    VueSimplemde
  },
  computed: {
    content: {
      set(data) {
        if(data){
          this.eventStore.event.text = data
        }else{
          delete this.eventStore.event.text
        }
      },
      get() {
        if (!("text" in this.eventStore.event)){
          return ""
        }
        return this.eventStore.event.text
      }
    }
  },
  setup(){
     const eventStore = useEventStore()
     return {eventStore}
  },
  data() {
    return {};
  },
  methods: {
    setDefault: function(store){
    },
  }
};
</script>

<style>
.table-bg {
  background-color: #162b4d;
}
</style>
