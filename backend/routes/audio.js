const express = require('express');
const multer = require('multer');
const { MongoClient } = require("mongodb");
const fs = require('fs');
const Tone = require("tone");
const math = require("mathjs");
const soxPath = require('sox-bin');
const { exec } = require('child_process');
const ffmpeg = require("fluent-ffmpeg");
const { PythonShell } = require('python-shell');
const path = require('path');

const router = express.Router();

const audio = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  dest: '/var/www/uploads'
});




// Function to check audio plagiarism using a Python script
function checkAudioPlagiarism(originalAudioPath, plagiarizedAudioPath) {
  return new Promise((resolve, reject) => {
    const options = {
      scriptPath: 'D:\\Aaikyam-Backend\\backend\\',
      args: [originalAudioPath, plagiarizedAudioPath],
    };
    console.log("hello")
    PythonShell.run('audio_plagiarism.py', options, (err, results) => {
      console.log("hello")
      if (err) {
        reject(err);
      } else {
        const similarity = parseFloat(results[0]);
        resolve(similarity);
        console.log("hello")
      }
    });
  });
}




router.post('/upload', audio.single('audioFile'), async function(req, res, next) {
  try {
    // Check if the request is a POST request.
    if (req.method !== 'POST') {
      res.sendStatus(405);
      return;
    }

    // Get the audio file from the request body.
    const file = req.file;

    // Check if the file is valid.
    if (!file) {
      res.sendStatus(400);
      console.log("File not valid");
      return;
    }

    console.log("File valid");
    console.log(file.mimetype);

    // Check if the file is an audio file.
    if (!file.mimetype.startsWith('audio/')) {
      res.sendStatus(400);
      return;
    }


    fs.readFile(file.path, async function(err, data) {
      if (err) {
        console.error(err);
        // Handle the error appropriately
      } else {
        const uri = "mongodb+srv://dv:dv123@aaikyam.pehbz3m.mongodb.net/?retryWrites=true&w=majority";
        const client = new MongoClient(uri);
        await client.connect();
        const database = client.db('audio_data');
        const audioFileCollection = database.collection('audio_file');
        const doc = {
          filename: file.originalname,
          folder_file_name: file.filename,
          contentType: file.mimetype,
          audioData: data
        };
        const result = await audioFileCollection.insertOne(doc);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);

        // Perform plagiarism check for each stored audio
        const storedAudios = await audioFileCollection.find().toArray();

        for (const storedAudio of storedAudios) {
          const storedAudioPath = '/var/www/uploads/' + storedAudio.folder_file_name;
          const similarity = await checkAudioPlagiarism(storedAudioPath, file.path);
          console.log(`Plagiarism similarity with ${storedAudio.filename}: ${similarity}`);
        }
      }
    });

    res.send("File uploaded successfully!");
  } catch (err) {
    next(err);
  }
});

module.exports = router;