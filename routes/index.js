
import express from 'express'
const router = express.Router()
// import auth from './authRoute'
import {authenticateToken} from '../middleware/authToken.js'
import imageRoute from './imageRoute.js'   
import absenRoute from './absenRoute.js'
router.use(absenRoute)
// router.use(authenticateToken)
router.use(imageRoute)


export default router

