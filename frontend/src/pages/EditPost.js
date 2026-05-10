import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";

function EditPost() {

const { id } = useParams();

const navigate = useNavigate();

const [data, setData] = useState({
title: "",
content: "",
image: ""
});

const [selectedFile, setSelectedFile] =
useState(null);

const [preview, setPreview] =
useState("");

const [loading, setLoading] =
useState(false);

const [crop, setCrop] =
useState({ x: 0, y: 0 });

const [zoom, setZoom] =
useState(1);

const [croppedAreaPixels,
setCroppedAreaPixels] =
useState(null);



const onCropComplete = (
croppedArea,
croppedAreaPixels
) => {

setCroppedAreaPixels(
croppedAreaPixels
);

};



useEffect(() => {

const fetchPost = async () => {

try {

const res = await axios.get(
`http://localhost:5000/post/${id}`
);

setData({
title: res.data.title,
content: res.data.content,
image: res.data.image || ""
});

setPreview(
res.data.image || ""
);

}
catch (err) {

console.log(err);

}

};

fetchPost();

}, [id]);



const handleUpdate = async () => {

try {

setLoading(true);

const token =
localStorage.getItem("token");

if (!token) {

alert("Please login again");

navigate("/login");

return;

}

const formData = new FormData();

formData.append(
"title",
data.title
);

formData.append(
"content",
data.content
);



if (selectedFile) {

const croppedImage =
await getCroppedImg(
preview,
croppedAreaPixels
);

const finalFile =
new File(
[croppedImage],
"cropped.jpg",
{
type: "image/jpeg"
}
);

formData.append(
"image",
finalFile
);

}



/* POST used instead of PUT */
await axios.post(
`http://localhost:5000/post/update/${id}`,
formData,
{
headers: {
Authorization: token,
"Content-Type":
"multipart/form-data"
}
}
);

alert("Post updated ✏️");

navigate(`/post/${id}`);

}
catch (err) {

console.log(
err.response?.data ||
err.message
);

alert(
err.response?.data ||
"Error updating ❌"
);

}
finally {

setLoading(false);

}

};




return (

<div style={styles.container}>

<div style={styles.card}>

<h2 style={styles.heading}>
Edit Post ✏️
</h2>



<input
style={styles.input}
value={data.title}
onChange={(e) =>
setData({
...data,
title: e.target.value
})
}
/>



<textarea
style={styles.textarea}
value={data.content}
onChange={(e) =>
setData({
...data,
content: e.target.value
})
}
/>



<h4 style={{ marginTop: "18px" }}>
Change Cover Image
</h4>



<input
type="file"
accept="image/*"
style={styles.fileInput}

onChange={(e) => {

const file =
e.target.files[0];

if (file) {

setSelectedFile(file);

setPreview(
URL.createObjectURL(file)
);

}

}}
/>





{preview && (

<>

<div style={styles.cropContainer}>

<Cropper
image={preview}
crop={crop}
zoom={zoom}
aspect={16 / 9}
onCropChange={setCrop}
onZoomChange={setZoom}
onCropComplete={onCropComplete}
/>

</div>



<input
type="range"
min={1}
max={3}
step={0.1}
value={zoom}
onChange={(e) =>
setZoom(e.target.value)
}
style={styles.slider}
/>

</>

)}




<button
style={styles.button}
onClick={handleUpdate}
>
{loading ?
"Updating..." :
"Update 🚀"}
</button>



<button
style={styles.backBtn}
onClick={() => navigate(-1)}
>
← Back
</button>

</div>

</div>

);

}



const styles = {

container: {
minHeight: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center",
padding: "40px 20px",
background:
"linear-gradient(135deg,#0f172a,#1e1b4b,#312e81)"
},

card: {
background:
"rgba(255,255,255,.05)",
backdropFilter:
"blur(12px)",
padding: "35px",
borderRadius: "16px",
width: "400px",
color: "white",
boxShadow:
"0 10px 35px rgba(0,0,0,.45)"
},

heading: {
textAlign: "center",
marginBottom: "18px"
},

input: {
width: "100%",
padding: "11px",
margin: "10px 0",
borderRadius: "8px",
border: "none"
},

textarea: {
width: "100%",
height: "130px",
padding: "11px",
margin: "10px 0",
borderRadius: "8px",
border: "none",
resize: "none"
},

fileInput: {
marginTop: "8px",
color: "white"
},

cropContainer: {
position: "relative",
width: "100%",
height: "300px",
marginTop: "20px",
background: "#111827",
borderRadius: "14px",
overflow: "hidden"
},

slider: {
width: "100%",
marginTop: "18px"
},

button: {
width: "100%",
padding: "12px",
marginTop: "20px",
background:
"linear-gradient(135deg,#6366f1,#4f46e5)",
color: "white",
border: "none",
borderRadius: "8px",
cursor: "pointer"
},

backBtn: {
width: "100%",
padding: "12px",
marginTop: "12px",
background: "#111827",
color: "white",
border: "1px solid #374151",
borderRadius: "8px",
cursor: "pointer"
}

};

export default EditPost;