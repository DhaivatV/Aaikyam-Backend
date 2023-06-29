var express = require('express');
var router = express.Router();

/* GET users listing. */
// router.get('/get', function(req, res, next) {
//   res.send('respond with a resource');
// });
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if(!username || !password) {
    return res.status(400).json({ error: "Missing required fields"});
  }

  //const db = DB();
  //const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ username });

  if(!user) {
    return res.status(401).json({error : "Invalid username or password"});
  }

  if(user.password !== password){
    return res.status(401).json({error : "Invalid username or password"});
  }

  return res.status(200).json({ message : "Login succuessful"});
});


module.exports = router;