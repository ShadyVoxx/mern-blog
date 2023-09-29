import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import User from "./models/User.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken';
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";
import Post from "./models/Post.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const uploadMiddleeware = multer({ dest: 'uploads/' })

const app = express();

const salt = bcrypt.genSaltSync(10);
const secret = "someRandomString";

app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
  }));
  
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'))

await mongoose.connect("mongodb+srv://blog:YQUGi8JsUWGk0sAV@cluster0.vllvomr.mongodb.net/?retryWrites=true&w=majority")

app.post('/register', async (req,res)=>{
    const {username,password} = req.body;
    try{
    const userDoc = await User.create({
        username, 
        password: bcrypt.hashSync(password,salt) });
    res.json(userDoc);}
    catch(err){
        console.log(err);
        res.status(400).json;
    }
});

app.post("/login", async (req, res)=>{
    const {username, password} = req.body;
    try{
        const userDoc = await User.findOne({username});
        const passOk = await bcrypt.compare(password, userDoc.password);
        if (passOk){
            jwt.sign({username, id:userDoc._id},secret, {}, (err,token)=>{
                if (err) throw err;
                res.cookie('token',token).json({
                    id: userDoc._id,
                    username 
                });
            });
        }
        else{
            res.status(400).json("Wrong Credentials");
        }
    }
    catch(e){
        console.log(e);
    }
    
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => { 
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.json(info);
    });
  });

app.post('/logout', (req, res)=>{
    res.cookie(`token`,``).json('ok');
});

app.post('/post',uploadMiddleeware.single('file'), async (req,res)=>{
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length-1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
    // res.json({files:req.file});

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => { 
      if (err) {
        console.error('JWT verification error:', err);
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const {title,summary,content} = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id
    })
    res.json(postDoc);
    });





    
})

app.get('/post',async (req,res)=>{
    res.json(await Post.find()
        .populate('author', ['username'])
        .sort({createdAt: -1})
        .limit(20));
});

app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author',['username']);
    res.json(postDoc);
})

app.put('/post', uploadMiddleeware.single('file'), async (req, res) => {
    let newPath = null;
    if (req.file) {
        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);

        if (!isAuthor) {
            return res.status(400).json('You are Not the Author');
        }

        // Update the document using findByIdAndUpdate
        const updatedPostDoc = await Post.findByIdAndUpdate(
            id,
            {
                title,
                summary,
                content,
                cover: newPath ? newPath : postDoc.cover
            },
            { new: true } // This option returns the updated document
        );

        res.json(updatedPostDoc);
    });
});




app.listen(4000, () => {
    console.log("listening on port 4000");
});
