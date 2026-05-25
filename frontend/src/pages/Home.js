import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../index.css";
import mobileBg from "../assets/mobile-bg.png";

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

const [,setShowRetry]=useState(false);

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
.get(`${process.env.REACT_APP_API_URL}/posts`)
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

<h2 style={styles.logo(theme)}>
परवा पाइख
</h2>

<div style={styles.navRight}>

<button
onClick={toggleTheme}
style={styles.themeBtn(theme)}
>
{theme === "dark" ? "🌙" : "☀️"}
</button>

{token ? (
<>

{role==="author" && (
<button
onClick={() => navigate("/create")}
style={styles.createBtn(theme)}
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

<button
style={styles.loginBtn(theme)}
onClick={()=>navigate('/login')}
>
Login
</button>

<button
style={styles.signupBtn(theme)}
onClick={()=>navigate('/signup')}
>
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
Discover

<span style={styles.highlight(theme)}>
मैथिली साहित्य
</span>

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

<h2 style={styles.whyTitle}>
Why Use This Platform?
</h2>

<div style={styles.whyGrid}>

<div style={styles.whyCard}>
✍️
<h3>Create Content</h3>

<p style={styles.whytext}>
Empower creators to write, edit, and publish original posts seamlessly through an intuitive content creation experience.
</p>

</div>

<div style={styles.whyCard}>
📖
<h3>Read & Explore</h3>

<p style={styles.whytext}>
Explore a diverse collection of poetry, stories, and articles shared by talented authors worldwide.
</p>

</div>

<div style={styles.whyCard}>
⚡
<h3>Fast & Simple</h3>

<p style={styles.whytext}>
Experience a fast, responsive, and modern interface designed for seamless navigation and user comfort.
</p>

</div>

</div>
</section>

</>
)}

{token && (

<div style={styles.postsSection(theme)}>

<h2 style={styles.sectionTitle(theme)}>
Latest Posts
</h2>

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

<span>
Recent Searches
</span>

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

[1,2,3,4,5,6].map(item=>(

<div key={item} style={styles.skeletonCard}>
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

{visiblePosts < filteredPosts.length && !loading && (

<div style={{
textAlign:'center',
marginTop:'20px',
marginBottom:'20px'
}}>

<button
style={styles.postBtn(theme)}
onClick={()=>setVisiblePosts(visiblePosts+12)}
>
See More Posts ↓
</button>

</div>

)}

</div>
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
<p>
© copyright 2026 Saransh | All Rights Reserved
</p>
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
minHeight:'100vh',
display:'flex',
flexDirection:'column',
justifyContent:'flex-start',
width:'100%',
overflowX:'hidden',

backgroundImage:
window.innerWidth <= 768
? `linear-gradient(
rgba(0,0,0,0.05),
rgba(0,0,0,0.05)
),
url(${mobileBg})`

: `url(
'https://res.cloudinary.com/djhio7kqd/image/upload/v1777919102/ChatGPT_Image_May_4_2026_11_47_57_PM_rsfpn5.png'
)`,

backgroundSize:
window.innerWidth <= 768
? 'contain'
: '100% auto',

backgroundRepeat:'no-repeat',

backgroundPosition:'center top',

backgroundColor:'#111436'
},

themeBtn:(theme)=>({
padding:'8px 12px',
borderRadius:'8px',
background:"linear-gradient(135deg, #0d0d0d, #6b6b71)",
color:"#fff",
border:`1px solid #fff`,
cursor:'pointer'
}),

navbar:(theme)=>({

position:'sticky',
top:0,
zIndex:999,

display:'flex',
justifyContent:'space-between',
alignItems:'center',

padding:'10px 18px',

height:'70px',

flexWrap:'wrap',
background:
window.innerWidth <= 768
? theme==="dark"
? 'rgba(15, 23, 42, 0.72)'
: 'rgba(226, 226, 207, 0.83)'
:
theme==="dark"
? 'rgba(15, 23, 42, 0.72)'
: 'rgba(226, 226, 207, 0.83)',

backdropFilter:
window.innerWidth <= 768
? 'blur(1px)'
: 'blur(2px)',

borderBottom:
window.innerWidth <= 768
? theme==="dark"
? '1px solid rgba(255,255,255,0.08)'
: '1px solid rgba(0,0,0,0.06)'
:
theme==="dark"
? '1px solid rgba(255,255,255,0.08)'
: '1px solid rgba(0,0,0,0.06)',

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
gap:'10px',
alignItems:'center',
flexWrap:'wrap',
justifyContent:'center'
},

loginBtn:(theme)=>({
padding:'8px 16px',
background:theme==="dark" ? '#fff' : '#111',
color:theme==="dark" ? '#111' : '#fff',
borderRadius:'8px'
}),

signupBtn:(theme)=>({
padding:'8px 16px',
background:theme==="dark" ? '#111' : '#fff',
color:theme==="dark" ? '#fff' : '#111',
borderRadius:'8px'
}),

createBtn:(theme)=>({
padding:'8px 10px',
borderRadius:'8px',
border:'1px solid #fff',
background:'transparent',
color:'#fff',
cursor:'pointer'
}),

logoutBtn:{
padding:'8px 14px',
borderRadius:'10px',
background:'linear-gradient(135deg,#ef4444,#dc2626)',
color:'white',
border:'none',
cursor:'pointer'
},

welcome:(theme)=>({
color: theme==="dark" ? "#c2c4eb": "#161720",
}),

centerBox:{
minHeight:'calc(100vh - 90px)',
display:'flex',
justifyContent:'center',
alignItems:'center',
padding:'20px',
width:'100%',
maxWidth:'1400px',
margin:'0 auto',
},

glass:{
padding: window.innerWidth <= 768 ? '25px' : '50px',
display:'flex',
flexDirection:'column',
justifyContent:'center',
alignItems:'center',
textAlign:'center',

background:'rgba(255,255,255,0.12)',
backdropFilter:'blur(8px)',

borderRadius:'28px',

width:'100%',
maxWidth: window.innerWidth <= 768 ? '320px' : '700px',

minHeight: window.innerWidth <= 768 ? '390px' : '420px',

boxShadow:'0 0 30px rgba(0,0,0,0.18)',
},
heading:(theme)=>({
fontSize:
window.innerWidth <= 768
? '48px'
: '68px',

marginBottom:'10px',
lineHeight:'1.1',
textAlign:'center',

color:theme==="dark"
? "#171f68"
: "#0986e5f4",
}),

highlight:(theme)=>({
display:'block',
marginTop:'10px',
color:theme==="dark"
? "#c129b4"
: "#4d2ab9e4",
}),

subtext:(theme)=>({
marginTop:'10px',
marginBottom:'26px',

fontSize:
window.innerWidth <= 768
? '18px'
: '28px',

lineHeight:'1.5',
textAlign:'center',

color:theme==="dark"
? "#2d2d2d"
: "#6a401ee2",
}),

primaryBtn:{
padding:'16px 34px',
background:'linear-gradient(135deg,#7c3aed,#6366f1)',
color:'white',
border:'none',
borderRadius:'16px',
fontSize:'20px',
fontWeight:'600',
cursor:'pointer',
boxShadow:'0 8px 25px rgba(99,102,241,.35)'
},

whySection:{
width:'100%',
padding:'100px 30px',
background:'#020617'
},

whyTitle:{
textAlign:'center',
fontSize:'32px',
marginBottom:'80px',
color:'white'
},

whyGrid:{
display:'grid',
gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',
gap:'30px',
maxWidth:'1300px',
margin:'0 auto'
},

whyCard:{
background:'linear-gradient(135deg,#1e1b4b,#312e81)',
padding:'40px',
borderRadius:'24px',
fontSize:'24px',
color:'#a0e1ea'
},

whytext:{
marginTop:'15px',
fontSize:'18px',
color:'#e793e4',
lineHeight:'1.5'
},

postsSection:(theme)=>({
padding:'50px',
background: theme === "dark" ? "#212031" : "#c3d5d8",
minHeight:'100vh'
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
cursor:'pointer'
}),

image:{
height:'220px',
overflow:'hidden',
background:'#111827'
},

postImage:{
width:'100%',
height:'100%',
objectFit:'cover'
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

cardBody:(theme)=>({
padding:'15px'
}),

postTitle:(theme)=>({
fontSize:'20px',
color:'#fff'
}),

author:(theme)=>({
fontSize:'16px',
marginTop:'10px',
color:'#efc08ed8'
}),

postBtn:(theme)=>({
padding:'11px 18px',
fontSize:'18px',
background:'#473cc1d9',
color:'white',
borderRadius:'15px',
border:'none'
}),

footer:(theme)=>({
padding:'10px 15px',
fontSize:'14px',
blur:'2px',
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
textAlign:'center',
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
borderRadius:'10px',
border:'none'
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
overflow:'hidden'
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
background:"linear-gradient(135deg, #6d28d9, #4f46e5)",
color:"#fff",
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