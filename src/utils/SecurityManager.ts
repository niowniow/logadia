/*
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { ICryptoCallbacks } from 'matrix-js-sdk/lib/matrix';
import { ISecretStorageKeyInfo } from 'matrix-js-sdk/lib/crypto/api';
import { deriveKey } from 'matrix-js-sdk/lib/crypto/key_passphrase';
import { decodeRecoveryKey } from 'matrix-js-sdk/lib/crypto/recoverykey';
import { encodeBase64 } from "matrix-js-sdk/lib/crypto/olmlib";
import { DeviceTrustLevel } from 'matrix-js-sdk/lib/crypto/CrossSigning';
import { logger } from "matrix-js-sdk/lib/logger";

import {requestKeyFromUser} from "./SecurityFrontEnd"
import { getClient } from './matrix';
// import SecurityCustomisations from "./customisations/Security";

// const reader = require("readline-sync");


// This stores the secret storage private keys in memory for the JS SDK. This is
// only meant to act as a cache to avoid prompting the user multiple times
// during the same single operation. Use `accessSecretStorage` below to scope a
// single secret storage operation, as it will clear the cached keys once the
// operation ends.
let secretStorageKeys: Record<string, Uint8Array> = {};
let secretStorageKeyInfo: Record<string, ISecretStorageKeyInfo> = {};
let secretStorageBeingAccessed = false;

let nonInteractive = false;

let dehydrationCache: {
    key?: Uint8Array;
    keyInfo?: ISecretStorageKeyInfo;
} = {};

function isCachingAllowed(): boolean {
    return secretStorageBeingAccessed;
}

/**
 * This can be used by other components to check if secret storage access is in
 * progress, so that we can e.g. avoid intermittently showing toasts during
 * secret storage setup.
 *
 * @returns {bool}
 */
export function isSecretStorageBeingAccessed(): boolean {
    return secretStorageBeingAccessed;
}

export class AccessCancelledError extends Error {
    constructor() {
        super("Secret storage access canceled");
    }
}


function makeInputToKey(
    keyInfo: ISecretStorageKeyInfo,
): (keyParams: { passphrase: string, recoveryKey: string }) => Promise<Uint8Array> {
    return async ({ passphrase, recoveryKey }) => {
        if (passphrase) {
            return deriveKey(
                passphrase,
                keyInfo.passphrase.salt,
                keyInfo.passphrase.iterations,
            );
        } else {
            return decodeRecoveryKey(recoveryKey);
        }
    };
}

export async function getSecretStorageKey(
    { keys: keyInfos }: { keys: Record<string, ISecretStorageKeyInfo> },
    ssssItemName:any,
): Promise<[string, Uint8Array]> {
    const cli = getClient();
    let keyId = await cli.getDefaultSecretStorageKeyId();
    let keyInfo:ISecretStorageKeyInfo;
    if (keyId) {
        // use the default SSSS key if set
        keyInfo = keyInfos[keyId];
        if (!keyInfo) {
            // if the default key is not available, pretend the default key
            // isn't set
            // keyId = undefined;
            keyId = '';
        }
    }
    else {
        // if no default SSSS key is set, fall back to a heuristic of using the
        // only available key, if only one key is set
        const keyInfoEntries = Object.entries(keyInfos);
        if (keyInfoEntries.length > 1) {
            throw new Error("Multiple storage key requests not implemented");
        }
        [keyId, keyInfo] = keyInfoEntries[0];
    }

    // Check the in-memory cache
    if (isCachingAllowed() && secretStorageKeys[keyId]) {
        return [keyId, secretStorageKeys[keyId]];
    }

    if (dehydrationCache.key) {
        if (await cli.checkSecretStorageKey(dehydrationCache.key, keyInfo)) {
            cacheSecretStorageKey(keyId, keyInfo, dehydrationCache.key);
            return [keyId, dehydrationCache.key];
        }
    }

    // const keyFromCustomisations = SecurityCustomisations.getSecretStorageKey?.();
    // if (keyFromCustomisations) {
    //     logger.log("Using key from security customisations (secret storage)");
    //     cacheSecretStorageKey(keyId, keyInfo, keyFromCustomisations);
    //     return [keyId, keyFromCustomisations];
    // }

    if (nonInteractive) {
        throw new Error("Could not unlock non-interactively");
    }

    const inputToKey = makeInputToKey(keyInfo);
    

    // const input = { passphrase: '', recoveryKey: '' } // TODO: add storage key prompt and verification

    // let recoveryKey = reader.question("Security Key: ");
    
    const recoveryKey = await requestKeyFromUser()
    console.log('recoveryKey',recoveryKey)
    const keyCorrect = await getClient().checkSecretStorageKey(decodeRecoveryKey(recoveryKey), keyInfo);
    if (!keyCorrect){
        throw new AccessCancelledError();
    }
    const input = {passphrase: '', recoveryKey: recoveryKey } 

    // const password = reader.question("Password: ",{ hideEchoBack: true });

    // const { finished } = Modal.createTrackedDialog("Access Secret Storage dialog", "",
    //     AccessSecretStorageDialog,
    //     /* props= */
    //     {
    //         keyInfo,
    //         checkPrivateKey: async (input) => {
    //             const key = await inputToKey(input);
    //             return await MatrixClientPeg.get().checkSecretStorageKey(key, keyInfo);
    //         },
    //     },
    //     /* className= */ null,
    //     /* isPriorityModal= */ false,
    //     /* isStaticModal= */ false,
    //     /* options= */ {
    //         onBeforeClose: async (reason) => {
    //             if (reason === "backgroundClick") {
    //                 return confirmToDismiss();
    //             }
    //             return true;
    //         },
    //     },
    // );
    // const [input] = await finished;
    if (!input) {
        throw new AccessCancelledError();
    }
    const key = await inputToKey(input);

    // Save to cache to avoid future prompts in the current session
    cacheSecretStorageKey(keyId, keyInfo, key);

    return [keyId, key];
}

