const express = require('express');
const { MongoClient } = require("mongodb");
const users = [];

app.use(express.json());

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (users.some(user => user.username === username || user.email === email)) {
    return res.status(409).json({ error: 'Username or email already exists' });
  }

  const newUser = {
    username,
    email,
    password
  };

  users.push(newUser);

  return res.status(201).json({ message: 'User registered successfully' });
});
   
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});