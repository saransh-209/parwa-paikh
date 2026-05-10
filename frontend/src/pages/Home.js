import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../index.css";

function Home(){

const navigate=useNavigate();

const token=localStorage.getItem("token");
const name=localStorage.getItem("name");
const role=localStorage.getItem("role");

const [theme, setTheme] = useState("dark");

const toggleTheme = () => {
  setTheme(prev => prev === "dark" ? "light" : "dark");
};

const [posts,setPosts]=useState([]);
const [searchTerm,setSearchTerm]=useState("");
const [searchHistory,setSearchHistory]=useState(()=>{
try{
return JSON.parse(localStorage.getItem("searchHistory")) || [];
}catch{
return [];
}
});
const [showHistory,setShowHistory]=useState(false);
const [loading,setLoading]=useState(true);
const [showRetry,setShowRetry]=useState(false);
const [visiblePosts,setVisiblePosts]=useState(12);
const [showLogoutModal,setShowLogoutModal]=useState(false);

useEffect(()=>{
document.body.classList.remove("dark","light");
document.body.classList.add(theme);   
localStorage.setItem("theme",theme);
},[theme]);

const fetchPosts=()=>{
if(!navigator.onLine){
setShowRetry(true);
setLoading(false);
return;
}
setLoading(true);
setShowRetry(false);

setTimeout(()=>{
setShowRetry(true);
},5000);

axios
.get("http://localhost:5000/posts")
.then(res=>{
setPosts(res.data);
})
.catch(err=>console.log(err))
.finally(()=>{
setLoading(false);
});
};

useEffect(()=>{

const handleOnline=()=>{
setShowRetry(false);
fetchPosts();
};

window.addEventListener("online",handleOnline);

return ()=>{
window.removeEventListener("online",handleOnline);
};

},[]);

const filteredPosts=posts.filter(post=>
post.title.toLowerCase()
.includes(searchTerm.toLowerCase())
);

const saveSearch=(term)=>{
if(!term.trim()) return;

const updated=[
term,
...searchHistory.filter(x=>x!==term)
].slice(0,6);

setSearchHistory(updated);

localStorage.setItem(
"searchHistory",
JSON.stringify(updated)
);
};

const clearHistory=()=>{
setSearchHistory([]);
localStorage.removeItem("searchHistory");
};

useEffect(()=>{
if(token){
fetchPosts();
}
},[token]);

useEffect(()=>{
if(!token){
setShowLogoutModal(false);
}
},[token]);

return(
<div style={token ? styles.container : styles.fullBgContainer}>
<div style={{flex:1}}>  
<div style={styles.navbar(theme)}>
<h2 style={styles.logo(theme)}>परवा पाइख</h2>

<div style={styles.navRight}>

<button onClick={toggleTheme} style={styles.themeBtn(theme)}>
  {theme === "dark" ? "🌙" : "☀️"}
</button>

{token ? (
<>
{role==="author" && (
<button onClick={() => navigate("/create")}
style={styles.createBtn(theme)}
onMouseEnter={(e)=>e.target.style.background='rgba(255,255,255,0.1)'}
onMouseLeave={(e)=>e.target.style.background='transparent'}
>
+ Create
</button>
)}

<span style={styles.welcome(theme)}>
Welcome, <b>{name}</b>
</span>

<button
style={styles.logoutBtn}
onClick={()=>setShowLogoutModal(true)}
>
Logout
</button>

</>
):(
<>
<button style={styles.loginBtn(theme)} onClick={()=>navigate('/login')}>
Login
</button>

<button style={styles.signupBtn(theme)} onClick={()=>navigate('/signup')}>
Sign Up
</button>
</>
)}

</div>
</div>


{!token && (
<>
<div style={styles.centerBox}>
<div className="glass-box" style={styles.glass}>

<h1 style={styles.heading(theme)}>
Discover <span style={styles.highlight(theme)}>मैथिली साहित्य</span>
</h1>

<p style={styles.subtext(theme)}>
Explore poetry, lyrics and stories from creators.
</p>

<button
style={styles.primaryBtn}
onClick={()=>navigate('/login')}
>
Get Started →
</button>

</div>
</div>

<section style={styles.whySection}>
<h2 style={styles.whyTitle}>Why Use This Platform?</h2>

<div style={styles.whyGrid}>
<div style={styles.whyCard}>
✍️
<h3>Create Content</h3>
<p style={styles.whytext}>Empower creators to write, edit, and publish original posts seamlessly through an intuitive content creation experience.</p>
</div>

<div style={styles.whyCard}>
📖
<h3>Read & Explore</h3>
<p style={styles.whytext}>Explore a diverse collection of poetry, stories, and articles shared by talented authors worldwide.</p>
</div>

<div style={styles.whyCard}>
⚡
<h3>Fast & Simple</h3>
<p style={styles.whytext}>Experience a fast, responsive, and modern interface designed for seamless navigation and user comfort.</p>
</div>
</div>
</section>
</>
)}


{token && (
<>
<section style={styles.heroSmall}>
<h1 style={styles.headingLight(theme)}>
Discover <span style={styles.highlight(theme)}>मैथिली साहित्य</span>
</h1>
</section>

<div style={styles.postsSection(theme)}>
<h2 style={styles.sectionTitle(theme)}>Latest Posts</h2>

<div style={styles.searchWrap}>

<input
value={searchTerm}
onFocus={()=>setShowHistory(true)}
onChange={(e)=>setSearchTerm(e.target.value)}
onKeyDown={(e)=>{
if(e.key==="Enter"){
saveSearch(searchTerm);
setShowHistory(false);
}
}}
placeholder="Search post by title..."
style={styles.searchInput(theme)}
/>

<button
style={styles.searchBtn(theme)}
onClick={()=>{
saveSearch(searchTerm);
setShowHistory(false);
}}
>
Search
</button>

{showHistory && searchHistory.length>0 && (
<div style={styles.historyBox}>

<div style={styles.historyTop}>
<span>Recent Searches</span>

<span
onClick={clearHistory}
style={styles.clearX}
>
✕
</span>

</div>

{searchHistory.map((item,i)=>(
<div
key={i}
style={styles.historyItem}
onClick={()=>{
setSearchTerm(item);
setShowHistory(false);
}}
>
🔍 {item}
</div>
))}

</div>
)}

</div>

<div style={styles.grid}>

{loading ? (

[1,2,3,4,5,6,7,8].map(item=>(

<div key={item} style={styles.skeletonCard}>
<div style={styles.skeletonShimmer}></div>
<div style={styles.skeletonImage}></div>
<div style={styles.skeletonLine}></div>
<div style={styles.skeletonSmall}></div>
</div>

))

) : filteredPosts.length===0 ? (

<div style={styles.noPostBox}>
<h2>No Posts Found 🔍</h2>
<p>Try another keywords.</p>
</div>

) : (

filteredPosts.slice(0,visiblePosts).map(post=>(

<div
key={post._id}
className="card-hover"
style={styles.card(theme)}
onClick={()=>navigate(`/post/${post._id}`)}
>

<div style={styles.image}>

{post.image ? (
<img
src={post.image}
alt="post cover"
style={styles.postImage}
/>
) : (
<div style={styles.noImage}>
No Cover
</div>
)}

</div>

<div style={styles.cardBody(theme)}>
<h3 style={styles.postTitle(theme)}>
{post.title}
</h3>

<p style={styles.author(theme)}>
✍ {post.author}
</p>
</div>

</div>

))

)}

</div>


{showRetry && loading && (
<div style={styles.retryOverlay}>

<div style={styles.retryModal}>

<h2 style={styles.retryTitle}>
Network Issue ⚠️
</h2>

<p style={styles.retryText}>
Posts are taking longer to load.
Waiting for internet reconnection...
</p>

<button
onClick={fetchPosts}
style={styles.retryBtn}
>
Try Again
</button>

</div>

</div>
)}


{visiblePosts < filteredPosts.length && !loading && (
<div style={{textAlign:'center',marginTop:'20px',marginBottom:'20px'}}>
<button
style={styles.postBtn(theme)}
onClick={()=>setVisiblePosts(visiblePosts+12)}
>
See More Posts ↓
</button>
</div>
)}

</div>
</>
)}


{showLogoutModal && (
<div style={styles.overlay}>
<div style={styles.modal}>

<h2 style={{marginBottom:'10px'}}>
Logout Confirmation ⚠️
</h2>

<p style={{color:'#dbeafe'}}>
Do you really want to logout?
</p>

<div style={styles.modalBtns}>

<button
style={styles.cancelBtn}
onClick={()=>setShowLogoutModal(false)}
>
Cancel
</button>

<button
style={styles.yesBtn}
onClick={()=>{
setShowLogoutModal(false);
setTimeout(()=>{
localStorage.clear();
navigate('/');
},200);
}}
>
Logout
</button>

</div>
</div>
</div>
)}

</div>
<footer style={styles.footer(theme)}>
<p>© copyright 2026 Saransh | All Rights Reserved</p>
</footer>

</div>
);
}

