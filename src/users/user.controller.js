const User = require("./user.model")
const jwt = require("jsonwebtoken")


// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  };


//sign up user

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Create a new user
      const user = await User.create({ name, email, password });
  
      // Generate a token
      const token = generateToken(user._id);
  
      res.status(201).json({
        message: "Account created successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };
  


//sign in user

const signinUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Validate the password
      const isPasswordValid = await user.matchPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Generate a token
      const token = generateToken(user._id);
  
      res.status(200).json({
        message: "Authentication successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };
  

module.exports = {
    registerUser,
    signinUser,
}