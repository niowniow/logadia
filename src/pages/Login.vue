<template>
  <q-page class="window-height window-width row justify-center items-center">
    <div class="column">
      <div class="row">
        <h5 class="text-h5 text-white q-my-md">Logadia</h5>
      </div>
      <div class="row">
        <div v-if="isLoggedIn">
            Logged in as.
              <q-btn unelevated color="light-blue-7" size="lg" class="full-width" label="Logout" @click="logout()"/>
        </div>
        <div v-else>
            <q-card square bordered class="q-pa-lg shadow-1">
              <q-card-section>
                <q-form class="q-gutter-md">
                  <q-input square filled clearable v-model="user" type="text" label="username" />
                  <q-input square filled clearable v-model="password" type="password" label="password" />
                  <q-input square filled clearable v-model="homeServer" type="text" label="homeserver" />
                </q-form>
              </q-card-section>
              <q-card-actions class="q-px-md">
                <q-btn unelevated color="light-blue-7" size="lg" class="full-width" label="Login" @click="login()"/>
              </q-card-actions>
              <q-card-section class="text-center q-pa-none">
                <p class="text-grey-6">Not registered? Created an Account</p>
              </q-card-section>
            </q-card>
        </div>
      </div>
        <div class="row q-col-gutter-sm q-py-sm">
            <h5 class="text-h5 text-black q-my-md">Rooms</h5>
          <div v-for="room in rooms" :key="room.name" class="">
            <q-btn
              :label="room.name"
              class="text-capitalize q-ma-sm"
              color="indigo-7"
            />
          </div>
      </div>
    </div>
   
  </q-page>
</template>

<script>
import { MatrixProvider } from "matrix-crdt";
import sdk from "matrix-js-sdk";
import { initClient,getClient } from '../utils/matrix';



export default {
  name: 'Login',
  data () {

    return {
      user: '',
      password: '',
      homeServer: "https://matrix.org",
    }
  },
  computed: {
    isLoggedIn(){
    if(this.$matrixClient==null){return false}
    return this.$matrixClient.isLoggedIn()
    },
    rooms() {
      if (this.$matrixClient){
        console.log('lo',this.$matrixClient.getRooms())
        return this.$matrixClient.getRooms()
      }
      return []
    },
  },
  methods: {
     getRooms: function(){
        if(!this.isLoggedIn){return []}
        this.$matrixClient.getRooms()//this is not async func.. remove
        .then(response => {
          //this.loading = false
          this.rooms = response
        })
        .catch(error => {
         // this.loading = false
          console.log(error)
        })
     },
     logout: function() {
        this.$q.localStorage.remove('matrixAccountData')
        this.$matrixClient.logout()
//        this.isLoggedIn = false
    },
    login: async function() {
      console.log('login using matrix')
        const loginClient = sdk.createClient(this.homeServer);

        let response = await loginClient.login("m.login.password", {"user": this.user, "password": this.password})
        console.log(this.$q.localStorage)

        if(this.$matrixProvider){
          console.log("it's still there")
        }


        this.$q.localStorage.set('matrixAccountData',{'accessToken': response.access_token,'deviceId':response.device_id,'userId':response.user_id,'baseUrl':response.home_server})

            await initClient();
            let matrixClient = getClient()
            this.$matrixClient = matrixClient

            // Extra configuration needed for certain matrix-js-sdk
            // calls to work without calling sync start functions
            matrixClient.canSupportVoip = false;
            matrixClient.clientOpts = {
            lazyLoadMembers: true,
            };

            // TODO: setup logadia space and list all rooms
            // Define default room and store in localstorage
            let defaultRoom = LocalStorage.getItem('defaultRoom')

            const provider = new MatrixProvider(this.$ydoc, matrixClient, {
                type: "id",
                id: defaultRoom.id,
                });
            provider.initialize();
            this.$matrixProvider = provider

//            this.isLoggedIn = true
    },
  }
}
</script>

<style>
.q-card {
  width: 360px;
}
</style>
