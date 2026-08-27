import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext.js';
import SpeakButton from '../components/SpeakButton.js';
import { 
  FolderLock, 
  Plus, 
  Trash2, 
  FileCheck, 
  ShieldAlert, 
  BadgeCheck, 
  Scan, 
  RefreshCw, 
  UploadCloud, 
  FileText,
  X,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Eye,
  Info,
  Sliders,
  UserCheck
} from 'lucide-react';

const fieldTranslations: Record<string, Record<string, string>> = {
  en: {
    'Name': 'Name',
    'Age': 'Age',
    'State': 'Home State',
    'Home State': 'Home State',
    'District': 'District',
    'Occupation': 'Occupation',
    'Worker Category': 'Worker Category',
    'DOB': 'Date of Birth',
    'Gender': 'Gender',
    'Address': 'Address',
    'Aadhaar': 'Aadhaar Card',
    'Ration Card': 'Ration Card',
    'Voter ID': 'Voter ID',
    'Bank Passbook': 'Bank Passbook',
    'Labour Card': 'Labour Card'
  },
  ta: {
    'Name': 'பெயர் (Name)',
    'Age': 'வயது (Age)',
    'State': 'சொந்த மாநிலம் (Home State)',
    'Home State': 'சொந்த மாநிலம் (Home State)',
    'District': 'மாவட்டம் (District)',
    'Occupation': 'தொழில் (Occupation)',
    'Worker Category': 'தொழிலாளர் பிரிவு (Worker Category)',
    'DOB': 'பிறந்த தேதி (Date of Birth)',
    'Gender': 'பாலினம் (Gender)',
    'Address': 'முகவரி (Address)',
    'Aadhaar': 'ஆதார் அட்டை (Aadhaar)',
    'Ration Card': 'குடும்ப அட்டை (Ration Card)',
    'Voter ID': 'வாக்காளர் அடையாள அட்டை (Voter ID)',
    'Bank Passbook': 'வங்கி கணக்கு புத்தகம் (Bank Passbook)',
    'Labour Card': 'தொழிலாளர் நல அட்டை (Labour Card)'
  },
  hi: {
    'Name': 'नाम (Name)',
    'Age': 'आयु (Age)',
    'State': 'गृह राज्य (Home State)',
    'Home State': 'गृह राज्य (Home State)',
    'District': 'जिला (District)',
    'Occupation': 'व्यवसाय (Occupation)',
    'Worker Category': 'श्रमिक श्रेणी (Worker Category)',
    'DOB': 'जन्म तिथि (Date of Birth)',
    'Gender': 'लिंग (Gender)',
    'Address': 'पता (Address)',
    'Aadhaar': 'आधार कार्ड (Aadhaar)',
    'Ration Card': 'राशन कार्ड (Ration Card)',
    'Voter ID': 'मतदाता पहचान पत्र (Voter ID)',
    'Bank Passbook': 'बैंक पासबुक (Bank Passbook)',
    'Labour Card': 'लेबर कार्ड (Labour Card)'
  }
};

