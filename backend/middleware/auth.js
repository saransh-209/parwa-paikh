const jwt=require("jsonwebtoken");

const verifyToken=(req,res,next)=>{

const header=req.headers.authorization;

if(!header){
return res.status(401).send("No token ❌");
}

/*
Supports both:
Bearer token
OR raw token
*/

let token;

if(header.startsWith("Bearer ")){
token=header.split(" ")[1];
}else{
token=header;
}

if(!token){
return res.status(401).send("Invalid token ❌");
}

try{

const decoded=jwt.verify(
token,
process.env.JWT_SECRET
);

req.user=decoded;

next();

}
catch(err){

if(err.name==="TokenExpiredError"){
return res.status(401).send("Session expired, login again");
}

console.log(err);
return res.status(400).send("Invalid token ❌");
}

};

module.exports=verifyToken;