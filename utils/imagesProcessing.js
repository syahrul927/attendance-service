import multer from 'multer'
import path from 'path'
import faceApi from 'face-api.js'
import canvas from 'canvas'
import '@tensorflow/tfjs-node'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {Canvas, Image, ImageData} = canvas
faceApi.env.monkeyPatch({Canvas, Image, ImageData, fetch:fetch})


await faceApi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, '../models'))
await faceApi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, '../models'))
await faceApi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, '../models'))
export const faceapi = faceApi
export const canv = canvas
export const imageStorage = multer.diskStorage({
    destination: 'images', 
      filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
    }
});
export const upload = multer({
    storage: imageStorage,
    limits: {
      fileSize: 10000000 // 10000000 Bytes = 10 MB
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) { 
         // upload only png and jpg format
         return cb(new Error('Please upload a Image'))
       }
     cb(undefined, true)
  }
})