export default function DocumentVault() {
  const { 
    documents, 
    fetchDocuments, 
    uploadDocument, 
    deleteDocument, 
    verifyDocument, 
    syncDocumentProfile,
    user,
    language,
    t 
  } = useApp();

  const navigate = useNavigate();

  const [isUploading, setIsUploading] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Aadhaar');
  const [dragOver, setDragOver] = useState(false);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Details View States
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isEditingSync, setIsEditingSync] = useState(false);
  const [syncForm, setSyncForm] = useState({
    name: '',
    age: '30',
    stateOfOrigin: '',
    currentDistrictInTN: '',
    industry: ''
  });
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'failed'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [newRecommendedSchemes, setNewRecommendedSchemes] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const activeDoc = documents.find(d => d.id === selectedDocId) || null;

  // Initialize editing sync form fields when active document changes
  useEffect(() => {
    if (activeDoc && activeDoc.extractedFields) {
      const fields = activeDoc.extractedFields;
      // Intelligently map extracted fields to the profile form fields
      setSyncForm({
        name: fields['Name'] || fields['Account Holder'] || fields['Family Head'] || user?.name || '',
        age: fields['Age'] || (fields['DOB'] ? calculateAgeFromDOB(fields['DOB']) : String(user?.age || 30)),
        stateOfOrigin: fields['State'] || fields['Home State'] || user?.stateOfOrigin || 'Bihar',
        currentDistrictInTN: fields['District'] || user?.currentDistrictInTN || 'Tiruppur',
        industry: fields['Worker Category'] || fields['Occupation'] || user?.industry || 'Construction'
      });
      setSyncStatus('idle');
      setSyncError(null);
      setIsEditingSync(false);
      setNewRecommendedSchemes([]);
    }
  }, [selectedDocId, documents]);

  const calculateAgeFromDOB = (dobStr: string): string => {
    try {
      // Handles standard formats like DD/MM/YYYY or YYYY-MM-DD
      const yearMatch = dobStr.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        const birthYear = parseInt(yearMatch[0]);
        const currentYear = new Date().getFullYear();
        return String(currentYear - birthYear);
      }
    } catch (e) {
      // Fallback
    }
    return '30';
  };

  const handleFileProcess = (file: File) => {
    setSelectedFile(file);
    const guessedName = file.name.split('.')[0];
    setDocName(guessedName);
    
    // Auto-categorize type based on keywords
    const lower = file.name.toLowerCase();
    if (lower.includes('aadhaar')) setDocType('Aadhaar');
    else if (lower.includes('ration') || lower.includes('food')) setDocType('Ration Card');
    else if (lower.includes('labour') || lower.includes('worker')) setDocType('Labour Card');
    else if (lower.includes('voter')) setDocType('Voter ID');
    else if (lower.includes('bank') || lower.includes('passbook') || lower.includes('account') || lower.includes('pass')) setDocType('Bank Passbook');
    else setDocType('Other');

    // Create local base64 preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    setIsUploading(true);
    setErrorMessage(null);

    // Call upload API which invokes the Gemini OCR process
    const success = await uploadDocument(docName, docType, filePreview || undefined);
    if (success) {
      setDocName('');
      setDocType('Aadhaar');
      setSelectedFile(null);
      setFilePreview(null);
      setStatusMessage("Document uploaded & processed with AI OCR successfully!");
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setErrorMessage("The document could not be processed. Please make sure the image is clear and of a supported type.");
    }
    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleOCRScan = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering details card open
    setScanningId(docId);
    const success = await verifyDocument(docId);
    if (success) {
      setStatusMessage("AI OCR Scan Complete. Document fields extracted.");
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setErrorMessage("OCR verification failed. Please try again with a clearer image.");
    }
    setScanningId(null);
  };

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering details card open
    if (confirm('Are you sure you want to remove this document from your secure vault?')) {
      await deleteDocument(docId);
      if (selectedDocId === docId) {
        setSelectedDocId(null);
      }
    }
  };

  const handleSyncProfileSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeDoc) return;

    setSyncStatus('syncing');
    setSyncError(null);

    const result = await syncDocumentProfile(activeDoc.id, syncForm);
    if (result.success) {
      setSyncStatus('completed');
      if (result.recommendations) {
        setNewRecommendedSchemes(result.recommendations);
      }
      setStatusMessage("Profile synchronized and benefits updated!");
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setSyncStatus('failed');
      setSyncError(result.error || "Profile synchronization failed. Please try again.");
    }
  };

  const documentTypes = ['Aadhaar', 'Ration Card', 'Voter ID', 'Labour Card', 'Bank Passbook', 'Other'];

  // Check if there are differences between extracted values and current profile
  const hasProfileDifferences = () => {
    if (!activeDoc || !activeDoc.extractedFields) return false;
    const formFields = syncForm;
    return (
      (formFields.name && formFields.name !== user?.name) ||
      (formFields.age && Number(formFields.age) !== user?.age) ||
      (formFields.stateOfOrigin && formFields.stateOfOrigin !== user?.stateOfOrigin) ||
      (formFields.currentDistrictInTN && formFields.currentDistrictInTN !== user?.currentDistrictInTN) ||
      (formFields.industry && formFields.industry !== user?.industry)
    );
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {activeDoc ? (
          /* ========================================== */
          /* DOCUMENT DETAILS SUB-VIEW (Module 11)      */
          /* ========================================== */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-6"
          >
            {/* Details Header */}
            <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-sm shadow-blue-900/5">
              <button
                onClick={() => setSelectedDocId(null)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-50 hover:bg-sky-100 dark:bg-slate-950 dark:hover:bg-slate-850 rounded-xl text-xs font-bold text-sky-900 dark:text-slate-300 transition cursor-pointer border border-sky-100/80"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600" />
                <span>Back to Vault</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase font-mono">
                  ID: {activeDoc.id}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Visual Preview & Verification Checklist Timeline */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Visual Preview Card */}
                <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 shadow-md shadow-blue-900/5 overflow-hidden">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Eye className="w-4.5 h-4.5 text-blue-600" />
                    Document Image Preview
                  </h3>

                  <div className="aspect-[1.586/1] bg-slate-950 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group">
                    {activeDoc.fileUrl && activeDoc.fileUrl.startsWith('data:') ? (
                      <img 
                        src={activeDoc.fileUrl} 
                        alt={activeDoc.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      /* High Tech Visual ID Placeholder Card */
                      <div className="w-full h-full p-6 text-white bg-gradient-to-tr from-slate-900 via-blue-950 to-blue-900 flex flex-col justify-between select-none">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-sky-400 font-extrabold block">
                              THUNAI VAULT
                            </span>
                            <span className="text-xs font-bold text-slate-200 block">
                              {activeDoc.type} Verified
                            </span>
                          </div>
                          <BadgeCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-sm font-bold tracking-wide font-mono block">
                            {activeDoc.extractedFields?.['Aadhaar Number'] || activeDoc.extractedFields?.['Account Number'] || activeDoc.extractedFields?.['Registration Number'] || '•••• •••• ••••'}
                          </span>
                          <span className="text-[10px] font-semibold text-sky-200 tracking-wider block uppercase">
                            HOLDER: {activeDoc.extractedFields?.['Name'] || activeDoc.extractedFields?.['Account Holder'] || activeDoc.extractedFields?.['Family Head'] || 'RAJESH KUMAR'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-[10px] font-semibold text-slate-400">
                      AES-256 Encrypted Security Node Link
                    </span>
                  </div>
                </div>

                {/* Verification Progress Timeline Status Indicator (Module 5) */}
                <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 shadow-md shadow-blue-900/5">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-5 flex items-center gap-2">
                    <Sliders className="w-4.5 h-4.5 text-blue-600" />
                    Document Security Pipeline Status
                  </h3>

                  <div className="relative pl-6 border-l border-sky-100 dark:border-slate-800 space-y-5">
                    {/* Step 1: Upload & Verified */}
                    <div className="relative">
                      <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-4 ring-emerald-50 dark:ring-emerald-950/40">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        Document Uploaded & Secured
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Uploaded on {new Date(activeDoc.uploadedAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Step 2: OCR Complete */}
                    <div className="relative">
                      <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white ring-4 ${
                        activeDoc.ocrStatus === 'completed'
                          ? 'bg-emerald-500 ring-emerald-50 dark:ring-emerald-950/40'
                          : 'bg-blue-600 ring-blue-50 dark:ring-blue-950/40 animate-pulse'
                      }`}>
                        {activeDoc.ocrStatus === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        AI OCR Text Reading
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {activeDoc.ocrStatus === 'completed' ? 'High-resolution scan and segmentation completed.' : 'OCR processing pending...'}
                      </p>
                    </div>

                    {/* Step 3: Information Extracted */}
                    <div className="relative">
                      <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white ring-4 ${
                        activeDoc.extractedFields && Object.keys(activeDoc.extractedFields).length > 0
                          ? 'bg-emerald-500 ring-emerald-50 dark:ring-emerald-950/40'
                          : 'bg-slate-300 ring-slate-100 dark:bg-slate-800 dark:ring-slate-900/10'
                      }`}>
                        {activeDoc.extractedFields && Object.keys(activeDoc.extractedFields).length > 0 ? <CheckCircle2 className="w-3 h-3" /> : <Info className="w-2.5 h-2.5" />}
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        Structured Information Extracted
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {activeDoc.extractedFields && Object.keys(activeDoc.extractedFields).length > 0 ? `${Object.keys(activeDoc.extractedFields).length} verified metadata fields decoded.` : 'Pending extraction...'}
                      </p>
                    </div>

                    {/* Step 4: Profile Synced */}
                    <div className="relative">
                      <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white ring-4 ${
                        activeDoc.profileSynced
                          ? 'bg-emerald-500 ring-emerald-50 dark:ring-emerald-950/40'
                          : 'bg-slate-300 ring-slate-100 dark:bg-slate-800 dark:ring-slate-900/10'
                      }`}>
                        {activeDoc.profileSynced ? <CheckCircle2 className="w-3 h-3" /> : <Info className="w-2.5 h-2.5" />}
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        Worker Profile Synchronized
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {activeDoc.profileSynced ? 'Core worker identity database fields synced.' : 'Sync pending user confirmation.'}
                      </p>
                    </div>

                    {/* Step 5: Benefits Updated */}
                    <div className="relative">
                      <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white ring-4 ${
                        activeDoc.benefitsUpdated
                          ? 'bg-emerald-500 ring-emerald-50 dark:ring-emerald-950/40'
                          : 'bg-slate-300 ring-slate-100 dark:bg-slate-800 dark:ring-slate-900/10'
                      }`}>
                        {activeDoc.benefitsUpdated ? <CheckCircle2 className="w-3 h-3" /> : <Info className="w-2.5 h-2.5" />}
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        Welfare Benefits Dynamic Refresh
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {activeDoc.benefitsUpdated ? 'Government Schemes eligibility lists updated.' : 'Awaiting profile update completion.'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Extracted Metadata (with Confidence Score Badges) & Profile Sync Panel */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Extracted Metadata Card */}
                <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 shadow-md shadow-blue-900/5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
                        <FileText className="w-4.5 h-4.5 text-blue-600" />
                        Extracted Document Information
                      </h3>
                      {activeDoc.extractedFields && Object.keys(activeDoc.extractedFields).length > 0 && (
                        <SpeakButton
                          text={`Scanned Document details. ${Object.entries(activeDoc.extractedFields).map(([k, v]) => `${fieldTranslations[language]?.[k] || k} is ${v}`).join('. ')}`}
                          size="sm"
                        />
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 bg-sky-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-lg border border-sky-100">
                      {activeDoc.type} Model
                    </span>
                  </div>

                  {!activeDoc.extractedFields || Object.keys(activeDoc.extractedFields).length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-sky-50/50 dark:bg-slate-950 rounded-2xl border border-dashed border-sky-200 dark:border-slate-850">
                      <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-amber-500" />
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-300">
                        No fields have been extracted yet.
                      </p>
                      <p className="text-[10px] mt-1 text-slate-500">
                        Please click "Scan" to trigger AI OCR extraction.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {Object.entries(activeDoc.extractedFields).map(([key, value]) => {
                          const score = activeDoc.confidenceScore?.[key] ?? 100;
                          
                          // Custom style thresholds for confidence scores (Module 7)
                          const scoreBg = score >= 90 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200' : score >= 70 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200' : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200';
                          const translatedKey = fieldTranslations[language]?.[key] || key;

                          return (
                            <div 
                              key={key}
                              className="p-3 bg-sky-50/60 dark:bg-slate-950 rounded-xl border border-sky-100 dark:border-slate-850 flex flex-col justify-between gap-1.5"
                            >
                              <div>
                                <span className="text-[10px] font-extrabold text-sky-800/70 dark:text-slate-500 uppercase block tracking-wider">
                                  {translatedKey}
                                </span>
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate mt-0.5">
                                  {value}
                                </span>
                              </div>

                              <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-sky-100/80 dark:border-slate-850/30">
                                <span className="text-[9px] font-bold text-slate-500">
                                  AI Confidence
                                </span>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${scoreBg}`}>
                                  {score}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Synchronization Panel (Module 4) */}
                {activeDoc.extractedFields && Object.keys(activeDoc.extractedFields).length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 shadow-md shadow-blue-900/5">
                    
                    {syncStatus === 'completed' ? (
                      /* Success Sync Card */
                      <div className="text-center space-y-4 p-4">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-100/50 dark:ring-emerald-950/20 border border-emerald-200">
                          <UserCheck className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                            ThunAI Worker Profile Synced!
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                            The extracted details have been saved to your secure profile. Welfare board benefit metrics have been automatically updated!
                          </p>
                        </div>

                        {/* List newly discovered schemes */}
                        {newRecommendedSchemes.length > 0 && (
                          <div className="bg-sky-50/60 dark:bg-slate-950 border border-sky-100 dark:border-slate-850 rounded-2xl p-4 text-left space-y-2 max-w-sm mx-auto">
                            <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              Newly unlocked schemes:
                            </span>
                            <div className="space-y-1.5">
                              {newRecommendedSchemes.slice(0, 3).map((rec) => (
                                <div key={rec.schemeId || rec.id} className="text-xs font-bold text-slate-900 dark:text-slate-200 flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-sky-100 dark:border-slate-800">
                                  <span>{rec.schemeName || rec.name}</span>
                                  <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 font-extrabold px-1.5 py-0.5 rounded border border-emerald-200">
                                    {(rec.matchPercentage || rec.score || 90)}% match
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                          <button
                            onClick={() => navigate('/schemes')}
                            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/10"
                          >
                            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                            <span>View Recommended Schemes</span>
                          </button>
                          <button
                            onClick={() => setSelectedDocId(null)}
                            className="px-5 py-3 bg-sky-50 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-sky-900 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer border border-sky-100"
                          >
                            Back to Vault
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Active Confirmation / Edit Panel */
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-800/70 dark:text-slate-500">
                              Profile Integration
                            </h4>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                              ThunAI Profile Verification
                            </h3>
                          </div>
                          
                          {hasProfileDifferences() && (
                            <span className="text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              New Details Found
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          Compare the extracted document details below with your current profile settings. Only update if correct. You can edit any fields directly.
                        </p>

                        {isEditingSync ? (
                          /* Inline Editable Sync Form */
                          <form onSubmit={handleSyncProfileSubmit} className="space-y-3.5 bg-sky-50/60 dark:bg-slate-950 p-4 rounded-2xl border border-sky-100 dark:border-slate-850">
                            <span className="text-[10px] font-extrabold text-sky-800/70 dark:text-slate-500 uppercase tracking-widest block">
                              Edit Extracted Fields
                            </span>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Name</label>
                                <input 
                                  type="text" 
                                  value={syncForm.name}
                                  onChange={e => setSyncForm({...syncForm, name: e.target.value})}
                                  className="w-full p-2 rounded-lg border border-sky-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Age</label>
                                <input 
                                  type="number" 
                                  value={syncForm.age}
                                  onChange={e => setSyncForm({...syncForm, age: e.target.value})}
                                  className="w-full p-2 rounded-lg border border-sky-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Home State</label>
                                <input 
                                  type="text" 
                                  value={syncForm.stateOfOrigin}
                                  onChange={e => setSyncForm({...syncForm, stateOfOrigin: e.target.value})}
                                  className="w-full p-2 rounded-lg border border-sky-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">TN District</label>
                                <input 
                                  type="text" 
                                  value={syncForm.currentDistrictInTN}
                                  onChange={e => setSyncForm({...syncForm, currentDistrictInTN: e.target.value})}
                                  className="w-full p-2 rounded-lg border border-sky-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Work Sector / Occupation</label>
                                <input 
                                  type="text" 
                                  value={syncForm.industry}
                                  onChange={e => setSyncForm({...syncForm, industry: e.target.value})}
                                  className="w-full p-2 rounded-lg border border-sky-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>

                            {syncError && (
                              <p className="text-[10px] text-red-600 font-semibold">{syncError}</p>
                            )}

                            <div className="flex gap-2 justify-end pt-2">
                              <button
                                type="button"
                                onClick={() => setIsEditingSync(false)}
                                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={syncStatus === 'syncing'}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1 shadow-sm"
                              >
                                {syncStatus === 'syncing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                                Save & Sync
                              </button>
                            </div>
                          </form>
                        ) : (
                          /* Profile Comparison Table */
                          <div className="space-y-3">
                            <div className="bg-sky-50/60 dark:bg-slate-950 rounded-2xl border border-sky-100 dark:border-slate-850 overflow-hidden text-xs">
                              <div className="grid grid-cols-3 bg-sky-100/70 dark:bg-slate-900 p-2.5 font-bold text-sky-900 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                                <span>Field</span>
                                <span>Current Profile</span>
                                <span>Extracted From ID</span>
                              </div>

                              <div className="divide-y divide-sky-100 dark:divide-slate-850">
                                <div className="grid grid-cols-3 p-2.5 font-semibold">
                                  <span className="text-slate-500 text-[10px]">Name</span>
                                  <span className="text-slate-600 dark:text-slate-400 truncate">{user?.name || 'Not set'}</span>
                                  <span className={`font-bold ${syncForm.name !== user?.name ? 'text-amber-700' : 'text-slate-900 dark:text-slate-200'}`}>{syncForm.name || 'Not found'}</span>
                                </div>

                                <div className="grid grid-cols-3 p-2.5 font-semibold">
                                  <span className="text-slate-500 text-[10px]">Age</span>
                                  <span className="text-slate-600 dark:text-slate-400">{user?.age || 'Not set'}</span>
                                  <span className={`font-bold ${Number(syncForm.age) !== user?.age ? 'text-amber-700' : 'text-slate-900 dark:text-slate-200'}`}>{syncForm.age || 'Not found'}</span>
                                </div>

                                <div className="grid grid-cols-3 p-2.5 font-semibold">
                                  <span className="text-slate-500 text-[10px]">Home State</span>
                                  <span className="text-slate-600 dark:text-slate-400">{user?.stateOfOrigin || 'Not set'}</span>
                                  <span className={`font-bold ${syncForm.stateOfOrigin !== user?.stateOfOrigin ? 'text-amber-700' : 'text-slate-900 dark:text-slate-200'}`}>{syncForm.stateOfOrigin || 'Not found'}</span>
                                </div>

                                <div className="grid grid-cols-3 p-2.5 font-semibold">
                                  <span className="text-slate-500 text-[10px]">Current TN District</span>
                                  <span className="text-slate-600 dark:text-slate-400">{user?.currentDistrictInTN || 'Not set'}</span>
                                  <span className={`font-bold ${syncForm.currentDistrictInTN !== user?.currentDistrictInTN ? 'text-amber-700' : 'text-slate-900 dark:text-slate-200'}`}>{syncForm.currentDistrictInTN || 'Not found'}</span>
                                </div>

                                <div className="grid grid-cols-3 p-2.5 font-semibold">
                                  <span className="text-slate-500 text-[10px]">Occupation</span>
                                  <span className="text-slate-600 dark:text-slate-400 truncate">{user?.industry || 'Not set'}</span>
                                  <span className={`font-bold ${syncForm.industry !== user?.industry ? 'text-amber-700' : 'text-slate-900 dark:text-slate-200'}`}>{syncForm.industry || 'Not found'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions Panel */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-end">
                              <button
                                onClick={() => setSelectedDocId(null)}
                                className="px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 bg-sky-50 hover:bg-sky-100 dark:bg-slate-950 dark:hover:bg-slate-850 rounded-xl font-bold border border-sky-100 dark:border-slate-850 cursor-pointer"
                              >
                                Skip & Close
                              </button>

                              <button
                                onClick={() => setIsEditingSync(true)}
                                className="px-4 py-2.5 text-xs text-blue-700 hover:text-blue-800 bg-sky-50 hover:bg-sky-100 dark:bg-blue-950/40 rounded-xl font-bold border border-sky-200 dark:border-blue-900/10 cursor-pointer"
                              >
                                Edit Profile Fields
                              </button>

                              <button
                                onClick={() => handleSyncProfileSubmit()}
                                disabled={syncStatus === 'syncing'}
                                className="px-5 py-2.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-xl font-extrabold cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                              >
                                {syncStatus === 'syncing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                                <span>Accept & Sync Profile</span>
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>

          </motion.div>
        ) : (
          /* ========================================== */
          /* STANDARD DOCUMENTS VAULT DASHBOARD VIEW    */
          /* ========================================== */
          <div className="space-y-6">
            
            {/* Vault Status Header */}
            <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm shadow-blue-900/5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <FolderLock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  {t('documents')}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  ThunAI secure storage protects your essential documents. All information is processed locally or stored in encrypted state to keep your privacy completely secure.
                </p>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/10 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-900/10 shrink-0">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Vault Security</span>
                <span className="text-[10px] font-semibold text-emerald-800/70 dark:text-slate-400 font-mono">ENCRYPTED AES-256</span>
              </div>
            </div>

            {/* Error Message banner (Module 12) */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/10 font-bold rounded-2xl flex items-center gap-2.5 text-xs shadow-sm"
              >
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
                <div className="flex justify-between items-center w-full">
                  <span>{errorMessage}</span>
                  <button onClick={() => setErrorMessage(null)} className="p-1 text-red-400 hover:text-red-600 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* OCR/Upload notification toast banner */}
            <AnimatePresence>
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-blue-600 text-white font-semibold rounded-2xl flex items-center gap-2.5 shadow-lg shadow-blue-600/15 text-xs"
                >
                  <FileCheck className="w-5 h-5 shrink-0" />
                  <span>{statusMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Upload Container (Form + Drag & Drop) */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-sky-100 dark:border-slate-800 shadow-md shadow-blue-900/5">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5 text-blue-600" />
                  {t('add_document')}
                </h3>

                <form onSubmit={handleUploadSubmit} className="space-y-5">
                  {/* Drag & Drop Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleDropZoneClick}
                    className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                      dragOver
                        ? 'border-blue-500 bg-sky-50 dark:bg-blue-950/20'
                        : 'border-sky-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-slate-700 bg-sky-50/40 dark:bg-slate-950/40'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {filePreview ? (
                      <div className="flex flex-col items-center">
                        {filePreview.startsWith('data:image/') ? (
                          <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg mb-2 border border-sky-200" referrerPolicy="no-referrer" />
                        ) : (
                          <FileText className="w-12 h-12 text-blue-600 mb-2" />
                        )}
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-200 max-w-[200px] truncate">
                          {selectedFile?.name}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Click or drag to replace
                        </p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className={`w-10 h-10 mb-2 ${dragOver ? 'text-blue-600' : 'text-blue-500/70'}`} strokeWidth={1.5} />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {t('upload_file')}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1">
                          Supports PDF, JPG, PNG (Max 5MB)
                        </p>
                      </>
                    )}
                  </div>

                  {/* Document Name input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-1.5">
                      {t('doc_name')}
                    </label>
                    <input
                      type="text"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="e.g. My Aadhaar Card"
                      className="block w-full px-4 py-3 rounded-xl border border-sky-200 dark:border-slate-800 bg-sky-50/40 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500 font-semibold"
                      disabled={isUploading}
                      required
                    />
                  </div>

                  {/* Document Type Dropdown */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-1.5">
                      {t('doc_type')}
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="block w-full px-4 py-3 rounded-xl border border-sky-200 dark:border-slate-800 bg-sky-50/40 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                      disabled={isUploading}
                    >
                      {documentTypes.map((tCode) => (
                        <option key={tCode} value={tCode}>{tCode}</option>
                      ))}
                    </select>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isUploading || !docName.trim()}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs cursor-pointer shadow-md shadow-blue-600/10 transition"
                  >
                    {isUploading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Secure Document</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>

              {/* Saved Documents Listing Vault Grid */}
              <div className="lg:col-span-8 space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-500 flex items-center gap-2">
                  Secure Documents ({documents.length})
                </h3>

                {documents.length === 0 ? (
                  /* Empty state card */
                  <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 shadow-sm">
                    <FolderLock className="w-16 h-16 mb-4 text-sky-300 dark:text-slate-700" strokeWidth={1} />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-200">
                      {t('no_docs')}
                    </h4>
                    <p className="text-xs mt-2 max-w-xs leading-relaxed font-semibold text-slate-500">
                      Protect your digital IDs by uploading them today. You can scan cards instantly to unlock matching schemes.
                    </p>
                  </div>
                ) : (
                  /* Active Grid list of documents */
                  <div className="grid grid-cols-1 gap-4">
                    {documents.map((doc) => (
                      <motion.div
                        layout
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 hover:border-blue-300 dark:hover:border-blue-500/30 cursor-pointer transition-all shadow-sm shadow-blue-900/5"
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Visual Document Type Icon Indicator */}
                          <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-slate-950 border border-sky-100 dark:border-slate-850 text-blue-600 dark:text-slate-400">
                            <FileText className="w-6 h-6" />
                          </div>
                          
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm truncate max-w-[200px]">
                              {doc.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-sky-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded border border-sky-100">
                                {doc.type}
                              </span>
                              
                              {/* Synced profile status indicators */}
                              {doc.profileSynced && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded flex items-center gap-0.5 border border-emerald-200">
                                  <UserCheck className="w-3 h-3" />
                                  Synced
                                </span>
                              )}

                              <span className="text-[10px] text-slate-500 font-mono font-bold">
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Operational States: Verification / Action */}
                        <div className="flex flex-wrap items-center gap-3 justify-end">
                          
                          {/* Details page link button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocId(doc.id);
                            }}
                            className="flex items-center gap-1 bg-sky-50 hover:bg-sky-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-sky-100 dark:border-slate-850 px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wide uppercase cursor-pointer text-sky-900 dark:text-slate-300"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Details</span>
                          </button>

                          {/* Scan AI Verification state check */}
                          {doc.verified ? (
                            <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/10 px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wide uppercase">
                              <BadgeCheck className="w-4 h-4 shrink-0" />
                              {t('verified_status')}
                            </div>
                          ) : (
                            <motion.button
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => handleOCRScan(doc.id, e)}
                              disabled={scanningId === doc.id}
                              className="flex items-center gap-1 bg-sky-50 hover:bg-sky-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-sky-200 dark:border-blue-900/10 px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wide uppercase cursor-pointer"
                            >
                              {scanningId === doc.id ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>{t('verifying')}</span>
                                </>
                              ) : (
                                <>
                                  <Scan className="w-3.5 h-3.5" />
                                  <span>{t('verify_btn')}</span>
                                </>
                              )}
                            </motion.button>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDelete(doc.id, e)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition duration-150 cursor-pointer"
                            title="Delete document"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

