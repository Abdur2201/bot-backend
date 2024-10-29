import express from 'express';
import bcrypt from 'bcryptjs';
import User from './users.js'; 
const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
    const { email, name, password } = req.body;

    try {
        // Check if the user already exists
        const alreadyexist = await User.findOne({ email }); // Use 'User' instead of 'user'
        if (alreadyexist) {
            return res.status(400).json({ message: "Email ID already exists!" });
        }
        
        // Create a new user
        const newuser = new User({ email, name, password }); // Password is plain text here; hashing happens in the model
        await newuser.save();

        return res.status(200).json({ message: "User created successfully", userID: newuser.id });
    } catch (error) {
        console.error('Error during signup:', error); // Log the error for debugging
        return res.status(500).json({ message: "Error occurred" });
    }
});

//login
router.post('/login', async (req, res) => {
    console.log('Login attempt with:', req.body);
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }); // Change 'user' to 'User'
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
        return res.status(500).json({ message: 'Error occurred during login', error: error.message });
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
