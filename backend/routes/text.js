const express = require('express');
const { MongoClient } = require("mongodb");
const axios = require('axios');

const router = express.Router();

function calculateTextSimilarity(lyricsData) {
    const url = 'http://13.127.219.110:8080/text_similarity';
  
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

router.post('/upload', async function(req, res){

    const {lyrics, title, author, genre} = req.body;
    console.log({lyrics, title, author, genre});
    const uri = "mongodb+srv://dv:dv123@aaikyam.pehbz3m.mongodb.net/?retryWrites=true&w=majority";
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
                Lyrics: lyrics 
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
                    Lyrics: lyrics 
                }
                
                await pLyricsFileCollection.insertOne(doc);
                res.send("Plagiarized lyrics ");

            }
            else{
                const doc = {
                    Title: title,
                    Author: author,
                    Genre: genre,
                    Lyrics: lyrics 
                }
    
                await lyricsFileCollection.insertOne(doc);
                res.send("unique lyrics uploaded");
            }
    }


}

});

module.exports = router;