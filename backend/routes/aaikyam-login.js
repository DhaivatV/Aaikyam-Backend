const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/aaikyam', async function (req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db('aaikyam_signup_users');
    const userCollection = database.collection('user_data');

    const user = await userCollection.findOne({ username });
    console.log(user);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }


    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);


    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

module.exports = router;
