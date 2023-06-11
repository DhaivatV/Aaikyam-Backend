const express = require('express');
const { MongoClient } = require("mongodb");
const axios = require('axios');
const querystring = require('querystring');



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

router.get('/spotify', function(req, res) {
  var state = generateRandomString(16);
  var scope = 'user-read-private user-read-email';
  var client_id = '9f88e8b17d2c46f9955efef314895ebe'; // Replace with your Spotify client ID
  var redirect_uri = 'http://localhost:3000/tp/login/callback';

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

    var client_id = '9f88e8b17d2c46f9955efef314895ebe';
    var client_secret = '5f0ebcba43f443be80b50a8d9dbc8b6d';
    var redirect_uri = 'http://localhost:3000/tp/login/callback';
    var code = req.query.code || null;
    var state = req.query.state || null;
  
    if (state === null) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };
      axios(authOptions)
      .then(function(response) {
        var access_token = response.data.access_token;
        var refresh_token = response.data.refresh_token;
        // Use the access token to make API requests
        // Store the access token and refresh token securely for future use
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      })
      .catch(function(error) {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      });
  }
});

module.exports = router;
