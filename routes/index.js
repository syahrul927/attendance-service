
import express from 'express'
const router = express.Router()
// import auth from './authRoute'
import {authenticateToken} from '../middleware/authToken.js'
import imageRoute from './imageRoute.js'   
import absenRoute from './absenRoute.js'
router.use(absenRoute)

import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
var dir = path.join(__dirname, '../images');
var dir2 = path.join(__dirname, '../labeled_images');

var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};

router.get('/images/user/*', function (req, res) {
    var file = path.join(dir2, req.path.replace(/\/$/, '/index.html'));
    file = file.replace('/images/user', '')
    if (file.indexOf(dir2 + path.sep) !== 0) {
        return res.status(403).end('Forbidden');
    }
    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    var s = fs.createReadStream(file);
    s.on('open', function () {
        res.set('Content-Type', type);
        s.pipe(res);
    });
    s.on('error', function () {
        res.set('Content-Type', 'text/plain');
        res.status(404).end('Not found');
    });
});
router.get('/images/absensi/*', function (req, res) {
    var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
    file = file.replace('/images/absensi', '')
    if (file.indexOf(dir + path.sep) !== 0) {
        return res.status(403).end('Forbidden');
    }
    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    var s = fs.createReadStream(file);
    s.on('open', function () {
        res.set('Content-Type', type);
        s.pipe(res);
    });
    s.on('error', function () {
        res.set('Content-Type', 'text/plain');
        res.status(404).end('Not found');
    });
});


export default router

