
import { faceapi as faceApi, canv as canvas} from '../utils/imagesProcessing.js'

import fb from '../config/firebase.js'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = fb.firestore()
const userDb = db.collection('tm_user')
import path from 'path'
const loadLabeledImages = (listUser = []) =>  {
    const labels = listUser
    // console.log(`data dari db :${loadLabeledImages()}`)    
    return Promise.all(
        labels.map(async label => {
            const desc = []
            for (let i = 1; i <= 2; i++) {
                const img = await canvas.loadImage(path.join(__dirname,`../labeled_images/${label}/${i}.png`))
                const detections = await faceApi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                desc.push(detections.descriptor)
              }
        
              return new faceApi.LabeledFaceDescriptors(label, desc)
        })
    )
}
export const loadListUser = async () => {
    const listUserDoc = []
    await userDb.get()
    .then(doc =>{
        doc.forEach(item => {
            listUserDoc.push(item.id)
        })
    })
    return listUserDoc
}
export default loadLabeledImages