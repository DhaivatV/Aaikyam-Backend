const express = require('express');
const { MongoClient } = require("mongodb");
const axios = require('axios');var router = express.Router();
const bcrypt = require('bcryptjs');


router.post('/login', function(req, res){
    const {login_id, password}= req.body;


})
module.exports = router;
