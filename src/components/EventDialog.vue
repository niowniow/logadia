<template>
  <q-dialog
    persistent
    :maximized="maximizedToggle"
    @show="shown"
    @hide="isShowing = false"
    v-model="$attrs.value"
    v-bind="$attrs"
    ref="mDialog"
  >
    <q-layout container class="bg-white">
      <q-header elevated>
        <q-toolbar>
          <q-btn
            flat
            outline
            exact
            icon="cancel"
            aria-label="Cancel"
            @click="tab='0'"
            v-close-popup
          />
          <q-toolbar-title>Annotation</q-toolbar-title>
          <q-btn
            flat
            dense
            round
            exact
            @click="finalize()"
            icon="check"
            aria-label="Save"
            v-close-popup
          />
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page padding>

          <q-splitter v-model="splitterModel">
            <template v-slot:before>
              <q-tabs v-model="tab" vertical class="text-primary" active-color="primary">
                <template v-for="(item, index) in children" :key="index">
                  <q-tab
                    :name="item.id"
                    :icon="item.component.icon"
                    :label="item.component.label"
                  />
                </template>
              </q-tabs>
            </template>

            <template v-slot:after>
              <q-tab-panels
                v-model="tab"
                vertical
                draggable="false"
                transition-prev="jump-up"
                transition-next="jump-up"
              >
                <template v-for="(item, index) in children" :key="index">
                  <q-tab-panel :name="item.id">
                    <component
                      :is="item.component"
                      :key="item.component.name"
                      :ref="item.component.name"
                    ></component>
                  </q-tab-panel>
                </template>
              </q-tab-panels>
            </template>
          </q-splitter>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script>
import { uid,date } from "quasar";
import { useEventStore } from 'stores/event'

// import Todo from "../components/Todo";
// import Editor from "components/Editor";
import Datetime from "components/Datetime";
import Tags from "components/Tags";
import Text from "components/Text";
// import Foods from "components/Foods";
// import Rating from "components/Rating";
// import Paint from "components/Paint";
import Draw from "components/Draw"; 
// import Photos from "components/Photos";
// import Pollen from "components/Pollen";
// import { mapState } from "vuex";

import { shallowRef,  ref, computed } from 'vue'
import {DateTime} from 'luxon'

export default {
  name: "EventDialog",
    inheritAttrs: false,

  components: {},
  data() {
    const eventStore = useEventStore()
    return {
      syncstore: this.$syncstore,
      eventStore: eventStore,
      eventDialog: false,
      isShowing: false,
      maximizedToggle: true,

      // for the dialog
      children: [
        { component: shallowRef(Tags), id: "0" },
        { component: shallowRef(Datetime), id: "1" },
        { component: shallowRef(Draw), id: "2" },
        { component: shallowRef(Text), id: "4" },
        // { component: Editor, id: "2" },
        // { component: Foods, id: "3" },
        // { component: Rating, id: "4" },
        // { component: Paint, id: "5" },
        // { component: Photos, id: "6" },
        // { component: Pollen, id: "7" },
      ],
      tab: "0",
      splitterModel: 20
    };
  },
  methods: {
    finalize: function() {
      this.eventDialog = false;

      const {event} = this.eventStore
      this.syncstore.events[event.id] = event
    },
    editEntry(id){
      this.eventStore.$reset()
      let event =JSON.parse(JSON.stringify(this.syncstore.events[id]))
      this.eventStore.$patch({event:event})
      this.eventDialog = true;
    },
    createEvent(date_string="") {
      this.eventStore.$reset()
      let id = uid();
      this.eventStore.event.id = id

      for (var child of this.children){
        child.component.methods.setDefault(this.eventStore)
      }

      if(date_string){
        // update the datetime parameter of the event
        
        // get users zone
        // date_string = "2022-04-04"
        // const currentTime = DateTime.now()
        // const currentDate = DateTime.fromISO(date_string, {
        //   zone: currentTime.zoneName
        // });
        const currentDate = DateTime.fromISO(date_string) 
        // console.log(currentDate.toString())
        // console.log(anotherDate.toString())

        let event = {datetime:{start:currentDate.startOf('day').toISO(),end:currentDate.endOf('day').toISO()}}
        this.eventStore.$patch({event:event})
      }
      
      this.eventDialog = true;
    },
    shown() {
      this.isShowing = true
    }
  }
};
</script>
