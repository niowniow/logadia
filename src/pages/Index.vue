<template>
  <q-page class="">
    <EventDialog v-model="eventDialog" /> 
    <q-btn-group push>
      <q-btn push label="Prev" @click="onPrev" icon="arrow_back" />
      <q-btn push label="Today" @click="onToday" icon="today" />
      <q-btn push :label="now" />
      <q-btn push label="Next" @click="onNext" icon="arrow_forward" />
    </q-btn-group>

      

      <q-calendar-month
          ref="calendar"
          v-model="selectedDate"
          bordered
          focusable
          hoverable
          no-active-date
          :day-min-height="60"
          :day-height="0"
          @change="onChange"
          @moved="onMoved"
          @click-date="onClickDate"
          @click-day="onClickDay"
          @click-workweek="onClickWorkweek"
          @click-head-workweek="onClickHeadWorkweek"
          @click-head-day="onClickHeadDay"
        >
          <template #week="{ scope: { week, weekdays } }">
            <template
              v-for="(computedEvent, index) in getWeekEvents(week, weekdays)"
              :key="index"
            >
              <div
                :class="badgeClasses(computedEvent)"
                :style="badgeStyles(computedEvent, week.length)"
                @click="editEntry(computedEvent.event.id)"
              >
                <div
                  v-if="computedEvent.event && computedEvent.event.tags"
                  class="title q-calendar__ellipsis"
                >
                  <template
                    v-for="(_, tag, index) in computedEvent.event.tags"
                    :key="index"
                  >{{ tag }}</template>
                  <q-tooltip>
                  {{computedEvent.event.datetime ? ''+computedEvent.event.datetime.start : ''}}
                  </q-tooltip>

                </div>
              </div>
            </template>
          </template>
        </q-calendar-month>
    <!-- <q-page-container>
      
        <q-list bordered separator v-for="event in syncstore.events" :key="event">
        <div class="row">
          <q-item
            clickable
            v-ripple
            @click="editEntry(event.id)"
          >
            <q-item-section>
              <div>
                <div>{{ event }} </div>
              </div>
            </q-item-section>
          </q-item>
        </div>
      </q-list>
    </q-page-container> -->

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="secondary" @click="createEvent()" />
    </q-page-sticky>

  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import EventDialog from "../components/EventDialog";


