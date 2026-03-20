import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerificationResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // We grab the response data passed from the upload page's routing state
  const resultData = location.state;

  // Fallback if someone tries to navigate here directly without uploading
  if (!resultData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Document Data Found</h2>
        <p className="text-gray-600 mb-6">Please upload a degree to see verification results.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

  const {
    is_authentic,
    ocr_confidence_score,
    tamper_detection_score,
    student_name,
    institution_name,
    certificate_name,
    issue_date
  } = resultData;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header Banner - Changes color based on authenticity */}
        <div className={`p-6 text-center ${is_authentic ? 'bg-green-600' : 'bg-red-600'}`}>
          <h1 className="text-3xl font-extrabold text-white">
            {is_authentic ? "✅ VERIFIED AUTHENTIC" : "❌ VERIFICATION FAILED"}
          </h1>
          <p className="text-white mt-2 opacity-90">
            {is_authentic 
              ? "This document matches a valid cryptographic signature in our database." 
              : "Warning: This document shows signs of tampering or does not exist in our records."}
          </p>
        </div>

        {/* The Detective Kit Scores */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Detective Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">OCR Readability Score</p>
              <p className="text-2xl font-bold text-blue-600">{ocr_confidence_score}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Tamper Detection Risk</p>
              <p className={`text-2xl font-bold ${tamper_detection_score > 50 ? 'text-red-600' : 'text-green-600'}`}>
                {tamper_detection_score}%
              </p>
            </div>
          </div>
        </div>

        {/* Extracted Certificate Details */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Institution:</span>
              <span className="font-medium text-gray-900">{institution_name || "Unknown"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Student Name:</span>
              <span className="font-medium text-gray-900">{student_name || "Unknown"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Degree/Certificate:</span>
              <span className="font-medium text-gray-900">{certificate_name || "Unknown"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Date Issued:</span>
              <span className="font-medium text-gray-900">{issue_date || "Unknown"}</span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition shadow-md"
            >
              Scan Another Document
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerificationResult;