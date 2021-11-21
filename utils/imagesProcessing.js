import multer from 'multer'
import path from 'path'
import faceApi from 'face-api.js'
import canvas from 'canvas'
import '@tensorflow/tfjs-node'
import fs from 'fs'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'

import env from 'dotenv'
env.config()
import pkg from 'aws-sdk';
const { S3 } = pkg;

const bucket = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY
const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
  endpoint: 'https://objects-us-east-1.dream.io'
})

export const uploadS3 = (file) => {
  const fileStream = fs.createReadStream(file.path)
  const uploadParams = {
    Bucket: bucket,
    Body: fileStream,
    Key: file.filename
  }
  console.log('upload to aws server')
  return s3.upload(uploadParams).promise()
}

export const downloadS3 = (key) => {
  const downloadParams = {
    Key: key,
    Bucket: bucket
  }
  return s3.getObject(downloadParams).createReadStream()
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Canvas, Image, ImageData } = canvas
faceApi.env.monkeyPatch({ Canvas, Image, ImageData, fetch: fetch })


await faceApi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, '../models'))
await faceApi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, '../models'))
await faceApi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, '../models'))
export const faceapi = faceApi
export const canv = canvas

const upload = (obj) => {
  return multer(obj)
}

const makeid = (length) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

export const noneUpload = multer({ dest: 'uploads/' })
export const imageUpload = (prop = {}) => {
  const uniqueCode = makeid(10)
  const storage = multer.diskStorage({
    destination: prop.path,
    filename: (req, file, callback) => {
      const filesDir = `${prop.path}/${uniqueCode}`
      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir);
      }
      callback(null, `${uniqueCode}/${new String(file.originalname).replace(/\s/g, '')}`)
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