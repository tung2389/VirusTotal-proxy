const express = require('express')
const multer  = require('multer')
const zlib = require('zlib');
const FormData = require('form-data')
const fetch = require('node-fetch');
require('dotenv').config()

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage
})

const app = express()

const PORT = process.env.PORT || 3001

app.get("/", (req, res) => {
    res.send("Hello")
})

app.get("/files/:id", async (req, res) => {{
    const id = req.params.id;
    const response = await fetch(`https://www.virustotal.com/api/v3/files/${id}`, {
        method: 'GET',
        headers: {
            'x-apikey': process.env.API_KEY
        }
    });
    
    const fileInfo = await response.json();
    let resData = fileInfo.data.attributes.last_analysis_stats;
    resData.md5 = fileInfo.data.attributes.md5;
    res.send(resData);
}})

app.post("/files", upload.single('file'), async (req, res) => {
    const form = new FormData();
    form.append('file', req.file.buffer, {
        filename: req.file.originalname,
    });
    
    const response = await fetch('https://www.virustotal.com/api/v3/files', {
        method: 'POST',
        headers: {
            'x-apikey': process.env.API_KEY
        },
        body: form
    })
    
    const data = await response.json();
    res.send(data);
})

app.get('/analyses/:id', async (req, res) => {
    const id = req.params.id;
    const response = await fetch(`https://www.virustotal.com/api/v3/analyses/${id}`, {
        method: 'GET',
        headers: {
            'x-apikey': process.env.API_KEY
        }
    })

    const data = await response.json();
    res.send(data);
})

app.get("/files/upload_url", async (req, res) => {
    const response = await fetch('https://www.virustotal.com/api/v3/files/upload_url', {
        method: 'GET',
        headers: {
            'x-apikey': process.env.API_KEY
        }
    })

    const data = await response.json();
    res.send(data);
})

app.post("/bigfiles", upload.single('file'), async (req, res) => {
    const upload_url = req.body.upload_url;
    
    const form = new FormData();
    form.append('file', req.file.buffer, {
        filename: req.file.originalname,
    });

    console.log(upload_url);
    console.log(req.file);
    
    const response = await fetch(upload_url, {
        method: 'POST',
        headers: {
            'x-apikey': process.env.API_KEY
        },
        body: form
    })
    
    const data = await response.json();
    res.send(data);
})

app.get("/QRCode", (req, res) => {
    const payload = req.query.payload;
    const zipBuffer = Buffer.from(payload, 'base64')

    zlib.gunzip(zipBuffer, (error, unzipBuffer) => {
        const jsonStr = unzipBuffer.toString();
        const data = JSON.parse(jsonStr);
        res.send(data);
    });
})

app.listen(PORT, function() {
    console.log(`Server is running at port ${PORT}`)
})