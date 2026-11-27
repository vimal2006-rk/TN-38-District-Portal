import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  UserPlus,
  CheckCircle2,
  Upload,
  QrCode,
  FileText,
  Download,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { TN_DISTRICTS } from '../../utils/districtsData';
import { getCachedData, setCachedData, clearCachedData } from '../../utils/clientCache';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import api from '../../services/api';
import { removeSignatureBackground } from '../../utils/signatureProcessor';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STEPPER_STEPS = [
  { step: 1, label: '1. Applicant Details' },
  { step: 2, label: '2. Photo & Signature' },
  { step: 3, label: '3. Scan & Pay + PDF' },
];
const REGISTRATION_DATE_DISPLAY = new Date().toLocaleDateString('en-IN');
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const isValidAadhaarClient = (num) => {
  const digits = String(num).replace(/\D/g, '');
  if (!/^\d{12}$/.test(digits) || /^(\d)\1{11}$/.test(digits)) return false;
  const d = [
    [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],
    [5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0],
  ];
  const p = [
    [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],
    [9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
  ];
  let c = 0;
  const rev = digits.split('').reverse().map(Number);
  for (let i = 0; i < rev.length; i++) c = d[c][p[i % 8][rev[i]]];
  return c === 0;
};

const INITIAL_FORM = {
  districtId: '13',
  applicantName: '',
  fatherName: '',
  dob: '',
  bloodGroup: 'O+',
  educationalQualification: '',
  aadhaarNumber: '',
  experience: '',
  shopName: '',
  shopAddress: '',
  phone: '',
  referName: '',
  email: '',
  socialId: '',
  alternateMobile: '',
  areaRtoNo: '',
  planType: 'ANNUAL',
  upiTransactionId: '',
  termsAccepted: false,
};

export default function MembershipPage() {
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const initialConfig = useMemo(() => {
    const cached = getCachedData('membership_config');
    return {
      associationNameEn: 'TAMILNADU MOBILE SALES AND SERVICE ASSOCIATION',
      associationNameTa: 'தமிழ்நாடு மொபைல் சேல்ஸ் மற்றும் சர்வீஸ் அசோசியேசன்',
      regNumber: 'Regd : 23/2025',
      address: '234 Meenakshi Bazar, Scott Road, Madurai - 625001',
      helpline1: '+91 99447 73668',
      helpline2: '+91 97879 75782',
      annualFee: 1200,
      halfYearlyFee: 600,
      qrCodeUrl: '/tmssa-qr.webp',
      nextSerialPreview: `TNMSSA-${new Date().getFullYear()}-0001`,
      ...cached,
    };
  }, []);

  const [config, setConfig] = useState(initialConfig);

  const [form, setForm] = useState(INITIAL_FORM);
  const [showAadhaar, setShowAadhaar] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [sigFile, setSigFile] = useState(null);
  const [sigPreview, setSigPreview] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errors, setErrors] = useState({});

  const previewUrlsRef = useRef({ photo: '', signature: '', screenshot: '' });

  const revokePreviewUrl = useCallback((key) => {
    const current = previewUrlsRef.current[key];
    if (current) {
      URL.revokeObjectURL(current);
      previewUrlsRef.current[key] = '';
    }
  }, []);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(previewUrlsRef.current.photo);
      URL.revokeObjectURL(previewUrlsRef.current.signature);
      URL.revokeObjectURL(previewUrlsRef.current.screenshot);
    };
  }, []);

  const fetchMembershipConfig = useCallback((isActive = () => true) => {
    api
      .get('/membership/config', { skipDedupe: true })
      .then((res) => {
        if (!isActive()) return;
        if (res.data?.data) {
          setConfig((prev) => ({ ...prev, ...res.data.data }));
          setCachedData('membership_config', res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    fetchMembershipConfig(() => active);
    return () => {
      active = false;
    };
  }, [fetchMembershipConfig]);

  useAutoRefresh('membership_config', fetchMembershipConfig);

  const calculatedAge = useMemo(() => {
    if (!form.dob) return '';
    const d = new Date(form.dob);
    if (Number.isNaN(d.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age >= 0 ? String(age) : '';
  }, [form.dob]);

  const activeStep = useMemo(() => {
    if (submittedData) return 3;
    if (photoFile) return 3;
    if (form.applicantName && form.phone && form.shopName) return 2;
    return 1;
  }, [submittedData, photoFile, form.applicantName, form.phone, form.shopName]);

  const handleImageSelect = useCallback(async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB.');
      return;
    }
    if (type === 'photo') {
      revokePreviewUrl('photo');
      const url = URL.createObjectURL(file);
      previewUrlsRef.current.photo = url;
      setPhotoFile(file);
      setPhotoPreview(url);
      setErrors((prev) => ({ ...prev, photo: undefined }));
    } else if (type === 'signature') {
      revokePreviewUrl('signature');
      try {
        const { file: cleanSigFile, previewUrl } = await removeSignatureBackground(file);
        previewUrlsRef.current.signature = previewUrl;
        setSigFile(cleanSigFile);
        setSigPreview(previewUrl);
        toast.success('Signature background removed automatically!');
      } catch {
        const url = URL.createObjectURL(file);
        previewUrlsRef.current.signature = url;
        setSigFile(file);
        setSigPreview(url);
      }
    } else if (type === 'screenshot') {
      revokePreviewUrl('screenshot');
      const url = URL.createObjectURL(file);
      previewUrlsRef.current.screenshot = url;
      setScreenshotFile(file);
      setScreenshotPreview(url);
    }
  }, [revokePreviewUrl]);

  const validateForm = useCallback(() => {
    const e = {};
    if (!form.applicantName.trim()) e.applicantName = 'Applicant Name is required';
    if (!form.fatherName.trim()) e.fatherName = "Father's Name is required";
    if (!form.dob) e.dob = 'Date of Birth is required';
    else if (Number(calculatedAge) < 18) e.dob = 'Applicant must be at least 18 years old';
    if (!form.educationalQualification.trim()) e.educationalQualification = 'Qualification is required';

    const aadhaarDigits = form.aadhaarNumber.replace(/\D/g, '');
    if (aadhaarDigits && !isValidAadhaarClient(aadhaarDigits)) {
      e.aadhaarNumber = 'Enter a valid 12-digit Aadhaar number';
    }

    if (!form.experience.trim()) e.experience = 'Experience is required';
    if (!form.shopName.trim()) e.shopName = 'Shop Name is required';
    if (!form.shopAddress.trim()) e.shopAddress = 'Shop Address is required';

    const cleanPhone = form.phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone) || /^(\d)\1{9}$/.test(cleanPhone)) {
      e.phone = 'Enter a valid 10-digit Indian mobile number';
    }

    if (form.alternateMobile.trim()) {
      const cleanAlt = form.alternateMobile.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanAlt) || /^(\d)\1{9}$/.test(cleanAlt)) {
        e.alternateMobile = 'Alternate mobile must be a valid 10-digit number';
      } else if (cleanAlt === cleanPhone) {
        e.alternateMobile = 'Alternate mobile must differ from primary mobile';
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Enter a valid email address';
    }
    if (!form.areaRtoNo.trim()) e.areaRtoNo = 'Area RTO No is required';
    if (!photoFile) e.photo = 'Applicant Photograph (JPG/PNG) is required';
    if (form.upiTransactionId.trim().length < 6) {
      e.upiTransactionId = 'Enter valid UPI Transaction ID / UTR Number (min 6 chars)';
    }
    if (!form.termsAccepted) e.termsAccepted = 'You must accept the terms and conditions';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, calculatedAge, photoFile]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error(isTa ? 'தயவுசெய்து சிவப்பு நிறப் புலங்களைச் சரிபார்க்கவும்' : 'Please fix the highlighted errors before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, String(v));
      });
      fd.append('photo', photoFile);
      if (sigFile) fd.append('signature', sigFile);
      if (screenshotFile) fd.append('paymentScreenshot', screenshotFile);

      const res = await api.post('/membership/register', fd);
      clearCachedData('membership_config');
      setSubmittedData(res.data?.data);
      toast.success(isTa ? 'விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!' : 'Membership application submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please verify your details and try again.');
    } finally {
      setSubmitting(false);
    }
  }, [validateForm, isTa, form, photoFile, sigFile, screenshotFile]);

  const handleResetForm = useCallback(() => {
    revokePreviewUrl('photo');
    revokePreviewUrl('signature');
    revokePreviewUrl('screenshot');
    setSubmittedData(null);
    setForm(INITIAL_FORM);
    setPhotoFile(null);
    setPhotoPreview('');
    setSigFile(null);
    setSigPreview('');
    setScreenshotFile(null);
    setScreenshotPreview('');
  }, [revokePreviewUrl]);

  const selectedAmount = form.planType === 'HALF_YEARLY' ? config.halfYearlyFee : config.annualFee;
  const apiBase = API_BASE;

  return (
    <div className="min-h-screen py-8 sm:py-12" style={{ backgroundColor: '#F4F7FC' }}>
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Official Association Header Banner */}
        <div
          className="bg-white rounded-3xl shadow-sm border-2 overflow-hidden"
          style={{ borderColor: '#09246B' }}
        >
          <div className="p-5 sm:p-7 flex flex-col sm:flex-row items-center gap-4 border-b border-blue-100 bg-gradient-to-r from-[#EEF2FF] via-white to-[#EEF2FF]">
            <img
              src="/logo.webp"
              alt="TNMSSA Logo"
              width={80}
              height={80}
              decoding="async"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#09246B] shadow-sm flex-shrink-0"
            />
            <div className="text-center sm:text-left flex-1">
              <p className="text-xs sm:text-sm font-bold text-[#09246B]">{config.associationNameTa}</p>
              <h1 className="text-lg sm:text-2xl font-extrabold text-red-700 leading-tight mt-0.5">
                {config.associationNameEn}
              </h1>
              <p className="text-xs text-gray-700 font-medium mt-1">{config.address}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5 text-xs font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-[#09246B] text-white">{config.regNumber}</span>
                <span className="text-red-700">{config.helpline1}</span>
                <span className="text-red-700">{config.helpline2}</span>
              </div>
            </div>
          </div>

          {/* Progress Stepper */}
          <div className="grid grid-cols-3 text-center text-[11px] sm:text-xs font-bold bg-gray-50 border-b border-gray-200">
            {STEPPER_STEPS.map((s) => (
              <div
                key={s.step}
                className={`py-2.5 px-2 transition ${
                  activeStep >= s.step ? 'bg-[#09246B] text-white' : 'text-gray-400'
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>

          {submittedData ? (
            <div className="p-6 sm:p-10 text-center space-y-6">
              <CheckCircle2 size={60} className="mx-auto text-green-600" />
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-[#172554]">
                  Application Submitted Successfully!
                </h2>
                <p className="text-sm text-gray-600 max-w-lg mx-auto">
                  Your TNMSSA membership application has been saved. Your payment is currently{' '}
                  <strong className="text-amber-700">PENDING VERIFICATION</strong> by the administration.
                </p>
              </div>

              <div className="max-w-md mx-auto bg-blue-50/70 border border-blue-200 rounded-2xl p-5 text-left space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Serial / Reference No:</span>
                  <span className="font-mono font-extrabold text-[#09246B]">{submittedData.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Applicant Name:</span>
                  <span className="font-bold text-gray-900">{submittedData.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">UPI Transaction ID:</span>
                  <span className="font-mono font-bold text-gray-900">{submittedData.upiTransactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Amount:</span>
                  <span className="font-bold text-gray-900">₹{submittedData.amount}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-blue-200">
                  <span className="text-gray-500 font-semibold">Payment Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    PENDING VERIFICATION
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={`${apiBase}/membership/${submittedData.serialNumber}/pdf/application?token=${encodeURIComponent(
                    submittedData.pdfToken
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                  style={{ backgroundColor: '#09246B' }}
                >
                  <FileText size={16} />
                  <span>Download Membership Application PDF</span>
                </a>

                <a
                  href={`${apiBase}/membership/${submittedData.serialNumber}/pdf/receipt?token=${encodeURIComponent(
                    submittedData.pdfToken
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                  style={{ backgroundColor: '#16A34A' }}
                >
                  <Download size={16} />
                  <span>Download Payment Receipt PDF</span>
                </a>
              </div>

              <button
                onClick={handleResetForm}
                className="text-xs font-semibold text-[#123DAA] hover:underline"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} autoComplete="off" className="p-5 sm:p-8 space-y-6">
              {/* Honeypot anti-bot field */}
              <input type="text" name="website_url" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              {/* Serial No & Date */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs">
                <div>
                  <span className="text-gray-500 font-semibold">Serial No (Auto): </span>
                  <span className="font-mono font-extrabold text-[#09246B]">{config.nextSerialPreview}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold">Registration Date: </span>
                  <span className="font-mono font-bold text-gray-800">
                    {REGISTRATION_DATE_DISPLAY}
                  </span>
                </div>
              </div>

              {/* Section 1: Applicant & Photo */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#172554] mb-1">
                      Applicant Name *
                    </label>
                    <input
                      type="text"
                      value={form.applicantName}
                      onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                      placeholder="Full name as per ID"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#123DAA]"
                    />
                    {errors.applicantName && <p className="text-xs text-red-600 mt-1">{errors.applicantName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172554] mb-1">Father's Name *</label>
                    <input
                      type="text"
                      value={form.fatherName}
                      onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#123DAA]"
                    />
                    {errors.fatherName && <p className="text-xs text-red-600 mt-1">{errors.fatherName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#172554] mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        value={form.dob}
                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#123DAA]"
                      />
                      {errors.dob && <p className="text-xs text-red-600 mt-1">{errors.dob}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#172554] mb-1">Age (Auto)</label>
                      <input
                        type="text"
                        readOnly
                        value={calculatedAge ? `${calculatedAge} Years` : ''}
                        placeholder="Auto"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172554] mb-1">Blood Group *</label>
                    <select
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172554] mb-1">
                      Educational Qualification *
                    </label>
                    <input
                      type="text"
                      name="edu_qualification_field"
                      autoComplete="new-password"
                      placeholder="e.g. Diploma / B.Sc / HSC"
                      value={form.educationalQualification}
                      onChange={(e) => setForm({ ...form, educationalQualification: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                    {errors.educationalQualification && (
                      <p className="text-xs text-red-600 mt-1">{errors.educationalQualification}</p>
                    )}
                  </div>
                </div>

                {/* Applicant Photo Box */}
                <div className="flex flex-col items-center">
                  <label className="block text-xs font-bold text-[#172554] mb-1.5 text-center">
                    Applicant Photo (JPG/PNG) *
                  </label>
                  <label className="w-36 h-44 rounded-2xl border-2 border-dashed border-[#09246B]/40 bg-blue-50/40 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-blue-50 transition">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Applicant" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-3 space-y-1.5 text-gray-500">
                        <Upload size={22} className="mx-auto text-[#09246B]" />
                        <span className="text-[11px] font-semibold block">Upload Photo</span>
                        <span className="text-[10px] text-gray-400 block">Max 5MB</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={(e) => handleImageSelect(e, 'photo')}
                      className="hidden"
                    />
                  </label>
                  {errors.photo && <p className="text-xs text-red-600 mt-1 text-center">{errors.photo}</p>}
                </div>
              </div>

              {/* Section 2: Business & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">
                    Aadhaar Number (Protected & Masked)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="aadhaar_secure_field"
                      autoComplete="new-password"
                      inputMode="numeric"
                      maxLength={12}
                      placeholder="12-digit Aadhaar (Optional)"
                      value={
                        showAadhaar
                          ? form.aadhaarNumber
                          : form.aadhaarNumber.length > 4
                          ? `${'X'.repeat(form.aadhaarNumber.length - 4)}${form.aadhaarNumber.slice(-4)}`
                          : form.aadhaarNumber
                      }
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                        if (showAadhaar || e.target.value.length <= form.aadhaarNumber.length) {
                          setForm({ ...form, aadhaarNumber: raw });
                        } else {
                          const added = e.target.value.slice(-1).replace(/\D/g, '');
                          if (added && form.aadhaarNumber.length < 12) {
                            setForm({ ...form, aadhaarNumber: form.aadhaarNumber + added });
                          }
                        }
                      }}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm font-mono tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAadhaar(!showAadhaar)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      title={showAadhaar ? 'Mask Aadhaar' : 'Show Aadhaar'}
                    >
                      {showAadhaar ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.aadhaarNumber && <p className="text-xs text-red-600 mt-1">{errors.aadhaarNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">
                    Mobile Service / Sales Experience *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5 Years in Mobile Sales & Chip-level Service"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                  {errors.experience && <p className="text-xs text-red-600 mt-1">{errors.experience}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">Shop Name *</label>
                  <input
                    type="text"
                    value={form.shopName}
                    onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                  {errors.shopName && <p className="text-xs text-red-600 mt-1">{errors.shopName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">District *</label>
                  <select
                    value={form.districtId}
                    onChange={(e) => setForm({ ...form, districtId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                  >
                    {TN_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameEn} ({d.nameTa})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#172554] mb-1">Shop Address *</label>
                  <textarea
                    rows={2}
                    value={form.shopAddress}
                    onChange={(e) => setForm({ ...form, shopAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                  {errors.shopAddress && <p className="text-xs text-red-600 mt-1">{errors.shopAddress}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">Phone / Mobile No *</label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">Alternate Mobile No</label>
                  <input
                    type="tel"
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="10-digit alternate mobile"
                    value={form.alternateMobile}
                    onChange={(e) =>
                      setForm({ ...form, alternateMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                  {errors.alternateMobile && (
                    <p className="text-xs text-red-600 mt-1">{errors.alternateMobile}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">Email ID *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">Insta / FB ID</label>
                  <input
                    type="text"
                    placeholder="@shop_handle"
                    value={form.socialId}
                    onChange={(e) => setForm({ ...form, socialId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">Refer Name</label>
                  <input
                    type="text"
                    value={form.referName}
                    onChange={(e) => setForm({ ...form, referName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">Area RTO No *</label>
                  <input
                    type="text"
                    placeholder="e.g. TN-58 / TN-38"
                    value={form.areaRtoNo}
                    onChange={(e) => setForm({ ...form, areaRtoNo: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                  {errors.areaRtoNo && <p className="text-xs text-red-600 mt-1">{errors.areaRtoNo}</p>}
                </div>

                {/* Optional Signature Upload */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#172554] mb-1">
                    Applicant Signature (Optional - JPG/PNG)
                  </label>
                  <div className="flex items-center gap-3">
                    {sigPreview && (
                      <img src={sigPreview} alt="Signature" className="h-12 w-28 object-contain border rounded-lg bg-white p-1" />
                    )}
                    <label className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 text-xs font-semibold text-gray-600">
                      <Upload size={15} className="text-[#09246B]" />
                      <span>{sigFile ? sigFile.name : 'Upload Signature Image (Optional)'}</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        onChange={(e) => handleImageSelect(e, 'signature')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 3: Scan & Pay UPI QR Section */}
              <div className="rounded-3xl border-2 border-[#09246B]/20 bg-blue-50/40 p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <QrCode size={22} className="text-[#09246B]" />
                    <h2 className="text-base sm:text-lg font-extrabold text-[#09246B]">
                      Official Association Payment (Scan & Pay)
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <span className="px-2 py-0.5 rounded bg-white border text-gray-700">GPay</span>
                    <span className="px-2 py-0.5 rounded bg-white border text-gray-700">PhonePe</span>
                    <span className="px-2 py-0.5 rounded bg-white border text-gray-700">Paytm</span>
                    <span className="px-2 py-0.5 rounded bg-white border text-gray-700">Any UPI</span>
                  </div>
                </div>

                {/* Subscription Plan Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, planType: 'ANNUAL' })}
                    className={`p-3.5 rounded-2xl border-2 text-left transition ${
                      form.planType === 'ANNUAL'
                        ? 'border-[#09246B] bg-white shadow-sm'
                        : 'border-gray-200 bg-white/60'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-500">Annual Membership</p>
                    <p className="text-lg font-extrabold text-[#09246B]">₹{config.annualFee} / Year</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, planType: 'HALF_YEARLY' })}
                    className={`p-3.5 rounded-2xl border-2 text-left transition ${
                      form.planType === 'HALF_YEARLY'
                        ? 'border-[#09246B] bg-white shadow-sm'
                        : 'border-gray-200 bg-white/60'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-500">Half-Yearly Subscription</p>
                    <p className="text-lg font-extrabold text-[#09246B]">₹{config.halfYearlyFee} / 6 Months</p>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                  <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs text-center space-y-2">
                    <img
                      src={optimizeImageUrl(config.qrCodeUrl || '/tmssa-qr.webp', { width: 400 })}
                      alt="TNMSSA UPI QR Code"
                      loading="lazy"
                      decoding="async"
                      className="w-40 h-40 mx-auto object-contain"
                    />
                    <p className="text-[11px] font-bold text-[#09246B]">SCAN & PAY ₹{selectedAmount}</p>
                    {config.upiId && (
                      <p className="text-[10px] font-mono text-gray-500">UPI: {config.upiId}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertCircle size={14} />
                        <span>Important Payment Notice:</span>
                      </p>
                      <p>
                        தமிழ்நாடு மொபைல் சேல்ஸ் மற்றும் சர்வீஸ் அசோசியேசன் என்ற பெயரில் உள்ள அக்கவுண்டில் மட்டும் பணம் செலுத்தவும். Payment enters{' '}
                        <strong>PENDING VERIFICATION</strong> until verified by Admin.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172554] mb-1">
                        UPI Transaction ID / UTR Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 432198765432"
                        value={form.upiTransactionId}
                        onChange={(e) => setForm({ ...form, upiTransactionId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-mono"
                      />
                      {errors.upiTransactionId && (
                        <p className="text-xs text-red-600 mt-1">{errors.upiTransactionId}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172554] mb-1">
                        Payment Screenshot (Optional - JPG/PNG)
                      </label>
                      <div className="flex items-center gap-3">
                        {screenshotPreview && (
                          <img
                            src={screenshotPreview}
                            alt="Payment Screenshot"
                            className="h-12 w-12 object-cover rounded-lg border"
                          />
                        )}
                        <label className="flex-1 flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-gray-300 bg-white cursor-pointer hover:bg-gray-50 text-xs font-semibold text-gray-600">
                          <Upload size={14} className="text-[#16A34A]" />
                          <span>{screenshotFile ? screenshotFile.name : 'Upload UPI Receipt Screenshot'}</span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            onChange={(e) => handleImageSelect(e, 'screenshot')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.termsAccepted}
                    onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                    className="mt-0.5 rounded"
                  />
                  <span>
                    <strong>I agree to the terms and conditions of the Union (TNMSSA).</strong> I confirm that all provided details and payment transaction ID are accurate.
                  </span>
                </label>
                {errors.termsAccepted && <p className="text-xs text-red-600 mt-1">{errors.termsAccepted}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition disabled:opacity-60"
                style={{ backgroundColor: '#09246B' }}
              >
                <ShieldCheck size={18} />
                <span>
                  {submitting
                    ? 'Submitting Application & Generating PDF...'
                    : `Submit Membership Application (₹${selectedAmount})`}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
