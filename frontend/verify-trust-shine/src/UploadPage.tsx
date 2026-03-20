import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from './lib/api';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      alert("Kindly Select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Throwing the file at your Python backend
      const response = await axios.post(`${API_BASE}/extract`, formData);
      const backendData = response.data;

      // Translating Python's answer for your Results page
      const translatedData = {
        is_authentic: backendData.status.includes("VERIFIED"),
        ocr_confidence_score: 99, 
        tamper_detection_score: backendData.status.includes("VERIFIED") ? 0 : 85,
        student_name: backendData.extractedData.name,
        institution_name: backendData.extractedData.institution,
        certificate_name: "B.Tech / Degree",
        issue_date: "Check Database"
      };

      // Teleporting to the Results page with the evidence!
      navigate('/result', { state: translatedData });
      
    } catch (error) {
      console.error("Upload failed", error);
      alert("The server crashed! Did you leave your Python backend running? 🐍");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">🕵️‍♂️ Fake Degree Detector</h2>
        
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          className="mb-6 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        <button 
          onClick={handleUpload}
          className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
        >
          Scan Document
        </button>
      </div>
    </div>
  );
};

export default UploadPage;