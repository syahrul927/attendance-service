import express from "express"
import fb from '../config/firebase.js'
import imagePath from '../constanta/pathImageConst.js'
import path from 'path'
const db = fb.firestore()
import { fileURLToPath } from 'url'
import {faceapi as faceApi, canv as canvas, imageUpload} from '../utils/imagesProcessing.js'
const user = db.collection('tm_user')
const router = express.Router()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post('/absen/check', imageUpload(imagePath.ABSEN).single('file'), async (req, res) => {
    const body = req.body
    // Load the face detection models   
    const image = await canvas.loadImage(path.join(__dirname,`../images/${req.file.filename}`))
    const labeledFaceDescriptors = await labeledImagesFix
    const faceMatcher = new faceApi.FaceMatcher(labeledFaceDescriptors, 0.7)
    const singleResult = await faceApi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
    let bestMatch = null
    if (singleResult) {
        bestMatch = await faceMatcher.findBestMatch(singleResult.descriptor)
    }
    if(bestMatch){
        const id = bestMatch._label
        let data = null
        await user.doc(id).get()
        .then(doc => {
            if(doc.exists){
                data = doc.data()
                data.id = doc.id
            }
        })
        if(!data){
            res.status(401).json({
                "success":false,
                "errorMessage":"Wajah tidak dikenali harap lapor ke Admin !"
            })
        }else{
            await db.collection('tt_absensi').add({
                suhu:body.suhu,
                path:req.file.path,
                userId:data.id,
                createdDate:new Date(),
                nama:data.nama
            })
            res.json({
                "success":true,
                "obj":data
            })
        }

    }

})

export default router