const express = require('express');
const { MongoClient } = require("mongodb");
const bcrypt = require('bcrypt');

require('dotenv').config({path:'.env'});

const router = express.Router();

router.post('/aaikyam', async function (req, res) {
  const { username, email, password } = req.body;
  console.log(password)
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('aaikyam_signup_users');
    const userCollection = database.collection('user_data');

    const users = await userCollection.find().toArray();
    console.log(users);

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (users.length == 0) {
      const newUser = {
        username,
        email,
        password,
      };

      await userCollection.insertOne(newUser);
      return res.status(409).json({ error: 'New User Added' });
    }

    const existingUser = await userCollection.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (existingUser) {
      return res.status(409).json({ msg: "Username or email already exists" });
    } else {
      const newUser = {
        username,
        email,
        password,
      };

      await userCollection.insertOne(newUser);
      return res.status(409).json({ msg: 'New User Added' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

module.exports = router;