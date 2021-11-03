
import {upload, faceapi as faceApi, canv as canvas} from '../utils/imagesProcessing.js'

import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import path from 'path'
const loadLabeledImages = () =>  {
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'Thor', 'Tony Stark', 'Ibu']
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
export default loadLabeledImages