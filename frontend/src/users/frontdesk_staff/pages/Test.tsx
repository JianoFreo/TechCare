// import { useState } from 'react';

// function FileUploader() {
//   const [file, setFile] = useState(null);
//   const [uploadedPath, setUploadedPath] = useState('');

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]); // Capture the selected file object
//   };

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     if (!file) return alert("Please select a file first");

//     // Create FormData instance
//     const formData = new FormData();
    
//     // IMPORTANT: 'uploaded_file' must match upload.single('uploaded_file') on backend
//     formData.append('uploaded_file', file); 

//     try {
//       const response = await fetch('http://localhost:5000/api/upload', {
//         method: 'POST',
//         body: formData, // Send the FormData object directly
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setUploadedPath(`http://localhost:5000${data.filePath}`);
//       } else {
//         alert("Upload failed");
//       }
//     } catch (error) {
//       console.error("Error uploading file:", error);
//     }
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>Upload File to Express</h2>
//       <form onSubmit={handleUpload}>
//         <input type="file" onChange={handleFileChange} />
//         <button type="submit">Upload</button>
//       </form>

//       {uploadedPath && (
//         <div style={{ marginTop: '20px' }}>
//           <p>Uploaded Successfully!</p>
//           <img src={uploadedPath} alt="Uploaded file" style={{ maxWidth: '300px' }} />
//         </div>
//       )}
//     </div>
//   );
// }

// export default FileUploader;
