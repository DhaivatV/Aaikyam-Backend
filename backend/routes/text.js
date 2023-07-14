const express = require('express');
const { MongoClient } = require("mongodb");
const axios = require('axios');
const multer = require('multer');

require('dotenv').config({path:'.env'});

const router = express.Router();
const image = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

function calculateTextSimilarity(lyricsData) {
    const url = 'http://127.0.0.1:8000/text_similarity';
  
    // Construct the request body
    const requestBody = lyricsData;
  
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

router.post('/upload', image.single('thumbnail') ,async function(req, res){

    const {lyrics, title, author, genre} = req.body;
    const thumbnail = req.file;

    if (!thumbnail) {
      res.send({"Error":"Thumbnail not added"});
    }

    if (!thumbnail.mimetype.startsWith('image/')) {
      res.send({"Error":"Invalid Thumbnail"});
      return;
    }
   
    const thumbnailData = req.file.buffer;

    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    await client.connect();

    if ({lyrics, title, author, genre}){
        const database = client.db('lyrics_data');
        const lyricsFileCollection = database.collection('lyrics_file');
        const storedLyrics = await lyricsFileCollection.find().toArray();

        if(storedLyrics.length==0){
            const doc = {
                Title: title,
                Author: author,
                Genre: genre,
                Lyrics: lyrics,
                Thumbnail: thumbnailData.toString('base64')
            }

            await lyricsFileCollection.insertOne(doc);

            res.send("unique file uploaded")
        }
        else{
            const storedLyricsDataArray = [];
            for (const storedLyric of storedLyrics) {
                storedLyricsDataArray.push(storedLyric.Lyrics);
            }

            reqData = JSON.stringify({
                original_text:storedLyricsDataArray,
                suspicious_text: lyrics
            });

            console.log(reqData);

            const val = Object.values(await calculateTextSimilarity(reqData))[0];
            console.log(val)
            if (val==true){
                const database = client.db('lyrics_data');
                const pLyricsFileCollection = database.collection('plagiarized_lyrics_file');

                const doc = {
                    Title: title,
                    Author: author,
                    Genre: genre,
                    Lyrics: lyrics,
                    Thumbnail: thumbnailData.toString('base64')
                }
                
                await pLyricsFileCollection.insertOne(doc);
                res.send("Plagiarized lyrics ");

            }
            else{
                const doc = {
                    Title: title,
                    Author: author,
                    Genre: genre,
                    Lyrics: lyrics,
                    Thumbnail: thumbnailData.toString('base64')
                }
    
                await lyricsFileCollection.insertOne(doc);
                res.send("unique lyrics uploaded");
            }
    }


}

});

module.exports = router;