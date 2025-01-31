const express = require('express');

const {registerUser, signinUser} = require("./user.controller")


const router = express.Router();

//route for signup
router.post("/signup", registerUser);

//route for sign in
router.post("/signin", signinUser);

module.exports = router;