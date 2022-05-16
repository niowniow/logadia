import { Dialog } from 'quasar'


// TODO: make async / promise
export async function requestKeyFromUser():Promise<string> {
    return await new Promise((resolve, reject) => {
        Dialog.create({
            title: 'Prompt',
            message: 'Please provide your secret key',
            prompt: {
                model: '',
                isValid: val => val.length > 2, // << here is the magic
                type: 'text' // optional
            },
            cancel: true,
            persistent: true
            }).onOk(data => {
                console.log('dialog',data)
            resolve(data)
            }).onCancel(() => {
            console.log('cancelled')

                reject('')
            })
    })
}