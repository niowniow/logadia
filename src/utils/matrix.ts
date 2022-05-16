import { MatrixClient,createClient } from "matrix-js-sdk";
// import * as MatrixJsSdk from "matrix-js-sdk"
// import {WebStorageSessionStore} from "matrix-js-sdk/lib/store/session/webstorage"
const WebStorageSessionStore = require('matrix-js-sdk/lib/store/session/webstorage')
import  {LocalStorageCryptoStore} from 'matrix-js-sdk/lib/crypto/store/localStorage-crypto-store';
import {getSecretStorageKey} from './SecurityManager' 
// import read from "read"
import { LocalStorage } from 'quasar'


function setHttps(link:string) {
  if (link.search(/^http[s]?\:\/\//) == -1) {
      link = 'https://' + link;
  }
  return link;
}


let matrixClient:MatrixClient;

export async function initClient(): Promise<void> {
  let localStorage = window.localStorage
    const webStorageSessionStore = new WebStorageSessionStore.WebStorageSessionStore(localStorage);
    const cryptoStorage = new LocalStorageCryptoStore(localStorage);
    const loginClient = createClient("https://matrix.org");

    let credentials:any = LocalStorage.getItem('matrixAccountData')
    console.log(credentials)
    if(!credentials){
      console.log('Could not initialize matrix: no credentials found')
      return
    }
    credentials.baseUrl = setHttps(credentials.baseUrl)

    let cryptoCallbacks = {
      getSecretStorageKey:getSecretStorageKey
    }
    matrixClient = createClient({baseUrl:"https://matrix.org",cryptoCallbacks:cryptoCallbacks,accessToken:credentials.accessToken,sessionStore:webStorageSessionStore,cryptoStore:cryptoStorage,deviceId:credentials.deviceId,userId:credentials.userId, timelineSupport: true});

    // TODO: do not init crypto here but only on request
    await matrixClient.initCrypto();

    await matrixClient.bootstrapCrossSigning({
        // authUploadDeviceSigningKeys: async func => await func(void),
    });
}

export function getClient(): MatrixClient {
    return matrixClient
  }