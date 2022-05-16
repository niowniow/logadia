global.Olm = require('@matrix-org/olm');
// import * as olm from "olm";
// global.Olm = olm;

import * as Vue from "vue";
import { enableVueBindings } from "@syncedstore/core";

// make SyncedStore use Vuejs internally
enableVueBindings(Vue);


import { syncedStore, getYjsValue } from "@syncedstore/core";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";
import { MatrixProvider } from "matrix-crdt";
import * as Y from "yjs";
import sdk from "matrix-js-sdk";

// See https://matrix.org/docs/guides/usage-of-the-matrix-js-sdk
// for login methods


import { LocalStorage } from 'quasar'

import { initClient,getClient } from '../utils/matrix';


// (optional, define types for TypeScript)
// type Todo = { completed: booleanprovider, title: string };

// Create your SyncedStore store
const syncstore = syncedStore({ events: {}, config: {} });

// Create a document that syncs automatically
const ydoc = getYjsValue(syncstore);
const localProvider = new IndexeddbPersistence("logadia-base", ydoc);
// export const webrtcProvider = new WebrtcProvider("syncedstore-todos", doc as any);
let provider = null


// export const disconnect = () => webrtcProvider.disconnect();
// export const connect = () => webrtcProvider.connect();
function setHttps(link) {
    if (link.search(/^http[s]?\:\/\//) == -1) {
        link = 'https://' + link;
    }
    return link;
}

export default async ({ app }) => {
    app.config.globalProperties.$syncstore = syncstore
    app.config.globalProperties.$ydoc = ydoc
    app.config.globalProperties.$matrixProvider = null
    app.config.globalProperties.$matrixClient = null

      //TODO: uncomment to integrate matrix-crdt sync (and fix issues)
        // await initClient()
        // // TODO init client if crypto is enabled
        // let matrixClient = getClient()
        // app.config.globalProperties.$matrixClient = matrixClient
        // if(matrixClient){
        //     console.log('matrix initalized')
        //     matrixClient.canSupportVoip = false;
        //     matrixClient.clientOpts = {
        //             lazyLoadMembers: true,
        //             };
        
        //     let defaultRoom = LocalStorage.getItem('defaultRoom')
        //     //TODO: if defaultroom is not available, ask the user for a room
        //     //TODO: maybe we should call it "project" instead of room

        //     provider = new MatrixProvider(ydoc, matrixClient, {
        //         type: "id",
        //         id: defaultRoom.id,
        //         },
        //         undefined,
        //         {
        //           translator: { updatesAsRegularMessages: true },
        //           reader: { snapshotInterval: 10 },
        //           writer: { flushInterval: 500 },
        //         }); 
        //     provider.initialize();
        //     provider.onDocumentAvailable((e) => {
        //         console.log("ok");
        //       });
        
        //       provider.onCanWriteChanged((e) => {
        //         if (!provider.canWrite) {
        //             console.log("failed");
        //         } else {
        //             console.log("ok");
        //         }
        //       });
        
        //       provider.onDocumentUnavailable((e) => {
        //         console.log("failed");
        //       });
        //     console.log('events',Object.values(syncstore.events) )
        //     app.config.globalProperties.$matrixProvider = provider
        //     console.log('matrix provider initialized')
        // }

  }

export { syncstore,ydoc}