import {
  QCalendarMonth,
  daysBetween,
  isOverlappingDates,
  parsed,
  parseDate,
  getDayIdentifier,
  today,
  indexOf
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarMonth.sass'

// The function below is used to set up our demo data
const CURRENT_DAY = new Date()
function getCurrentDay (day) {
  const newDay = new Date(CURRENT_DAY)
  newDay.setDate(day)
  const tm = parseDate(newDay)
  return tm.date
}

export default defineComponent({
  name: 'PageIndex',
  components: {
    EventDialog,
    QCalendarMonth,
    
  },
  data(){
    return {
      selectedDate: today(),
      syncstore: this.$syncstore,
      events: [
        {
          id: 1,
          title: '1st of the Month',
          details: 'Everything is funny as long as it is happening to someone else',
          start: '2022-04-01',
          end: '2022-04-01',
          bgcolor: 'light-blue'
        }],
    }
  },
  computed:{
      now: function(){

const date = new Date(this.selectedDate); // 2009-11-10
 const month = date.toLocaleString('default', { month: 'long'});


          return month + '\n' + date.getFullYear()

      },
  },
  mixins: [EventDialog], 
  methods: {
        getWeekEvents (week, weekdays) {
          const firstDay = parsed(week[ 0 ].date + ' 00:00')
          const lastDay = parsed(week[ week.length - 1 ].date + ' 23:59:59')
          const eventsWeek = []
          // this.events.forEach((event, id) => {
          const syncstore_events = Object.values(this.$syncstore.events) 
          // syncstore_events.forEach((event, id) => {  
          for(var key in this.$syncstore.events){
            const event = this.$syncstore.events[key]
            const id = event.id

            const startDate = parseDate(new Date(event.datetime.start),true)
            const endDate = parseDate(new Date(event.datetime.end),true)


            // const startDate = parsed(event.start  + ' 00:00')
            // const endDate = parsed(event.end + ' 23:59:59')

            if (isOverlappingDates(startDate, endDate, firstDay, lastDay)) {
              const left = daysBetween(firstDay, startDate, true)
              const right = daysBetween(endDate, lastDay, true)
              eventsWeek.push({
                id, // index event
                left, // Position initial day [0-6]
                right, // Number days available
                size: week.length - (left + right), // Size current event (in days)
                event // Info
              })
            }
          // })
          }

          const events = []
          if (eventsWeek.length > 0) {
            const infoWeek = eventsWeek.sort((a, b) => a.left - b.left)
            infoWeek.forEach((_, i) => {
              this.insertEvent(events, week.length, infoWeek, i, 0, 0)
            })
          //   const ev = [{'size':5},{ "size": 1, "event": { "id": 1, "title": "1st of the Month", "details": "Everything is funny as long as it is happening to someone else", "start": "2022-04-01", "end": "2022-04-01", "bgcolor": "light-blue" }},{'size':1}]
          // return ev
          }
          
          return events
        },

        insertEvent (events, weekLength, infoWeek, index, availableDays, level) {
          const iEvent = infoWeek[ index ]
          if (iEvent !== undefined && iEvent.left >= availableDays) {
            // If you have space available, more events are placed
            if (iEvent.left - availableDays) {
              // It is filled with empty events
              events.push({ size: iEvent.left - availableDays })
            }
            // The event is built
            events.push({ size: iEvent.size, event: iEvent.event })

            if (level !== 0) {
              // If it goes into recursion, then the item is deleted
              infoWeek.splice(index, 1)
            }

            const currentAvailableDays = iEvent.left + iEvent.size

            if (currentAvailableDays < weekLength) {
              const indexNextEvent = indexOf(infoWeek, e => e.id !== iEvent.id && e.left >= currentAvailableDays)

              this.insertEvent(
                events,
                weekLength,
                infoWeek,
                indexNextEvent !== -1 ? indexNextEvent : index,
                currentAvailableDays,
                level + 1
              )
            } // else: There are no more days available, end of iteration
          }
          else {
            events.push({ size: weekLength - availableDays })
            // end of iteration
          }

        },
    badgeClasses (computedEvent) {
      if (computedEvent.event !== undefined) {
        let bgcolor = "secondary" 
        return {
          'my-event': true,
          'text-white': true,
          [ `bg-${ bgcolor }` ]: true,
          'rounded-border': true,
          'q-calendar__ellipsis': true
        }
      }
      return {
        'my-void-event': true
      }
    },

    badgeStyles (computedEvent, weekLength) {
      const s = {}
      if (computedEvent.size !== undefined) {
        s.width = ((100 / weekLength) * computedEvent.size) + '%'
      }
      return s
    },

    isBetweenDatesWeek (dateStart, dateEnd, weekStart, weekEnd) {
      return (
        (dateEnd < weekEnd && dateEnd >= weekStart)
          || dateEnd === weekEnd
          || (dateEnd > weekEnd && dateStart <= weekEnd)
      )
    },

    onToday () {
      this.$refs.calendar.moveToToday()
    },
    onPrev () {
      this.$refs.calendar.prev()
    },
    onNext () {
      this.$refs.calendar.next()
    },
    onMoved (data) {
      console.log('onMoved', data)
    },
    onChange (data) {
      console.log('onChange', data)
    },
    onClickSlot(data){
      console.log('onClickSlot', data)
      
    },
    onClickDate (data) {
      this.createEvent(data.scope.timestamp.date)
    },
    onClickDay (data) {
      this.createEvent(data.scope.timestamp.date)
    },
    onClickWorkweek (data) {
      console.log('onClickWorkweek', data)
    },
    onClickHeadDay (data) {
      console.log('onClickHeadDay', data)
    },
    onClickHeadWorkweek (data) {
      console.log('onClickHeadWorkweek', data)
    }
  },

})
</script>

<style lang="sass" scoped>
.my-event
  position: relative
  display: inline-flex
  white-space: nowrap
  font-size: 12px
  height: 16px
  max-height: 16px
  margin: 1px 0 0 0
  justify-content: center
  text-overflow: ellipsis
  overflow: hidden
  cursor: pointer

.title
  position: relative
  display: flex
  justify-content: center
  align-items: center
  height: 100%

.my-void-event
  display: inline-flex
  white-space: nowrap
  height: 1px

.text-white
  color: white

.bg-blue
  background: blue

.bg-green
  background: green

.bg-orange
  background: orange

.bg-red
  background: red

.bg-teal
  background: teal

.bg-grey
  background: grey

.bg-purple
  background: purple

.rounded-border
  border-radius: 2px
</style>
