const express = require('express')
const multer  = require('multer')
const FormData = require('form-data')
const fetch = require('node-fetch');
require('dotenv').config()

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage
})

const app = express()

const PORT = process.env.PORT || 3001

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
        headers: {
            'x-apikey': process.env.API_KEY
        }
    })

    const data = await response.json();
    res.send(data);
})

app.get("/files/upload_url", () => {
    
})

app.listen(PORT, function() {
    console.log(`Server is running at port ${PORT}`)
})