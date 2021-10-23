import Express from 'express'
import env from 'dotenv'
import jwt from 'jsonwebtoken'
import fb from './config/firebase.js'
import routes from './routes/index.js'
const app = Express()
const router = Express.Router()
env.config()
const db = fb.firestore()

const dbUser = db.collection('users')
import bcrypt from 'bcrypt'
const saltRounds = 10
app.use(Express.json())
//face api library
// const faceApi = require('face-api.js')



app.post('/login', async (req, res) => {
    const doc = await dbUser.doc(req.body.email).get()
    if (!doc.exists) {
        res.sendStatus(403)
    } else {
        const data = doc.data()
        bcrypt.compare(req.body.password, data.password, function(err, result) {
            if(result){
                const user = {
                    email: data.email,
                    name: data.name
                }
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '10d'
                })
                res.json({
                    "status": 200,
                    "info": "OK",
                    "accessToken": accessToken
                })
            }else{
                res.sendStatus(403)
            }
        });
       
        
    }

})

app.post('/register', async (req, res) => {
    const email = req.body.email

    const doc = await dbUser.doc(email).get()
    if (doc.exists) {
        res.sendStatus(403)
    } else {
        const user = req.body
         bcrypt.genSalt(saltRounds, async function(err, salt) {
            bcrypt.hash(req.body.password, salt, async function(err, hash) {
                user.password = hash
                await dbUser.doc(email).set(user)
                res.json({
                    "status": 200,
                    "info": "OK"
                })
            });
        });
    }
})

app.use(routes)
app.listen(3000, () => {
    console.log('Running on Port 3000')
})