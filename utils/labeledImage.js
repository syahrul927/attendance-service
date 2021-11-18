
import { faceapi as faceApi, canv as canvas } from '../utils/imagesProcessing.js'

import fb from '../config/firebase.js'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUrl = 'https://attendance-serviceku.herokuapp.com'

const db = fb.firestore()
const userDb = db.collection('tm_user')
import path from 'path'
import { image } from '@tensorflow/tfjs-core';
// const loadLabeledImages = (listUser = []) => {
//     const labels = listUser
//     // console.log(`data dari db :${loadLabeledImages()}`)    
//     return Promise.all(
//         labels.map(async label => {
//             const desc = []
//             for (let i = 1; i <= 2; i++) {
//                 const img = await canvas.loadImage(path.join(__dirname, `../labeled_images/${label}/${i}.png`))
//                 const description = await faceApi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
//                 if (description) {
//                     description.
//                     desc.push(description.descriptor)
//                 } else {
//                     console.log(`desc : ${description}, label : ${label}`)
//                 }

//             }

//             return new faceApi.LabeledFaceDescriptors(label, desc)
//         })
//     )
// }
const loadLabeledImages = (listUser = []) => {
    const labels = listUser
    return Promise.all(
        labels.map(async label => {
            if (label.images && label.images.length) {
                const desc = []
                for (let i = 1; i <= label.images.length; i++) {
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
//orisinil
// export const validateImage = async (labels = []) => {
//     let isValidate = true
//     for (let i = 0; i < labels.length; i++) {
//         const item = labels[i];  
//         console.log('load image')
//         const img = await canvas.loadImage(path.join(__dirname, `../${item}`))
//         const description = await faceApi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
//         if (!description) {
//             console.log(`face not detected ${description}`)
//             isValidate = false
//         }

//     }
//     return isValidate

// }
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