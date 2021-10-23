import express from 'express'
import fb from '../config/firebase.js'
import path from 'path'
import { fileURLToPath } from 'url'
import {upload, faceapi as faceApi, canv as canvas} from '../utils/imagesProcessing.js'

const router = express.Router()
const db = fb.firestore()
const tupp = db.collection('tm_tupperware')

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


router.post('/tupperware', async (req, res) => {
    const resp = await tupp.add(req.body)
    res.json({
        "data" : resp
    })
})
router.get('/tupperware', async (req, res) => {
    const listTupp = []
    const tuppRef = await tupp.get()
    tuppRef.forEach(doc => {
        let tp = doc.data()
        tp.id = doc.id
        listTupp.push(tp)
    })
    res.json({
                "data":listTupp
            })
})


const loadLabeledImages = () =>  {
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark']
    return Promise.all(
        labels.map(async label => {
            const desc = []
            for (let i = 1; i <= 2; i++) {
                const img = await canvas.loadImage(path.join(__dirname,`../labeled_images/${label}/${i}.jpg`))
                const detections = await faceApi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                desc.push(detections.descriptor)
              }
        
              return new faceApi.LabeledFaceDescriptors(label, desc)
        })
    )
}
router.post('/v1/image', upload.single('file'), async (req, res) => {
    // Load the face detection models   
    const image = await canvas.loadImage(path.join(__dirname,`../images/${req.file.filename}`))
    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceApi.FaceMatcher(labeledFaceDescriptors, 0.6)
    const singleResult = await faceApi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
    let bestMatch
    if (singleResult) {
        bestMatch = faceMatcher.findBestMatch(singleResult.descriptor)
      }
    res.json({
        "data":bestMatch
    })
})
export default router