const express = require('express');
const { MongoClient } = require("mongodb");
const axios = require('axios');
const querystring = require('querystring');

require('dotenv').config({path:'.env'});

const router = express.Router();

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function requestAccessToken(code, redirect_uri, client_id, client_secret) {
  const url = 'https://accounts.spotify.com/api/token';

  // Construct the request body
  const requestBody = {
    code: code,
    redirect_uri: redirect_uri,
    grant_type: 'authorization_code'
  };

  // Encode client_id and client_secret for Authorization header
  const authHeader = 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64');

  // Define the headers
  const headers = {
    'Authorization': authHeader,
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  // Return a promise that resolves with the access_token and refresh_token
  return new Promise((resolve, reject) => {
    axios.post(url, querystring.stringify(requestBody), { headers: headers })
      .then(response => {
        const access_token = response.data.access_token;
        const refresh_token = response.data.refresh_token;
        // Use the access token to make API requests
        // Store the access token and refresh token securely for future use
        resolve({ access_token, refresh_token });
      })
      .catch(error => {
        reject(error);
      });
  });
}

function getSpotifyUserData(access_token) {
  const url = 'https://api.spotify.com/v1/me';

  // Define the headers
  const headers = {
    'Authorization': 'Bearer ' + access_token
  };

  // Return a promise that resolves with the response data
  return axios.get(url, { headers: headers })
    .then(response => response.data)
    .catch(error => {
      throw error;
    });
}

router.get('/login', function(req, res) {
  var state = generateRandomString(16);
  var scope = 'user-read-private user-read-email';
  var client_id =process.env.spotify_client_id; // Replace with your Spotify client ID
  var redirect_uri = 'https://aaikyam-backend.onrender.com/spotify/callback';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

router.get('/callback', function(req, res) {
    var client_id = process.env.spotify_client_id;
    var client_secret = process.env.spotify_client_secret;
    var redirect_uri = 'http://localhost:3000/spotify/callback';
    var code = req.query.code || null;
    var state = req.query.state || null;
  
    if (state === null) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      requestAccessToken(code, redirect_uri, client_id, client_secret)
        .then(tokens => {
          const { access_token, refresh_token } = tokens;
          getSpotifyUserData(access_token)
            .then(userData => {
              // Here, you can use the Spotify user data as needed
              console.log(userData);
              const uri = process.env.MONGODB_URI;
              const client = new MongoClient(uri);
              client.connect();
              const database = client.db('spotify_user_data');
              const spotifyUsers = database.collection('spotify_user');
              spotifyUsers.insertOne(userData);
              // Proceed with further actions
              res.redirect('/#' + querystring.stringify({ access_token, refresh_token }));
            })
            .catch(error => {
              res.redirect('/#' + querystring.stringify({ error: 'failed_to_get_user_data' }));
            });
        })
                .catch(error => {
          res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
        });
    }
  });
  
  module.exports = router;