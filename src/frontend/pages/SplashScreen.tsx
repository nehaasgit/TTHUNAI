import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Handshake } from 'lucide-react';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Elegant auto-transition after 3 seconds for standard splash screen behavior
    const timer = setTimeout(() => {
      navigate('/select-language');
    }, 3200);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f6fc] text-slate-900 transition-colors duration-200">
      <div className="max-w-md w-full px-6 flex flex-col items-center text-center">
        
        {/* Animated Icon Glow */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: [1, 1.15, 1], opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full w-32 h-32 -left-4 -top-4 animate-pulse"></div>
          <div className="relative bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-600/15">
            <Handshake className="w-16 h-16" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* ThunAI Branding */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-3"
        >
          <h1 className="text-4xl font-black tracking-tight text-blue-950">
            ThunAI
          </h1>
          <div className="text-xs font-mono tracking-widest text-blue-700 font-bold uppercase">
            Digital Companion • டிஜிட்டல் தோழன்
          </div>
          
          <p className="text-sm text-slate-600 mt-4 max-w-xs mx-auto font-medium">
            Your trusted AI companion and mobile portal for living and working in Tamil Nadu.
          </p>
        </motion.div>

        {/* Translation greetings subtitle cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-12 space-y-2 text-xs text-slate-500 font-medium"
        >
          <div>தமிழ்நாட்டிற்கு உங்களை வரவேற்கிறோம்</div>
          <div>तमिलनाडु में आपका स्वागत है</div>
          <div>Welcome to Tamil Nadu</div>
        </motion.div>

        {/* Dynamic Loading Indicator Bar */}
        <div className="w-36 h-1 bg-sky-150 rounded-full overflow-hidden mt-12">
          <motion.div 
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="relative h-full bg-blue-600 w-1/2 rounded-full"
          />
        </div>

        {/* Optional Manual Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          onClick={() => navigate('/select-language')}
          className="mt-8 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline px-4 py-2 cursor-pointer"
        >
          Get Started &rarr;
        </motion.button>

      </div>
    </div>
  );
}
