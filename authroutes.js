import express from 'express';
import bcrypt from 'bcryptjs';
import user from './users.js'; // Adjusted the path
const router = express.Router();

//signup
router.post('/signup',async (req,res)=>{
    const {email,name,password}=req.body;

    try
    {
        const alreadyexist=await user.findOne({email});
        if(alreadyexist)
        {
            return res.status(400).json({message:"Email ID already exist!"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newuser=new user({email,name,password:hashedPassword});
        await newuser.save();

        return res.status(200).json({message:"User created successfully",userID:newuser.id})
    } catch(error)
    {
        return res.status(500).json({message:"Error occured"})
    }
});

//login
router.post('/login', async (req, res) => {
    console.log('Login attempt with:', req.body);  // Log the incoming request data
    const { email, password } = req.body;
  
    try {
      const user = await user.findOne({ email });
      if (!user) {
        console.log('User not found:', email);
        return res.status(400).json({ message: "User doesn't exist" });
      }
  
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.log('Password mismatch for:', email);
        return res.status(400).json({ message: "Invalid email or password" });
      }
  
      console.log('Login successful for:', email);
      return res.status(200).json({ message: 'Welcome', userID: user.id });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ message: 'Error occurred during login' });
    }
  });
  


//route exports
export const authroutes = router;








// router.post('/login',async(req,res)=>{
//     const {email,password}=req.body;
    
//     try
//     {
//         const user=await user.findOne({email});
//         if(!user)
//         {
//             return res.status(400).json({message:"User does'nt exist"});
//         }
//         const match=await bcrypt.compare(password,user.password);
//         if(!match)
//         {
//             return res.status(400).json({message:"Invalid mail ID or password"})
//         }
//         return res.status(200).json({message:'Welcome',userID:user.id});
        
//     }catch(error)
//     {
//         console.error('error during login')
//         return res.status(500).json({message:'Error occured'})
//     }
// });


// const express=require('express');
// const user=require('C:/Users/Intern- newage/Desktop/chatbot/back/users.js');
// const bcrypt=require('bcryptjs');
// const router=express.Router();
