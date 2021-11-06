import express from 'express'
import fb from '../config/firebase.js'
import imagePath from '../constanta/pathImageConst.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import mime from 'mime'
import {faceapi as faceApi, canv as canvas, imageUpload, noneUpload} from '../utils/imagesProcessing.js'

const router = express.Router()
const db = fb.firestore()
const user = db.collection('tm_user')

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


router.get('/user', async (req, res) =>{
    const listUser = []
    const userRef = await user.get()
    userRef.forEach(doc => {
        let user = doc.data()
        user.id = doc.id
        listUser.push(user)
    })
    res.json({
        "data":listUser
    })

})

router.post('/user', imageUpload(imagePath.DATA_SET).array('images', 2), async (req, res) =>{
    const userBody = req.body
    const nama = userBody.nama
    const telp = userBody.telp
    const images = []
    if(req.files.length){
        const files = req.files
        files.forEach(item => {
            if(item){
                images.push(item.path)
            }
        })
    }
    if(nama && telp){
        await user.add({
            nama,
            telp,
            images
        }).then(resp => {
            //rename folder by id
            fs.rename(`./labeled_images/${userBody.code}`, `./labeled_images/${resp.id}`, err => {
                if(err){
                    console.log(err)
                }
            })
            res.json({success:true, id:resp.id, nama, telp})
        }).catch(err =>{
            console.log(err)
            res.json({success:false, errorMessage:err})
        })
    }else{
        res.json({success:false, errorMessage:"Variable not valid"})
    }
})
const saveImage = (images = [], id='') => {
    images.forEach((image, idx) => {
        const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
        const response = {}
         
        response.type = matches[1]
        response.data = new Buffer(matches[2], 'base64')
        const imageBuffer = decodedImg.data
        const type = decodedImg.type
        const extension = mime.extension(type)
        const fileName =  `${idx+1}.${extension}`
        try{
              fs.writeFileSync(`.labeled_images/${id}/` + fileName, imageBuffer, 'utf8')
           }
        catch(err){
           console.error(err)
        }
    })
}
router.post('/v1/image', imageUpload(imagePath.ABSEN).single('file'), async (req, res) => {
    // Load the face detection models   
    const image = await canvas.loadImage(path.join(__dirname,`../images/${req.file.filename}`))
    const labeledFaceDescriptors = await labeledImagesFix
    const faceMatcher = new faceApi.FaceMatcher(labeledFaceDescriptors, 0.6)
    const singleResult = await faceApi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
    let bestMatch = null
    if (singleResult) {
        bestMatch = await faceMatcher.findBestMatch(singleResult.descriptor)
      }
    res.json({
        "data":bestMatch
    })
})
export default router