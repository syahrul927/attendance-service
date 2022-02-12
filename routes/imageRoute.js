import express from 'express'
import fb from '../config/firebase.js'
import imagePath from '../constanta/pathImageConst.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import mime from 'mime'
import { faceapi as faceApi, canv as canvas, imageUpload, noneUpload, uploadS3 } from '../utils/imagesProcessing.js'
import { baseUrl, validateImage } from '../utils/labeledImage.js'
import createCsv from '../utils/csvExportUtils.js'

const router = express.Router()
const db = fb.firestore()
const user = db.collection('tm_user')

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


router.get('/user', async (req, res) => {
    const listUser = []
    const userRef = await user.get()
    userRef.forEach(doc => {
        let user = doc.data()
        user.id = doc.id
        listUser.push(user)
    })
    res.json({
        "success": true,
        "obj": listUser
    })

})

router.get('/user/export', async (req, res) => {
    const listUser = []
    const userRef = await user.get()
    userRef.forEach(doc => {
        let user = doc.data()
        user.id = doc.id
        listUser.push(user)
    })
    await createCsv(listUser)
    res.json({
        "success": true,
        "obj": listUser
    })

})
// router.post('/user', imageUpload(imagePath.DATA_SET).array('images', 2), async (req, res) => {
router.post('/user', noneUpload.array('images', 2),async (req, res) => {
    const userBody = req.body
    const nama = userBody.nama
    const telp = userBody.telp
    const images = []
    const files = req.files
    if(files.length){
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const res = await uploadS3(file)
            images.push(res.Key)
        }
        
    }
    const valid = await validateImage(images)
    if (!valid) {
        // await fs.rmSync(`./labeled_images/${userBody.code}`, { recursive: true, force: true });
        res.json({ success: false, errorMessage: "Wajah Tidak terdeteksi pada gambar" })
    } else {
        if (nama && telp) {
            await user.add({
                nama,
                telp,
                images,
                createdTm: new Date(),
                modifiedTm: new Date()
            }).then(async resp => {
                res.json({ success: true, obj: {} })
            }).catch(err => {
                console.log(err)
                res.json({ success: false, errorMessage: err })
            })
        } else {
            res.json({ success: false, errorMessage: "Variable not valid" })
        }
    }
})
router.post('/user/delete', async (req, res) => {
    const body = req.body
    if(body && body.id){
        await user.doc(body.id).delete().then(() => {
            return res.json({success:true})
        }).catch(err => {
            console.log(err)
            return res.json({success:false, errorMessage:err})
        })
    }
})

router.post('/user/update', imageUpload(imagePath.DATA_SET).array('images', 2), async (req, res) => {
    const userBody = req.body
    if (userBody.id) {
        let data = null
        await user.doc(userBody.id).get()
            .then(doc => {
                if (doc.exists) {
                    data = doc.ref
                }
            })
        if (data) {
            const nama = userBody.nama
            const telp = userBody.telp
            const images = []
            if (req.files.length) {
                const files = req.files
                files.forEach(item => {
                    if (item) {
                        images.push(item.path)
                    }
                })
            }
            if (nama && telp) {
                await data.update({
                    nama,
                    telp,
                    images,
                    modifiedTm: new Date()
                }).then(async resp => {
                    //rename folder by id
                    await fs.rmSync(`./labeled_images/${userBody.id}`, { recursive: true, force: true });
                    fs.rename(`./labeled_images/${userBody.code}`, `./labeled_images/${userBody.id}`, err => {
                        if (err) {
                            console.log(err)
                        }
                    })
                    res.json({ success: true, id: resp.id, nama, telp })
                }).catch(err => {
                    console.log(err)
                    res.json({ success: false, errorMessage: err })
                })
            } else {
                res.status(400).json({ success: false, errorMessage: "Variable not valid" })
            }
        } else {
            res.status(403).json({ success: false, errorMessage: "user not found" })
        }
    } else {
        res.status(400).json({ success: false, errorMessage: "Variable not valid" })
    }


})
router.post('/user/validate', noneUpload.single('image'), async (req, res) => {
    const result = await uploadS3(req.file)
    // Load the face detection models   
    const image = await canvas.loadImage(`${baseUrl}/s3/image/${result.Key}`)
    const labeledFaceDescriptors = await labeledImagesFix
    const faceMatcher = new faceApi.FaceMatcher(labeledFaceDescriptors, 0.5)
    const singleResult = await faceApi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
    if(!singleResult){
        return res.status(401).json({
            "success":false
        })
    }
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
        res.json({
            "success":true,
            "obj":data
        })
    }else{
        res.status(401).json({
            "success":false
        })
    }
})

router.get('/absensi', async (req, res) => {
    const list = []
    await db.collection('tt_absensi')
        .orderBy('createdDate', 'desc')
        .get()
        .then(docs => {
            docs.forEach(doc => {
                if (doc.exists) {
                    let data = doc.data()
                    data.createdDate = dateIndo(data.createdDate.toDate())
                    list.push(data)
                }
            })
        })
    res.json({ success: true, obj: list })
})
const dateIndo = (date) => {
    if (date) {
        const str = `${new String(date.getHours()).padStart(2, 0)}:${new String(date.getMinutes()).padStart(2, 0)}:${new String(date.getSeconds()).padStart(2, 0)} ${new String(date.getDate()).padStart(2, 0)}/${new String(date.getMonth() + 1).padStart(2, 0)}/${date.getFullYear()}`
        return str
    }
    return date
}
export default router