const userModel = require("../models/UserModel");
const validator = require("validator")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
require('dotenv').config()

const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)

}
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Await the result of findOne
    const user = await userModel.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      // Generate a token if password matches
      const token = createToken(user._id);
      return res.status(200).json({
        success: true,
        token,
      });
    } else {
      // If password doesn't match, return 401 Unauthorized
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


//route for register

const registerUser = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Validate that all required fields are provided
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and password are required",
        });
      }
  
      // Check if the user already exists
      const exists = await userModel.findOne({ email });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "User already exists",
        });
      }
  
      // Validate email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email",
        });
      }
  
      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Please enter a strong password (at least 8 characters)",
        });
      }
  
      // Hashing user password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user
      const newUser = new userModel({
        name,
        email,
        password: hashedPassword,
      });
      const user = await newUser.save();
  
      // Generate token (assuming createToken is defined elsewhere in your code)
      const token = createToken(user._id);
  
      // Send success response
      return res.status(201).json({
        success: true,
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error in User controller API",
      });
    }
  };
  
//Route for admin Login
const adminLogin = async(req,res)=>{
  try {
    const { email, password } = req.body;

    // Log values to debug
   // console.log('Admin Email from .env:', process.env.ADMIN_EMAIL);
    //console.log('Admin Password from .env:', process.env.ADMIN_PASSWORD);
    //console.log('Request Email:', email);
    //console.log('Request Password:', password);

    // Ensure email and password are present
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Compare the email and password with environment variables
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email+password,process.env.JWT_SECRET);
      return res.status(200).json({
        success: true,
        token,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

  } catch (error) {
    console.error('Error in Admin Login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error in Admin Login API',
    });
  }
};


module.exports = {loginUser,registerUser,adminLogin}