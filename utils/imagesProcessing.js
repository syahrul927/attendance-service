import multer from 'multer'
import path from 'path'
import faceApi from 'face-api.js'
import canvas from 'canvas'
import '@tensorflow/tfjs-node'
import fs from 'fs'
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

const imageStorage = multer.diskStorage({
    destination: 'images', 
    filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
    }
});

const upload = (obj) => {
  return multer(obj)
}

const makeid = (length) => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

export const noneUpload = multer()
export const imageUpload = (prop = {}) =>{
  const uniqueCode = makeid(10)
  const storage = multer.diskStorage({
    destination:prop.path,
    filename: (req, file, callback) => {
      const filesDir = `${prop.path}/${uniqueCode}`
      if (!fs.existsSync(filesDir)) {
            fs.mkdirSync(filesDir);
        }
      callback(null, `${uniqueCode}/${file.originalname}`)
    }
  })
  const obj = {
      storage: storage,
      limits: {
        fileSize: 10000000 // 10000000 Bytes = 10 MB
      },
      fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) { 
          // upload only png and jpg format
          return cb(new Error('Please upload a Image'))
        }
        req.body.code = uniqueCode
        console.log(`unique Code  : ${uniqueCode}`)
      cb(undefined, true)
    }
  }
  return upload(obj)
}