<template>
  <q-dialog
    persistent
    :maximized="maximizedToggle"
    @show="shown"
    @hide="isShowing = false"
    v-model="$attrs.value"
    v-bind="$attrs"
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
           <q-form class="q-gutter-md">
                <q-input square filled clearable v-model="securityKey" type="text" label="Security Key" />
            </q-form>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script>
// import { uid,date } from "quasar";
// import { useEventStore } from 'stores/event'

// import { shallowRef,  ref, computed } from 'vue'
// import {DateTime} from 'luxon'

export default {
  name: "CrossSigningDialog",
  inheritAttrs: false,
  data() {
    return {
      securityKey: '',
    };
  },
  methods: {
    finalize: function() {
      
    },
    shown() {
      this.isShowing = true
    }
  }
};
</script>
