const express = require('express');
const multer = require('multer');
const { MongoClient } = require("mongodb");
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const router = express.Router();

const audio = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  dest: '/var/www/uploads'
});



function calculateAudioSimilarity(audioData) {
  const url = 'http://127.0.0.1:5000/audio_similarity';

  // Construct the request body
  const requestBody = audioData;

  // Return a promise that resolves with the similarity score
  return new Promise((resolve, reject) => {
    axios
      .post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        // Resolve the promise with the similarity score
        resolve(response.data);
      })
      .catch(error => {
        // Reject the promise with the error
        reject(error);
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
  
          // Perform plagiarism check for each stored audio
        var buffer_str = data.toString('base64');
        const storedAudios = await audioFileCollection.find().toArray();
        const storedAudioDataArray = [];
        for (const storedAudio of storedAudios) {
          storedAudioDataArray.push(storedAudio.audioData);
        }

      if (storedAudioDataArray.length==0){
        await audioFileCollection.insertOne(doc);
          console.log("unique audio file added to db")
          res.send("File uploaded successfully");
      }
      else{
        const audio_data = {
          original_audio: storedAudioDataArray,
          plagiarized_audio: buffer_str
        }

        const similarity_score = Object.values(await calculateAudioSimilarity(audio_data));
        const value  = similarity_score[0];

        if (value>0.8){
          const plagiarizedFileCollection = database.collection('plagiarized_file');
          plagiarizedFileCollection.insertOne(doc);
          console.log("plagiarized audio file");
          res.send("Plagiarized File detected");
        }
        else{
          await audioFileCollection.insertOne(doc);
          console.log("unique audio file added to db")
          res.send("File uploaded successfully");
        }

      }
        
        
        }
      });
  
      
    } catch (err) {
      next(err);
    }
  });

module.exports = router;