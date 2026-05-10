const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const router = require('./router');

const User = require("./models/User");
const Post = require("./models/Post");
const upload = require("./multer");
const verifyToken = require("./middleware/auth");
const cloudinary = require("./cloudinary");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();


/* MIDDLEWARE */
app.use(cors());
app.use(router());
app.use(express.json({
limit:"10mb"
}));

app.use(express.urlencoded({
extended:true,
limit:"10mb"
}));


/* DB */
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("DB connected"))
.catch((err)=>console.log(err));


app.get("/",(req,res)=>{
res.send("Server chal raha hai 🚀");
});



/* SIGNUP */
app.post("/signup",async(req,res)=>{

try{

const {name,email,password,role}=req.body;

const existingUser=
await User.findOne({email});

if(existingUser){
return res.status(400).send(
"User already exists"
);
}

const hashedPassword=
await bcrypt.hash(password,10);

const newUser=new User({
name,
email,
password:hashedPassword,
role
});

await newUser.save();

res.send("Signup success 🔥");

}
catch(err){
console.log(err);
res.status(500).send("Error");
}

});



/* LOGIN */
app.post("/login",async(req,res)=>{

try{

const {email,password}=req.body;

const user=await User.findOne({email});

if(!user){
return res.status(400).send("User not found");
}

const isMatch=
await bcrypt.compare(
password,
user.password
);

if(!isMatch){
return res.status(400).send("Wrong password");
}

const token=jwt.sign(
{
id:user._id,
role:user.role,
name:user.name
},
process.env.JWT_SECRET,
{
expiresIn:"7d"
}
);

res.json({
token,
user
});

}
catch(err){
console.log(err);
res.status(500).send("Error");
}

});



/* DASHBOARD */
app.get(
"/dashboard",
verifyToken,
async(req,res)=>{

try{

const user=
await User.findById(req.user.id)
.select("-password");

res.json(user);

}
catch(err){
console.log(err);
res.status(500).send("Error");
}

});



/* CREATE POST */
app.post(
"/create",
verifyToken,
upload.single("image"),
async(req,res)=>{

try{

if(req.user.role!=="author"){
return res.status(403).send(
"Only author allowed ❌"
);
}

const {title,content}=req.body;

const newPost=new Post({
title,
content,
image:req.file ? req.file.path : "",
author:req.user.name,
userId:req.user.id
});

await newPost.save();

res.send("Post created 🔥");

}
catch(err){
console.log(err);
res.status(500).send(err.message);
}

});



/* ALL POSTS */
app.get("/posts",async(req,res)=>{

try{

const posts=
await Post.find()
.sort({createdAt:-1});

res.json(posts);

}
catch(err){
console.log(err);
res.status(500).send("Error");
}

});



/* SINGLE POST */
app.get("/post/:id",async(req,res)=>{

try{

const post=
await Post.findById(req.params.id);

if(!post){
return res.status(404).send(
"Post not found"
);
}

res.json(post);

}
catch(err){
console.log(err);
res.status(500).send("Error");
}

});



/* UPDATE POST */
app.post(
"/post/update/:id",
verifyToken,
upload.single("image"),
async(req,res)=>{

try{

console.log("Update route hit");
console.log(req.body);
console.log(req.file?.path);

const post=
await Post.findById(req.params.id);

if(!post){
return res.status(404).send("Not found");
}

if(post.userId.toString()!==req.user.id){
return res.status(403).send(
"Unauthorized"
);
}


post.title=
req.body?.title || post.title;

post.content=
req.body?.content || post.content;


if(req.file){

let oldImage=post.image;   

post.image=req.file.path;  

await post.save();        

if(oldImage){

const oldPublicId=
oldImage
.split("/upload/")[1]
.split(".")[0]
.replace(/v\d+\//,"");

await cloudinary.uploader.destroy(
oldPublicId
);

}

return res.send("Updated Successfully");

}


await post.save();

res.send("Updated Successfully");

}
catch(err){
console.log(err);
res.status(500).send(err.message);
}

});



/* DELETE POST */
app.delete(
"/post/:id",
verifyToken,
async(req,res)=>{

try{

const post=
await Post.findById(req.params.id);

if(!post){
return res.status(404).send(
"Post not found ❌"
);
}

if(post.userId.toString()!==req.user.id){
return res.status(403).send(
"Unauthorized ❌"
);
}

await post.deleteOne();

res.send("Post deleted 🗑️");

}
catch(err){
console.log(err);
res.status(500).send("Error");
}

});



app.listen(5000,()=>{
console.log("Server running on 5000 🚀");
});