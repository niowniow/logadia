<template>
  <div>
    <!-- <q-page class="q-pa-sm"> -->
    <!-- <q-card class="full-width q-ma-sm">
    <q-card-section> -->
    <!-- <div class="text-h6 text-grey-8">
      Tags
    </div> -->
    <!-- </q-card-section>
    <q-card-section> -->
    <div class="row q-col-gutter-sm q-py-sm">
      <div v-for="tag in selectedTags" :key="tag" class="">
        <q-btn
          :label="tag"
          class="text-capitalize q-ma-sm"
          @click="deselectTag(tag)"
          color="secondary"
        />
      </div>
    </div>
    <q-separator />
    <!-- </q-card-section>
    <q-card-section> -->
    <div class="row q-col-gutter-sm q-py-sm">
      <q-btn
        icon="add"
        class="text-capitalize q-ma-sm"
        @click="createTagDialog = true"
        color="secondary"
      />
      <div v-for="tag in availableTags" :key="tag">
        <q-btn
          :label="tag"
          class="text-capitalize q-ma-sm"
          @click="selectTag(tag)"
          color="secondary"
        />
      </div>
    </div>
    <!-- </q-card-section> -->
    <!-- </q-card> -->

    <q-dialog v-model="createTagDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Create a new tag</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input clearable filled v-model="newTagName" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Create" v-close-popup @click="createTag()" />
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
  <!-- </q-page> -->
</template>

<script>
import { useEventStore } from 'stores/event'

export default {
  name: "tags",
  label: "Tags",
  icon: "tag",
  components: {},
  computed: {
    selectedTags() {
      if ("tags" in this.eventStore.event){
        return Object.keys(this.eventStore.event.tags)
      }
      return []
    },
    availableTags(){
      if ("tags" in this.$syncstore.config){
        console.log('availableTags',JSON.stringify(this.$syncstore.config.tags.availableTags))
        let available = Object.keys(this.$syncstore.config.tags.availableTags)
        // display all tags which are not already selected
        return available.filter(x => !this.selectedTags.includes(x))
      }
      return []
    }
  },
  setup(){
     const eventStore = useEventStore()
     return {eventStore}
  },
  data() {
    return {
      createTagDialog: false,
      newTagName: ""
    };
  },
  methods: {
    setDefault: function(store){
    },
    createTag: function() {
      if (this.newTagName) {
        if (!("tags" in this.$syncstore.config)){
          this.$syncstore.config.tags = {}
          this.$syncstore.config.tags.availableTags = {}
        }
        if (this.newTagName in this.$syncstore.config.tags.availableTags){
          // set warning/info that it's already in there
        }else{
          this.$syncstore.config.tags.availableTags[this.newTagName] = true
        }
      }
    },
    selectTag: function(tagName){
      if (!("tags" in this.eventStore.event)){
          this.eventStore.event.tags = {}
      }
      this.eventStore.event.tags[tagName] = true
    },
    deselectTag: function(tagName){
      delete this.eventStore.event.tags[tagName]
      // if there is no tag left in the object then we delete it
      // altogether
      if (Object.keys(this.eventStore.event.tags).length === 0){
        delete this.eventStore.event.tags
      }
    }
  }
};
</script>

<style>
.table-bg {
  background-color: #162b4d;
}
</style>
