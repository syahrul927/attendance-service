import fb from '../config/firebase.js'
import loadLabeledImages, {loadListUser} from "../utils/labeledImage.js"
const db = fb.firestore()
const reloadLabelImages = () => {
    db.collection('tm_user').onSnapshot(async docSnapshot => {
        const label = await loadListUser()
        console.log(`Reload labeled Images data set`)
        global.labeledImagesFix = loadLabeledImages(label)
    })
}

export default reloadLabelImages