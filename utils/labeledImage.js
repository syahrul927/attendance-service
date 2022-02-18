import { faceapi as faceApi, canv as canvas } from '../utils/imagesProcessing.js'
import env from 'dotenv'
import BaseUrl from '../constanta/baseUrl.js'
env.config()

import fb from '../config/firebase.js'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const baseUrl = BaseUrl(process.env.ENVI).url

const db = fb.firestore()
const userDb = db.collection('tm_user')
import path from 'path'
const loadLabeledImages = (listUser = []) => {
    const labels = listUser
    return Promise.all(
        labels.map(async label => {
            if (label.images && label.images.length) {
                const desc = []
                for (let i = 0; i < label.images.length; i++) {
                    console.log(`${baseUrl}/s3/image/${label.images[i]}, Deret ${label.nama} ${i}`)
                    const img = await canvas.loadImage(`${baseUrl}/s3/image/${label.images[i]}`)
                    const description = await faceApi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                    if (description) {
                        desc.push(description.descriptor)
                    }
                }
                return new faceApi.LabeledFaceDescriptors(label.id, desc)
            }
        })
    )
}
export const validateImage = async (labels = []) => {
    let isValidate = true
    for (let i = 0; i < labels.length; i++) {
        const item = labels[i];
        console.log(`load image ${item}`)
        const img = await canvas.loadImage(`${baseUrl}/s3/image/${item}`)
        const description = await faceApi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        if (!description) {
            console.log(`face not detected ${description}`)
            isValidate = false
        }

    }
    return isValidate

}
export const loadListUser = async () => {
    const listUserDoc = []
    await userDb.get()
        .then(doc => {
            doc.forEach(item => {
                let data = item.data()
                data.id = item.id
                listUserDoc.push(data)
            })
        })
    return listUserDoc
}
export default loadLabeledImages