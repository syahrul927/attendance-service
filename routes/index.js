
import express from 'express'
const router = express.Router()
import bodyParser from 'body-parser'
// import auth from './authRoute'
import {authenticateToken} from '../middleware/authToken.js'
import tupperware from './tupperwareRoute.js'
router.use(bodyParser.json())
router.use(authenticateToken)
router.use(tupperware)


export default router