export async function getDehydrationKey(
    keyInfo: ISecretStorageKeyInfo,
    checkFunc: (arg0: Uint8Array) => void,
): Promise<Uint8Array> {
    // const keyFromCustomisations = SecurityCustomisations.getSecretStorageKey?.();
    // if (keyFromCustomisations) {
    //     logger.log("Using key from security customisations (dehydration)");
    //     return keyFromCustomisations;
    // }

    const inputToKey = makeInputToKey(keyInfo);
    // const input = { passphrase: '', recoveryKey: '' } // TODO: add storage key prompt and verification
    // let recoveryKey = reader.question("Security Key: ");
    let recoveryKey = ''
    const keyCorrect = await getClient().checkSecretStorageKey(decodeRecoveryKey(recoveryKey), keyInfo);
    if (!keyCorrect){
        throw new AccessCancelledError();
    }
    const input = {passphrase: '', recoveryKey: recoveryKey } 

    // const { finished } = Modal.createTrackedDialog("Access Secret Storage dialog", "",
    //     AccessSecretStorageDialog,
    //     /* props= */
    //     {
    //         keyInfo,
    //         checkPrivateKey: async (input) => {
    //             const key = await inputToKey(input);
    //             try {
    //                 checkFunc(key);
    //                 return true;
    //             } catch (e) {
    //                 return false;
    //             }
    //         },
    //     },
    //     /* className= */ null,
    //     /* isPriorityModal= */ false,
    //     /* isStaticModal= */ false,
    //     /* options= */ {
    //         onBeforeClose: async (reason) => {
    //             if (reason === "backgroundClick") {
    //                 return confirmToDismiss();
    //             }
    //             return true;
    //         },
    //     },
    // );
    // const [input] = await finished;
    if (!input) {
        throw new AccessCancelledError();
    }
    const key = await inputToKey(input);

    // need to copy the key because rehydration (unpickling) will clobber it
    dehydrationCache = { key: new Uint8Array(key), keyInfo };

    return key;
}

function cacheSecretStorageKey(
    keyId: string,
    keyInfo: ISecretStorageKeyInfo,
    key: Uint8Array,
): void {
    if (isCachingAllowed()) {
        secretStorageKeys[keyId] = key;
        secretStorageKeyInfo[keyId] = keyInfo;
    }
}

async function onSecretRequested(
    userId: string,
    deviceId: string,
    requestId: string,
    name: string,
    deviceTrust: DeviceTrustLevel,
): Promise<string> {
    logger.log("onSecretRequested", userId, deviceId, requestId, name, deviceTrust);
    const client = getClient();
    if (userId !== client.getUserId()) {
        return '';
    }
    if (!deviceTrust || !deviceTrust.isVerified()) {
        logger.log(`Ignoring secret request from untrusted device ${deviceId}`);
        return '';
    }
    if (
        name === "m.cross_signing.master" ||
        name === "m.cross_signing.self_signing" ||
        name === "m.cross_signing.user_signing"
    ) {
        const callbacks = client.getCrossSigningCacheCallbacks();
        if (!callbacks.getCrossSigningKeyCache) return '';
        const keyId = name.replace("m.cross_signing.", "");
        const key = await callbacks.getCrossSigningKeyCache(keyId);
        if (!key) {
            logger.log(
                `${keyId} requested by ${deviceId}, but not found in cache`,
            );
        }
        if (key){
            return encodeBase64(key);
        }
    } else if (name === "m.megolm_backup.v1") {
        const key = await client.crypto.getSessionBackupPrivateKey();
        if (!key) {
            logger.log(
                `session backup key requested by ${deviceId}, but not found in cache`,
            );
        }
        if(key){
            return encodeBase64(key);
        }
    }
    logger.warn("onSecretRequested didn't recognise the secret named ", name);
    return ''
}

export const crossSigningCallbacks: ICryptoCallbacks = {
    getSecretStorageKey,
    cacheSecretStorageKey,
    onSecretRequested,
    getDehydrationKey,
};
