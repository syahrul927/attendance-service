import Express from 'express'
import env from 'dotenv'
import jwt from 'jsonwebtoken'
import fb from './config/firebase.js'
import cors from 'cors'
import routes from './routes/index.js'
import listener from './listener/index.js'
const app = Express()
app.use(cors())
const router = Express.Router()
env.config()
const db = fb.firestore()

const dbUser = db.collection('users')
import bcrypt from 'bcrypt'
const saltRounds = 10
app.use(Express.json())
app.use(Express.urlencoded({extended:true}))
//face api library
// const faceApi = require('face-api.js')

app.get('/', (req,res) => {
res.json({
    "status":200,
    "info":"OK"
})
})
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
                    "success": true,
                    "obj":{"accessToken": accessToken}
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
                    "success": true
                })
            });
        });
    }
})

app.use(routes)
app.listen(process.env.PORT || 3000, () => {
    console.log(`Sudah Running Mas di port ${process.env.PORT}`)
})

listener()