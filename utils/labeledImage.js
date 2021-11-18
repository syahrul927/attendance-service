
import { faceapi as faceApi, canv as canvas } from '../utils/imagesProcessing.js'

import fb from '../config/firebase.js'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = fb.firestore()
const userDb = db.collection('tm_user')
import path from 'path'
const loadLabeledImages = (listUser = []) => {
    const labels = listUser
    // console.log(`data dari db :${loadLabeledImages()}`)    
    return Promise.all(
        labels.map(async label => {
            const desc = []
            for (let i = 1; i <= 2; i++) {
                const img = await canvas.loadImage(path.join(__dirname, `../labeled_images/${label}/${i}.png`))
                const description = await faceApi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                if (description) {
                    desc.push(description.descriptor)
                } else {
                    console.log(`desc : ${description}, label : ${label}`)
                }

            }

            return new faceApi.LabeledFaceDescriptors(label, desc)
        })
    )
}
export const validateImage = async (labels = []) => {
    let isValidate = true
    for (let i = 0; i < labels.length; i++) {
        const item = labels[i];  
        console.log('load image')
        const img = await canvas.loadImage(path.join(__dirname, `../${item}`))
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
                listUserDoc.push(item.id)
            })
        })
    return listUserDoc
}
export default loadLabeledImages