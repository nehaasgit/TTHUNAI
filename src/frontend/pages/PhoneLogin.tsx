import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../contexts/AppContext.js';
import { Smartphone, ShieldCheck, AlertCircle, RefreshCw, KeyRound, RotateCcw } from 'lucide-react';
import { isFirebaseConfigured } from '../utils/firebase.js';

export default function PhoneLogin() {
  const { sendOtp, verifyOtp, t } = useApp();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer: any;
    if (step === 'otp' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, resendCountdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate 10-digit phone format
    const cleaned = phoneNumber.replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOtp(cleaned);
      if (result.success) {
        setStep('otp');
        setResendCountdown(30);
        setCanResend(false);
        if (result.debugCode) {
          setDemoCode(result.debugCode);
        } else {
          setDemoCode(null);
        }
      } else {
        setError(result.error || 'Failed to send verification code. Please check your number.');
      }
    } catch (err: any) {
      setError(err?.message || 'Could not connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError(null);
    setLoading(true);
    try {
      const cleaned = phoneNumber.replace(/\D/g, '').slice(-10);
      const result = await sendOtp(cleaned);
      if (result.success) {
        setResendCountdown(30);
        setCanResend(false);
        if (result.debugCode) {
          setDemoCode(result.debugCode);
        }
      } else {
        setError(result.error || 'Failed to resend code.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otpCode.replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp(phoneNumber, cleanOtp);
      if (result.success) {
        if (result.isNewUser) {
          navigate('/register');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || t('invalid_otp'));
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtpCode('');
    setError(null);
    setDemoCode(null);
  };

  const isConfigured = isFirebaseConfigured();

  return (
    <div className="flex flex-col justify-center min-h-screen bg-[#f0f6fc] text-slate-900 px-6 py-12 transition-colors duration-200">
      {/* reCAPTCHA Anchor Container */}
      <div id="recaptcha-container" />

      <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 border border-sky-150 shadow-md shadow-sky-950/5">
        
        {/* Step 1: Input Phone Number */}
        {step === 'phone' ? (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-sky-50 text-blue-700 border border-sky-150 rounded-2xl mb-4 shadow-2xs">
                <Smartphone className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-blue-950">
                {t('phone_login')}
              </h2>
              <p className="text-sm text-slate-600 mt-2 font-medium">
                Enter your mobile number to securely log in or create a new account.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('phone_number')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold">
                    +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('phone_placeholder')}
                    className="block w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-sky-200 bg-sky-50/50 text-blue-950 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all duration-200 text-lg font-bold"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 text-sm rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Predictable verification notification box */}
              {!isConfigured && (
                <div className="p-4 bg-sky-50 text-slate-700 text-xs rounded-xl border border-sky-200/80">
                  <p className="font-bold text-blue-800 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Sandbox Testing Mode
                  </p>
                  Use any 10-digit number. The sandbox OTP code will be shown on the next screen.
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-2xl shadow-md shadow-blue-600/15 flex items-center justify-center gap-2 text-base transition-all duration-200 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  t('send_otp')
                )}
              </motion.button>
            </form>
          </div>
        ) : (
          /* Step 2: Verification Code Input */
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-sky-50 text-blue-700 border border-sky-150 rounded-2xl mb-4 shadow-2xs">
                <KeyRound className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-blue-950">
                {t('enter_otp')}
              </h2>
              <p className="text-sm text-slate-600 mt-2 font-medium">
                {t('otp_sent_to')} <span className="font-bold text-blue-950">+91 {phoneNumber}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('otp_placeholder')}
                  className="block w-full text-center px-4 py-4 rounded-2xl border-2 border-sky-200 bg-sky-50/50 text-blue-950 focus:border-blue-600 focus:bg-white focus:outline-none transition-all duration-200 text-2xl font-mono tracking-[0.5em] font-extrabold"
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 text-sm rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              {/* Dynamic SMS Indicator for Sandbox Mode */}
              {demoCode && (
                <div className="p-4 bg-sky-50 text-blue-900 text-sm rounded-xl border border-sky-200 flex flex-col gap-1 text-center font-semibold">
                  <div>[Sandbox Verification Code]</div>
                  <div className="text-2xl font-mono font-black tracking-widest text-blue-950 mt-1">
                    {demoCode}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-2xl shadow-md shadow-blue-600/15 flex items-center justify-center gap-2 text-base transition-all duration-200 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    t('verify_otp')
                  )}
                </motion.button>

                {/* Resend OTP Button */}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || loading}
                  className="w-full text-xs font-bold text-blue-700 disabled:text-slate-400 hover:text-blue-900 text-center py-2 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {canResend ? (
                    'Resend OTP'
                  ) : (
                    `Resend OTP in ${resendCountdown}s`
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="w-full text-sm font-bold text-slate-500 hover:text-blue-800 text-center py-2 cursor-pointer transition-colors"
                  disabled={loading}
                >
                  &larr; {t('back')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

