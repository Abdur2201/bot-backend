import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';


const userschema=new mongoose.Schema({
    id:{
        type:String,
        default:uuidv4,
        unique:true 
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    }
});
userschema.pre('save',async function (next) {
    const user=this;
    if(this.isNew)
    {
        this.id=uuidv4();
    }
    if(!user.isModified('password')) return next();
    
    const salt=await bcrypt.genSalt(10);
    user.password=await bcrypt.hash(user.password,salt);
    next();
});

//user model !!!
const User = mongoose.model('User', userschema);
export default User;






// const express=require('express');
// const bcrypt=require('bcryptjs');
// const { v4: uuidv4 }=require('uuid');
// const { Mongoose, default: mongoose } = require('mongoose');

// const user=mongoose.model('user',userschema);

// module.exports=user;




















//    const hashedPassword = await bcrypt.hash(password, salt);

//         const newuser = new user({
//             email,
//             name,
//             password: hashedPassword  
//         });
//         await newuser.save();