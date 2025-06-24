import {User} from "../models/userModel.js";
import httpStatus from 'http-status'
import bcrypt , {hash} from 'bcrypt'
import jwt from 'jsonwebtoken';
import crypto from 'crypto'

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Please provide login details" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Username not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid password" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();
    console.log(`✅ Login successful for user: ${username}`);
    return res.status(httpStatus.OK).json({ token: token, name: user.name }); 
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const register = async(req,res) =>{
    const {name , username , password} = req.body;

    try{
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(httpStatus.FOUND).json({message : "user already exists"});
        }

        const hashedPassword = await bcrypt.hash(password , 10);

        const newUser = new User({
            name : name,
            username : username,
            password : hashedPassword,
        })
        await newUser.save();
        res.status(httpStatus.CREATED).json({message : "user registered"})
    }
    catch(err){
        res.json({message  : "something went wrong"})
    }
}

export { login , register};