const styles={
container:{
background:'#1e1b4b',
minHeight:'100vh',
display:'flex',
flexDirection:'column'
},

fullBgContainer:{
  height:'100%',
  display:'flex',
  flexDirection:'column',
  justifyContent:'flex-start',
  width:'100%',
  backgroundImage:"url('https://res.cloudinary.com/djhio7kqd/image/upload/v1777919102/ChatGPT_Image_May_4_2026_11_47_57_PM_rsfpn5.png')",
  backgroundSize:'100% auto',         
  backgroundRepeat:'no-repeat',
  backgroundPosition:'top center',
  overflowX:'hidden',
  backgroundColor:'rgb(17, 20, 54)'          
},

themeBtn:(theme)=>({
padding:'8px 12px',
borderRadius:'8px',
background:
 theme === "dark"? "linear-gradient(135deg, #0d0d0d, #6b6b71)": "linear-gradient(135deg, #0d0d0d, #6b6b71)",
color: theme === "dark" ? "#fff" : "#000",
border: `1px solid ${theme==="dark" ? '#fff' : '#111'}`,
cursor:'pointer',
transition:'0.3s',
boxShadow:'0 0 0 transparent',
}),

navbar:(theme)=>({
position:'sticky',
top:0,
zIndex:999,
display:'flex',
justifyContent:'space-between',
alignItems:'center',
padding:'8px 25px',
height:'58px',
background:
theme==="dark"
? 'rgba(15, 23, 42, 0.6)'
: 'rgba(226, 226, 207, 0.83)',
backdropFilter:'blur(0px)',
WebkitBackdropFilter:'blur(18px)',
borderBottom:
theme==="dark"
? '1px solid rgba(255,255,255,0.08)'
: '1px solid rgba(0,0,0,0.06)',
boxShadow:
theme==="dark"? '0 4px 20px rgba(0,0,0,0.4)': '0 4px 20px rgba(0,0,0,0.08)',
transition:'all 0.3s ease'
}),

logo:(theme)=>({
fontSize:'20px',
fontWeight:'600',
letterSpacing:'0.5px',
color: theme==="dark" ? '#fff' : '#111',
}),

navRight:{
display:'flex',
gap:'12px',
alignItems:'center',
marginRight:'15px'
},

iconBtn:{
padding:'8px 10px',
borderRadius:'8px',
border:'1px solid rgba(64, 65, 68, 0.87)'
},

loginBtn:(theme)=>({
padding:'8px 16px',
background:theme==="dark" ? '#fff' : '#111',
color:theme==="dark" ? '#111' : '#fff',
border:`1px solid ${theme==="dark" ? '#111' : '#fff'}`,
borderRadius:'8px'
}),

signupBtn:(theme)=>({
padding:'8px 16px',
background:theme==="dark" ? '#111' : '#fff',
color:theme==="dark" ? '#fff' : '#111',
border:`1px solid ${theme==="dark" ? '#fff' : '#111'}`,
borderRadius:'8px'
}),

createBtn:(theme)=>({
padding:'8px 10px',
borderRadius:'8px',
border: `1px solid ${theme==="dark" ? '#fff' : '#111'}`,
background:'transparent',
color: theme==="dark" ? '#fff' : '#111',
cursor:'pointer',
transition:'all 0.25s ease',
}),

logoutBtn:{
padding:'8px 14px',
borderRadius:'10px',
border: '1px solid #111',
background:'linear-gradient(135deg,#ef4444,#dc2626)',
color:'white',
cursor:'pointer',
transition:'all 0.25s ease',
},

welcome:(theme)=>({color:
    theme==="dark" ? "#c2c4eb": "#161720",
}),

centerBox:{
minHeight:'95vh',
display:'flex',
justifyContent:'center',
alignItems:'center'
},

glass:{
padding:'50px',
display:'flex',
flexDirection:'column',
alignItems:'center',   
textAlign:'center'     
},

heroSmall:{
width:'100%',
height:'45vh',   
backgroundImage:"url('https://res.cloudinary.com/djhio7kqd/image/upload/v1777999093/ChatGPT_Image_May_5_2026_10_07_28_PM_cwmjde.png')",
backgroundSize:'cover',           
backgroundPosition:'center',   
backgroundRepeat:'no-repeat',
display:'flex',
justifyContent:'center',
alignItems:'center'
},

heading:(theme)=>({fontSize:'45px', marginBottom:'10px',
    color:theme==="dark" ? "#070e44da": "#0986e5f4",}
  ),

headingLight:(theme)=>({fontSize:'45px',
    color:theme==="dark" 
? "#1850ebc6"
: "#193063d4",}
),

highlight:(theme)=>({color:theme==="dark" 
? "#bc19a4d7"
: "#4d2ab9e4",}
),

subtext:(theme)=>({marginTop:'0px', marginBottom:'20px', color:theme==="dark" 
? "#0e0e0ebd"
: "#6a401ee2",
fontSize:'18px'}),

primaryBtn:{
padding:'12px 25px',
background:'linear-gradient(135deg,#7c3aed,#6366f1)',
color:'white',
border:'none',
borderRadius:'8px'
},

whySection:{
width:'100%',
padding:'100px 60px',
background:'#020617',
minHeight:'70vh',  
paddingBottom:'100px'
},

whyTitle:{
textAlign:'center',
fontSize:'32px',
marginTop:'1px',
marginBottom:'80px',
color:'white'
},

whyGrid:{
display:'grid',
gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',
gap:'30px',
maxWidth:'1300px',
minHeight:'40vh',
margin:'0 auto'
},

whyCard:{
background:'linear-gradient(135deg,#1e1b4b,#312e81)',
padding:'40px',
borderRadius:'24px',
fontSize:'24px',
color:'#a0e1ea',
boxShadow:'0 15px 40px rgba(99,102,241,.18)',
border:'1px solid rgba(255,255,255,.05)',
transform:'translateY(-8px)'
},

whytext:{
  marginTop:'15px',
  fontSize:'18px',
  color:'#e793e4',
lineHeight:'1.5',
},

postsSection:(theme)=>({
padding:'50px',
background: theme === "dark" ? "#212031" : "#c3d5d8", 
minHeight:'100vh',
transition:'0.3s'
}),

sectionTitle:(theme)=>({
fontSize:'40px',
marginBottom:'30px',
color:theme==="dark" 
? "#16b4f3dc"
: "#161515f3"
}),

grid:{
display:'grid',
gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',
gap:'25px'
},

card:(theme)=>({
background:theme==="dark" 
? "#258cedbd"
: "#3b1d95dc",
borderRadius:'12px',
overflow:'hidden',
}),

image:{
height:'220px',
overflow:'hidden',
background:'#111827',
position:'relative'
},

postImage:{
width:'100%',
height:'100%',
objectFit:'cover',
transition:'transform .6s ease',
filter:'brightness(.92)',
},

noImage:{
width:'100%',
height:'100%',
display:'flex',
justifyContent:'center',
alignItems:'center',
background:'#1f2937',
color:'#c2cad7'
},

cardBody:(theme)=>({padding:'15px',
    color:theme==="dark" 
? "#94ce0cbd"
: "#0a9bc497",
}),

postTitle:(theme)=>({fontSize:'20px',marginBottom:'1px',
    color:theme==="dark" 
? "#ffffffec"
: "#f5f8f9e5",}),

author:(theme)=>({fontSize:'16px',marginTop:'10px', marginBottom:'6px',
    color:
    theme==="dark" 
? "#e8738e"
: "#efc08ed8"}),

postBtn:(theme)=>({
padding:'11px 18px',
fontSize:'18px',
background:theme==="dark" 
? "#258cedbd"
: "#473cc1d9",
color:'white',
border:'2px solid #757376',
borderRadius:'15px',
fontWeight:'540'
}),

retryBtn:{
padding:"14px 28px",
background:"linear-gradient(135deg, #3a46ed, #332bc9)",
color:"white",
fontSize:"16px",
border:"none",
borderRadius:"14px",
fontWeight:"560",
cursor:"pointer"
},

retryOverlay:{
position:"fixed",
inset:0,
display:"flex",
justifyContent:"center",
alignItems:"center",
background:"rgba(0,0,0,0.35)",
backdropFilter:"blur(8px)",
zIndex:5000
},

retryModal:{
width:"380px",
padding:"35px",
borderRadius:"24px",
textAlign:"center",
background:"rgba(255,255,255,0.08)",
backdropFilter:"blur(18px)",
border:"1px solid rgba(255,255,255,0.12)",
boxShadow:"0 0 30px rgba(0,0,0,.35)"
},

retryTitle:{
color:"white",
fontSize:"28px",
marginBottom:"12px"
},

retryText:{
color:"#d6e7fe",
lineHeight:"1.6",
marginBottom:"25px"
},

footer:(theme)=>({
padding:'20px',
textAlign:'center',
background:
theme==="dark" 
? "#08090bde"
: "#c8d2f0ea",
color:theme==="dark" 
? "#fbfbfcbd"
: "#0d0d0de8",
marginTop:'auto',
fontWeight:'450',
marginBottom:'0',
}),

overlay:{
position:'fixed',
inset:0,
background:'rgba(0,0,0,.55)',
display:'flex',
justifyContent:'center',
alignItems:'center',
zIndex:9999
},

modal:{
background:'rgba(225, 42, 42, 0.13)',
backdropFilter:'blur(18px)',
padding:'35px',
borderRadius:'22px',
width:'400px',
height:'fit-content',
textAlign:'center',
border:'1px solid rgba(255,255,255,.12)',
boxShadow:'0 0 10px rgba(192, 18, 18, 0.45)',
color:'white'
},

modalBtns:{
display:'flex',
gap:'15px',
justifyContent:'center',
marginTop:'25px'
},

cancelBtn:{
background:'#111827',
color:'white',
padding:'10px 18px',
borderRadius:'10px'
},

yesBtn:{
background:'linear-gradient(135deg,#ef4444,#dc2626)',
color:'white',
padding:'10px 18px',
border:'none',
borderRadius:'10px'
},

skeletonCard:{
background:'#1f2937',
borderRadius:'12px',
overflow:'hidden',
position:'relative'
},

skeletonShimmer:{
position:'absolute',
top:0,
left:'-150%',
width:'60%',
height:'100%',
background:'linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent)',
animation:'shimmer 1.8s infinite'
},

skeletonImage:{
height:'160px',
background:'#374151'
},

skeletonLine:{
height:'22px',
width:'70%',
margin:'20px',
borderRadius:'8px',
background:'#4b5563'
},

skeletonSmall:{
height:'14px',
width:'45%',
margin:'20px',
marginTop:'-5px',
borderRadius:'8px',
background:'#6b7280'
},
searchWrap:{
position:"relative",
display:"flex",
gap:"12px",
marginBottom:"35px",
maxWidth:"400px"
},

searchInput:(theme)=>({
flex:1,
padding:"15px 18px",
borderRadius:"14px",
border:"1px solid rgba(255,255,255,.15)",
background: theme === "dark" ? "#2e2a5a" : "#f3f4f6",
color: theme === "dark" ? "#fff" : "#000",
}),

searchBtn:(theme)=>({
padding:"14px 22px",
border:"none",
borderRadius:"14px",
background: theme === "dark"
  ? "linear-gradient(135deg, #6d28d9, #4f46e5)"
  : "linear-gradient(180deg, #3d28d9, #46a8e5)",

color: theme === "dark" ? "#fff" : "#fefafa",
fontWeight:'300',
fontSize:'16px'
}),

historyBox:{
position:"absolute",
top:"60px",
left:0,
width:"100%",
background:"#111827",
borderRadius:"16px",
padding:"14px",
zIndex:2000
},

historyTop:{
display:"flex",
justifyContent:"space-between",
marginBottom:"12px",
color:"#cbd5e1"
},

clearX:{
cursor:"pointer",
color:"#f54f4f"
},

historyItem:{
padding:"10px",
borderRadius:"10px",
marginBottom:"6px",
background:"rgba(255,255,255,.04)",
color:"white",
cursor:"pointer"
},

noPostBox:{
gridColumn:"1 / -1",
textAlign:"center",
padding:"70px 20px",
borderRadius:"20px",
background:"rgba(255,255,255,.05)",
backdropFilter:"blur(12px)",
color:"white"
},

};

export default Home;
