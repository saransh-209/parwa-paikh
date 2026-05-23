import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../index.css";
import mobileBg from "../assets/mobile-bg.jpg";

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

<button onClick={toggleTheme} style={styles.themeBtn(theme)}>
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
Discover <span style={styles.highlight(theme)}>
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
<>
<section style={styles.heroSmall}>

<h1 style={styles.headingLight(theme)}>
Discover <span style={styles.highlight(theme)}>
मैथिली साहित्य
</span>
</h1>

</section>

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
minHeight:'100vh',
display:'flex',
flexDirection:'column',
justifyContent:'flex-start',
width:'100%',
overflowX:'hidden',
backgroundColor:'rgb(17, 20, 54)',

backgroundImage:`
linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.15)),
url(${window.innerWidth <= 768
? mobileBg
: "https://res.cloudinary.com/djhio7kqd/image/upload/v1777919102/ChatGPT_Image_May_4_2026_11_47_57_PM_rsfpn5.png"})
`,

backgroundSize:
window.innerWidth <= 768
? 'cover'
: '100% auto',

backgroundRepeat:'no-repeat',

backgroundPosition:
window.innerWidth <= 768
? 'center top'
: 'top center',
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
padding:'8px 25px',
height:'58px',
background:
theme==="dark"
? 'rgba(15, 23, 42, 0.6)'
: 'rgba(226, 226, 207, 0.83)',
backdropFilter:'blur(18px)',
borderBottom:'1px solid rgba(255,255,255,0.08)',
}),

logo:(theme)=>({
fontSize:'20px',
fontWeight:'600',
color: theme==="dark" ? '#fff' : '#111',
}),

navRight:{
display:'flex',
gap:'12px',
alignItems:'center',
marginRight:'15px'
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
cursor:'pointer',
}),

logoutBtn:{
padding:'8px 14px',
borderRadius:'10px',
background:'linear-gradient(135deg,#ef4444,#dc2626)',
color:'white',
},

welcome:(theme)=>({
color: theme==="dark" ? "#c2c4eb": "#161720",
}),

centerBox:{
minHeight: window.innerWidth <= 768 ? '75vh' : '95vh',
display:'flex',
justifyContent:'center',
alignItems:'center',
padding:'20px'
},

glass:{
padding: window.innerWidth <= 768 ? '28px' : '50px',
width: window.innerWidth <= 768 ? '90%' : 'auto',
display:'flex',
flexDirection:'column',
alignItems:'center',
textAlign:'center',
borderRadius:'24px',
backdropFilter:'blur(10px)',
background:'rgba(0,0,0,0.18)'
},

heading:(theme)=>({
fontSize: window.innerWidth <= 768 ? '34px' : '45px',
marginBottom:'10px',
textAlign:'center',
color:theme==="dark"
? "#070e44da"
: "#0986e5f4",
}),

headingLight:(theme)=>({
fontSize:'45px',
color:theme==="dark"
? "#1850ebc6"
: "#193063d4",
}),

highlight:(theme)=>({
color:theme==="dark"
? "#bc19a4d7"
: "#4d2ab9e4",
}),

subtext:(theme)=>({
marginTop:'0px',
marginBottom:'20px',
color:theme==="dark"
? "#0e0e0ebd"
: "#6a401ee2",
fontSize: window.innerWidth <= 768 ? '15px' : '18px',
textAlign:'center'
}),

primaryBtn:{
padding:'12px 25px',
background:'linear-gradient(135deg,#7c3aed,#6366f1)',
color:'white',
border:'none',
borderRadius:'8px'
},

whySection:{
width:'100%',
padding:'100px 30px',
background:'#020617',
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
color:'#a0e1ea',
},

whytext:{
marginTop:'15px',
fontSize:'18px',
color:'#e793e4',
lineHeight:'1.5',
},

footer:(theme)=>({
padding:'20px',
textAlign:'center',
background:'#08090bde',
color:'#fbfbfcbd',
marginTop:'auto',
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
borderRadius:'10px'
},

yesBtn:{
background:'linear-gradient(135deg,#ef4444,#dc2626)',
color:'white',
padding:'10px 18px',
borderRadius:'10px'
},

};

export default Home;