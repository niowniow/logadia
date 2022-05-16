<template>
  <div>
    <!-- <q-card class="full-width q-ma-sm">
      <q-card-section> -->
        <div class="text-h6 text-grey-8">
          Start Time
          <q-btn @click="setNow('start')">Now</q-btn>
        </div>
      <!-- </q-card-section>
      <q-card-section> -->
        <div class="q-gutter-md row items-start">
          <q-input filled v-model="startTime">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  @before-show="updateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="startTimeProxy" mask="YYYY-MM-DD HH:mm">
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn
                        label="Cancel"
                        color="primary"
                        flat
                        v-close-popup
                      />
                      <q-btn
                        label="OK"
                        color="primary"
                        flat
                        @click="saveStartTime"
                        v-close-popup
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy
                  @before-show="updateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time
                    v-model="startTimeProxy"
                    mask="YYYY-MM-DD HH:mm"
                    format24h
                  >
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn
                        label="Cancel"
                        color="primary"
                        flat
                        v-close-popup
                      />
                      <q-btn
                        label="OK"
                        color="primary"
                        flat
                        @click="saveStartTime"
                        v-close-popup
                      />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      <!-- </q-card-section>
    </q-card> -->
    <!-- <q-card>
      <q-card-section> -->
        <div class="text-h6 text-grey-8">
          End Time
          <q-btn @click="setNow('end')">Now</q-btn>
          <q-toggle
            v-model="linkEndTime"
            icon="link"
          />
        </div>
      <!-- </q-card-section>
      <q-card-section> -->
        <div class="q-gutter-md row items-start">
          <q-input filled v-model="endTime" :disable="linkEndTime">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  @before-show="updateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="endTimeProxy" mask="YYYY-MM-DD HH:mm">
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn
                        label="Cancel"
                        color="primary"
                        flat
                        v-close-popup
                      />
                      <q-btn
                        label="OK"
                        color="primary"
                        flat
                        @click="saveEndTime"
                        v-close-popup
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy
                  @before-show="updateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time v-model="endTimeProxy" mask="YYYY-MM-DD HH:mm" format24h>
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn
                        label="Cancel"
                        color="primary"
                        flat
                        v-close-popup
                      />
                      <q-btn
                        label="OK"
                        color="primary"
                        flat
                        @click="saveEndTime"
                        v-close-popup
                      />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      <!-- </q-card-section>
    </q-card> -->
  </div>
</template>

<script>
import { useEventStore } from 'stores/event'
import { date } from 'quasar'


export default {
  name: "datetime",
  label: "Time",
  icon: "watch",
  components: {},
  computed: {
    startTime: {
      set(time) {
        this.eventStore.event.datetime.start = time
      },
      get() {
        return date.formatDate(this.eventStore.event.datetime.start, 'YYYY-MM-DD HH:mm:ss')
        // return this.$store.state.datetime.startTime; 
      }
    },
    endTime: {
      set(time) {
        this.eventStore.event.datetime.end = time
      },
      get() {
        if ("end" in this.eventStore.event.datetime){
            return date.formatDate(this.eventStore.event.datetime.end, 'YYYY-MM-DD HH:mm:ss')
        }else{
            return ""
        }
        // return this.$store.state.datetime.endTime;
      }
    }
  },
  data() {
    const eventStore = useEventStore()
    console.log('data',eventStore)
    return {
      eventStore: eventStore,
      content: "",
      startTimeProxy: "2019-02-22 21:02:00",
      endTimeProxy: "2019-02-22 21:02:00",
      linkEndTime: true
    };
  },
  methods: {
    setNow(which){
      let time = date.formatDate(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSSZ')
      if (which == 'start'){
        this.startTime = time
        if (this.linkEndTime){
            this.endTime = time
        }
      }else if (which == 'end'){
        this.endTime = time
      }
    },
    setDefault: function(store){
        let time = date.formatDate(new Date(), 'YYYY-MM-DDTHH:mm:ss.SSSZ')
        store.$patch({event:{datetime:{start:time, end:time}}})
    },
    saveStartTime: function() {
      if(this.linkEndTime){
        let diff = date.getDateDiff(this.startTimeProxy, this.startTime, 'seconds')
        let endTime = date.addToDate(this.endTime, {'seconds':diff})
        this.endTime = date.formatDate(endTime, 'YYYY-MM-DD HH:mm:ss')
      }
      this.startTime = this.startTimeProxy;
    },
    saveEndTime: function() {
      this.endTime = this.endTimeProxy;
    },
    updateProxy: function() {
      this.startTimeProxy = this.startTime;
      this.endTimeProxy = this.endTime;
    }
  }
};
</script>

<style>
.table-bg {
  background-color: #162b4d;
}
</style>
