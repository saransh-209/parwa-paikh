import { useEffect,useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEdit,FaTrash } from "react-icons/fa";

function PostDetails(){

const {id}=useParams();
const navigate=useNavigate();

const [post,setPost]=useState(null);
const [showDeleteModal,setShowDeleteModal]=useState(false);

const userName=localStorage.getItem("name");


useEffect(()=>{

const fetchPost=async()=>{

try{

const res=await axios.get(
`http://localhost:5000/post/${id}`
);

setPost(res.data);

}
catch(err){
console.log(err);
}

};

fetchPost();

},[id]);


const handleDelete=async()=>{

try{

await axios.delete(
`http://localhost:5000/post/${id}`,
{
headers:{
Authorization:
`Bearer ${localStorage.getItem("token")}`
}
}
);

alert("Post deleted 🗑️");

navigate("/");

}
catch(err){
console.log(err);
alert("Error deleting ❌");
}

};



if(!post){
return(
<p style={{color:"white"}}>
Loading...
</p>
);
}


return(

<div style={styles.container}>

<div style={styles.card}>


<button
style={styles.backBtn}
onClick={()=>navigate("/")}
>
← Back
</button>



<h1 style={styles.title}>
{post.title}
</h1>



{post.image && (

<div style={styles.coverBox}>
<img
src={post.image}
alt="cover"
style={styles.coverImg}
/>
</div>

)}



<div style={styles.contentBox}>

{post.content.split("\n").map((line,index)=>(

<p
key={index}
style={styles.line}
>
{line.trim()==="" ? <br/> : line}
</p>

))}

</div>



<p style={styles.author}>
✍ {post.author}
</p>


<p style={styles.date}>
{new Date(post.createdAt).toLocaleString()}
</p>



{post.author===userName && (

<div style={styles.actions}>

<button
style={styles.editBtn}
onClick={()=>
navigate(`/edit/${id}`)
}
>
<FaEdit/> Edit
</button>


<button
style={styles.deleteBtn}
onClick={()=>
setShowDeleteModal(true)
}
>
<FaTrash/> Delete
</button>

</div>

)}


</div>



{showDeleteModal && (

<div style={styles.overlay}>

<div className="glass-box" style={styles.modal}>

<h2>
Delete Post?
</h2>

<p style={{color:"#cbd5e1"}}>
Do you really want to delete this post?
</p>


<div style={styles.modalBtns}>

<button
style={styles.cancelBtn}
onClick={()=>
setShowDeleteModal(false)
}
>
Cancel
</button>


<button
classname="danger-btn"
style={styles.deleteBtn}
onClick={()=>{
setShowDeleteModal(false);
handleDelete();
}}
>
Delete
</button>

</div>

</div>

</div>

)}


</div>

);

}



const styles={

container:{
minHeight:"100vh",
padding:"40px",
background:
"linear-gradient(135deg, #0e2457, #07033d)",
color:"white"
},

card:{
maxWidth:"760px",
margin:"auto",
background:"linear-gradient(135deg, #233552, #091e4e)",
padding:"30px",
borderRadius:"16px",
backdropFilter:"blur(12px)",
boxShadow:"0 10px 30px rgba(0,0,0,.5)"
},

backBtn:{
marginBottom:"15px",
padding:"8px 14px",
background:"#111827",
color:"white",
border:"1px solid #444",
borderRadius:"8px",
cursor:"pointer"
},

title:{marginTop: '10px',
marginBottom:"40px",
fontSize:"38px",
},

coverBox:{
marginBottom:"20px",
borderRadius:"14px",
overflow:"hidden"
},

coverImg:{
width:"100%",
height:"350px",
objectFit:"cover"
},

contentBox:{padding:"15px 15px",
marginTop:"10px"
},

line:{
marginBottom:"3px",
lineHeight:"1.45",
color:"#e2e8f0",
textAlign:"left"
},

author:{
marginTop:"20px",
color:"#14e5f4",
fontSize:'18px'
},

date:{
fontSize:"13px",
marginTop:"5px",
color:"#dfe5ed"
},

actions:{
marginTop:"25px",
display:"flex",
gap:"12px"
},

editBtn:{
padding:"10px 18px",
background:"#6366f1",
color:"white",
border:"none",
borderRadius:"8px",
cursor:"pointer"
},

deleteBtn:{
padding:"10px 18px",
background:"#ef4444",
color:"white",
border:"none",
borderRadius:"8px",
cursor:"pointer",
transition:"all .3s ease"
},

overlay:{
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,.45)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:9999
},

modal:{
padding:"35px",
borderRadius:"22px",
textAlign:"center",
minWidth:"360px",
boxShadow:"0 10px 40px rgba(0,0,0,.4)"
},

modalBtns:{
display:"flex",
justifyContent:"center",
gap:"14px",
marginTop:"22px"
},

cancelBtn:{
padding:"10px 20px",
background:"#1f2937",
color:"white",
border:"none",
borderRadius:"8px",
cursor:"pointer"
},

confirmBtn:{
padding:"10px 20px",
background:
"linear-gradient(135deg,#ef4444,#dc2626)",
color:"white",
border:"none",
borderRadius:"8px",
cursor:"pointer"
}

};

export default PostDetails;