
import express from 'express'
const router = express.Router()
import bodyParser from 'body-parser'
// import auth from './authRoute'
import {authenticateToken} from '../middleware/authToken.js'
import imageRoute from './imageRoute.js'   
router.use(bodyParser.json())
router.use(authenticateToken)
router.use(imageRoute)


export default router

