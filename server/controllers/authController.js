const User = require('../models/User');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken'); 

exports.register = async(req,res) =>{
    try{
        const {name,email,password,role} = req.body;

        const existing = await User.findOne({email})
        if(existing) return res.status(400).json({message:"User already exists"})

        const hashed = await bcrypt.hash(password,10);
        const gmailOnly = /^[^\s@]+@gmail\.com$/i;
        if (!gmailOnly.test(email)) {
            return res.status(400).json({ message: "Email must be a @gmail.com address" });
        }
        const allowed = ['teacher','student'];
        if (!allowed.includes(role)) {
            return res.status(400).json({ message: "Role must be 'teacher' or 'student'" });
        }

        const user = await User.create({name,email,password:hashed,role})
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
        res.json({
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        })
        console.log("Successfully registered")
    }
    catch(err){
        console.error("Registration error",err.message)
        res.status(500).json({message:"Server error"})
    }
}

exports.login = async(req,res) =>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message:"Invalid email"})
        
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch) return res.status(400).json({message:"Invalid password"})

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})

        res.json({
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        })
        console.log("Successfully logged in")
    }
    catch(err){
        console.error("Login error",err.message)
        res.status(500).json({message:"Server error"})
    }
}