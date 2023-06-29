const express = require('express');
const { MongoClient } = require("mongodb");


const router = express.Router();


const uri = "mongodb+srv://dv:dv123@aaikyam.pehbz3m.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);
client.connect();
const database = client.db('aaikyam_signup_users');
const userCollection = database.collection('user_data');

const users = userCollection.find().toArray();
    


router.post('/aaikyam', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }


  if (users.length ==0)
  {
    const newUser = {
      username,
      email,
      password
    };

    userCollection.insertOne(newUser);
    return res.status(409).json({ error: 'New User Added' })
  }

  if (users.some(user => user.username === username || user.email === email)) {
    return res.status(409).json({ error: 'Username or email already exists' });
  }

  else{
    const newUser = {
      username,
      email,
      password
    };

    userCollection.insertOne(newUser);
    return res.status(409).json({ error: 'New User Added' })
  }

  


});
   

module.exports = router;