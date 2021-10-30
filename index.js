import Express from 'express'
import env from 'dotenv'
import jwt from 'jsonwebtoken'
import fb from './config/firebase.js'
import cors from 'cors'
import routes from './routes/index.js'
const app = Express()
const router = Express.Router()
env.config()
const db = fb.firestore()

app.use(cors())
const dbUser = db.collection('users')
import bcrypt from 'bcrypt'
const saltRounds = 10
app.use(Express.json())
//face api library
// const faceApi = require('face-api.js')

app.post('/login', async (req, res) => {
    console.log(`login : ${req.body}`)
    const doc = await dbUser.doc(req.body.username).get()
    if (!doc.exists) {
        res.sendStatus(403)
    } else {
        const data = doc.data()
        bcrypt.compare(req.body.password, data.password, function(err, result) {
            if(result){
                const user = {
                    username: data.username
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
    const username = req.body.username
    const password = req.body.password
    if(!username||!password){
        res.sendStatus(400)
    }
    const doc = await dbUser.doc(username).get()
    if (doc.exists) {
        res.sendStatus(403)
    } else {
        const user = req.body
         bcrypt.genSalt(saltRounds, async function(err, salt) {
            bcrypt.hash(req.body.password, salt, async function(err, hash) {
                user.password = hash
                await dbUser.doc(username).set(user)
                res.json({
                    "status": 200,
                    "info": "OK"
                })
            });
        });
    }
})

app.use(routes)
app.listen(80, () => {
    console.log('Running on Port 80')
})