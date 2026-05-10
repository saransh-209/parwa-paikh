import { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";

function Create() {

const navigate = useNavigate();

const [data, setData] = useState({
title: "",
content: ""
});

const [selectedFile, setSelectedFile] = useState(null);
const [preview, setPreview] = useState("");
const [loading, setLoading] = useState(false);

const [crop, setCrop] = useState({ x: 0, y: 0 });
const [zoom, setZoom] = useState(1);

const [croppedAreaPixels, setCroppedAreaPixels] =
useState(null);

const onCropComplete = (
croppedArea,
croppedAreaPixels
) => {

setCroppedAreaPixels(croppedAreaPixels);

};



const handleSubmit = async () => {

try {

if (!data.title || !data.content) {
return alert("Fill all fields ❗");
}

setLoading(true);

const token = localStorage.getItem("token");

const formData = new FormData();

formData.append("title", data.title);
formData.append("content", data.content);



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



await axios.post(
"http://localhost:5000/create",
formData,
{
headers: {
Authorization: `Bearer ${token}`,
"Content-Type": "multipart/form-data"
}
}
);

alert("Post created 🔥");

setData({
title: "",
content: ""
});

setSelectedFile(null);
setPreview("");

navigate("/");

}
catch (err) {

console.log(err);

alert(
err.response?.data || "Error ❌"
);

}
finally {

setLoading(false);

}

};




return (

<div style={styles.container}>

<div style={styles.card}>

<h2 style={styles.title}>
Create Post ✍️
</h2>



<input
style={styles.input}
placeholder="Title"
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
placeholder="Write your lyrics..."
value={data.content}
onChange={(e) =>
setData({
...data,
content: e.target.value
})
}
/>



<input
type="file"
accept="image/*"
style={styles.fileInput}

onChange={async (e) => {

const file = e.target.files[0];

if (!file) return;

try {

let finalFile = file;


/* compress only large files */
if (file.size > 1500000) {

const options = {

maxSizeMB: 1,

maxWidthOrHeight: 1600,

useWebWorker: true,

initialQuality: 0.88,

fileType: "image/jpeg"

};

finalFile =
await imageCompression(
file,
options
);

}


/* ensure jpg naming */
const convertedFile =
new File(
[finalFile],
file.name.replace(/\.\w+$/, '.jpg'),
{
type: "image/jpeg"
}
);

setSelectedFile(
convertedFile
);

setPreview(
URL.createObjectURL(convertedFile)
);

}
catch (err) {

console.log(err);

alert("Image processing failed");

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
onClick={handleSubmit}
>
{loading ? "Publishing..." : "Publish 🚀"}
</button>



<button
style={styles.backBtn}
onClick={() => navigate("/")}
>
Back
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
"linear-gradient(135deg,#0f172a,#1e1b4b)"
},

card: {
background: "rgba(255,255,255,.05)",
backdropFilter: "blur(12px)",
padding: "35px",
borderRadius: "15px",
width: "390px",
textAlign: "center",
color: "white",
border: "1px solid rgba(255,255,255,.1)",
boxShadow: "0 10px 30px rgba(0,0,0,.5)"
},

title: {
marginBottom: "20px"
},

input: {
width: "100%",
padding: "10px",
margin: "10px 0",
borderRadius: "8px",
border: "none",
outline: "none"
},

textarea: {
width: "100%",
height: "120px",
padding: "10px",
margin: "10px 0",
borderRadius: "8px",
border: "none",
outline: "none",
resize: "none"
},

fileInput: {
marginTop: "12px",
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
background:
"linear-gradient(135deg,#6d28d9,#4f46e5)",
color: "white",
border: "none",
borderRadius: "8px",
cursor: "pointer",
marginTop: "18px"
},

backBtn: {
width: "100%",
padding: "12px",
marginTop: "10px",
background: "#111827",
color: "white",
border: "1px solid #444",
borderRadius: "8px",
cursor: "pointer"
}

};

export default Create;