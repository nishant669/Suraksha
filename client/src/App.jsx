import React, { useState, useEffect, useRef } from 'react';

// ✅ 1. Auth & API Imports
import { useAuth } from './context/AuthContext'; 
import { getWeather, getSOSHistory, chatWithAI } from './services/api';

// ✅ 2. New Page Import 

import MapPage from './pages/MapPage'; 

// ✅ 3. Consolidated Icons Import (Saare icons ek saath)
import { 
  Cloud, Sun, CloudRain, Shield, Menu, X, MapPin, Phone, Users, 
  MessageSquare, Map as MapIcon, User, Home, Info, Mail, HelpCircle, 
  AlertTriangle, Bell, LogOut, Activity, Send, Download, CheckCircle, 
  Navigation, Clock, Star, Check, Search, Filter, ChevronRight, 
  Settings, FileText, Lock, Calendar, 
  Thermometer, Wind, Droplets 
} from 'lucide-react';

// Services
// Assets
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// // Leaflet Icon Fix
// let DefaultIcon = L.icon({
//     iconUrl: markerIcon,
//     shadowUrl: markerShadow,
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34]
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// ==================== CSS FOR REALISTIC ANIMATION ====================
const AnimationStyles = () => (
  <style>{`
    .anim-wrapper {
      background: radial-gradient(circle at center, #1e293b, #0f172a, #020617);
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    .anim-wrapper::before {
      content: '';
      position: absolute;
      width: 200%;
      height: 200%;
      background-image: 
        linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px);
      background-size: 40px 40px;
      transform: perspective(500px) rotateX(60deg);
      animation: gridMove 20s linear infinite;
      top: -50%;
    }
    @keyframes gridMove {
      0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
      100% { transform: perspective(500px) rotateX(60deg) translateY(40px); }
    }
    .scene-container {
      position: relative;
      width: 100%;
      max-width: 800px;
      height: 400px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      z-index: 10;
    }
    .letters-container {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      z-index: 10;
      height: 120px;
    }
    .letter {
      font-size: 4rem;
      font-weight: 900;
      color: #fff;
      text-transform: uppercase;
      text-shadow: 0 0 10px #38bdf8, 0 0 20px #0284c7;
      opacity: 0;
      transform: translateY(-200px);
    }
    .letter.drop {
      animation: dropBounce 1s forwards ease-out;
    }
    @keyframes dropBounce {
      0% { transform: translateY(-300px) scale(0.5); opacity: 0; }
      60% { transform: translateY(10px) scale(1.1); opacity: 1; }
      80% { transform: translateY(-10px) scale(1); }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }
    .road {
      position: relative;
      width: 0;
      height: 4px;
      background: #38bdf8;
      box-shadow: 0 0 20px #38bdf8;
      z-index: 5;
      animation: expandRoad 1s forwards ease-out 2s;
      margin-top: 10px;
    }
    @keyframes expandRoad {
      0% { width: 0; opacity: 0; }
      100% { width: 90%; opacity: 1; }
    }
    .car-container {
      position: absolute;
      bottom: -15px;
      left: -200px;
      width: 180px; 
      height: 90px;
      z-index: 20;
      opacity: 0;
      animation: driveLoop 4s linear infinite; 
      animation-delay: 2.2s;
    }
    @keyframes driveLoop {
      0% { left: -200px; opacity: 0; transform: scale(0.8); }
      10% { opacity: 1; }
      100% { left: 110%; opacity: 1; transform: scale(1); }
    }
    .car-chassis-group {
      animation: bounce 0.5s infinite ease-in-out alternate;
    }
    @keyframes bounce {
      from { transform: translateY(0); }
      to { transform: translateY(-2px); }
    }
    .wheel {
      transform-box: fill-box;
      transform-origin: center;
      animation: spin 0.25s linear infinite; 
      will-change: transform;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .siren-light {
      animation: sirenFlash 0.5s infinite alternate;
    }
    @keyframes sirenFlash {
      from { fill: #ef4444; filter: drop-shadow(0 0 10px #ef4444); }
      to { fill: #3b82f6; filter: drop-shadow(0 0 10px #3b82f6); }
    }
    .loading-status {
      position: absolute;
      bottom: 10%;
      color: #94a3b8;
      font-size: 14px;
      letter-spacing: 4px;
      font-weight: 600;
      animation: blink 1.5s infinite;
      text-transform: uppercase;
    }
    @media (max-width: 768px) {
      .letter { font-size: 2.5rem; }
      .car-container { width: 140px; height: 70px; }
    }
  `}</style>
);

// ==================== ANIMATION COMPONENT ====================
const IntroAnimation = ({ fastMode = false }) => {
  const word = "SURAKSHA".split("");
  
  return (
    <div className="anim-wrapper">
      <AnimationStyles />
      <div className="scene-container">
        <div className="letters-container">
          {word.map((char, index) => (
            <div 
              key={index} 
              className={fastMode ? "letter" : "letter drop"} 
              style={{ 
                animationDelay: fastMode ? '0s' : `${index * 0.15}s`,
                opacity: fastMode ? 1 : 0,
                transform: fastMode ? 'translateY(0)' : undefined 
              }}
            >
              {char}
            </div>
          ))}
        </div>

        <div className="road">
          <div 
            className="car-container" 
            style={{ 
              animationDelay: fastMode ? '0s' : '2.2s', 
              opacity: fastMode ? 1 : 0 
            }}
          >
            <svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="50%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              <ellipse cx="110" cy="95" rx="90" ry="10" fill="rgba(0,0,0,0.5)" filter="blur(5px)"/>
              
              <g className="car-chassis-group" transform="translate(10, 10)">
                <path d="M20 70 L180 70 L190 55 L185 45 L140 25 L60 25 L25 45 L10 55 Z" fill="url(#carGradient)" stroke="#38bdf8" strokeWidth="2"/>
                <path d="M65 30 L135 30 L170 48 L35 48 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1"/>
                <rect x="90" y="20" width="20" height="6" rx="2" className="siren-light"/>
                <path d="M180 58 L190 58 L190 65 L180 65 Z" fill="#fbbf24" filter="drop-shadow(0 0 5px #fbbf24)"/>
                <path d="M20 58 L10 58 L10 65 L20 65 Z" fill="#ef4444" filter="drop-shadow(0 0 5px #ef4444)"/>
              </g>

              <g transform="translate(60, 80)">
                <g className="wheel">
                   <circle cx="0" cy="0" r="14" fill="#000000" stroke="#38bdf8" strokeWidth="2"/>
                   <circle cx="0" cy="0" r="6" fill="#38bdf8"/>
                   <line x1="-14" y1="0" x2="14" y2="0" stroke="#ffffff" strokeWidth="2"/>
                   <line x1="0" y1="-14" x2="0" y2="14" stroke="#ffffff" strokeWidth="2"/>
                </g>
              </g>

              <g transform="translate(150, 80)">
                <g className="wheel">
                   <circle cx="0" cy="0" r="14" fill="#000000" stroke="#38bdf8" strokeWidth="2"/>
                   <circle cx="0" cy="0" r="6" fill="#38bdf8"/>
                   <line x1="-14" y1="0" x2="14" y2="0" stroke="#ffffff" strokeWidth="2"/>
                   <line x1="0" y1="-14" x2="0" y2="14" stroke="#ffffff" strokeWidth="2"/>
                </g>
              </g>

            </svg>
          </div>
        </div>

        <div className="loading-status">System Secure • Connection Encrypted</div>
      </div>
    </div>
  );
};

// ==================== UI COMPONENTS ====================
const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- RESTORED CARD COMPONENT ---
const Card = ({ children, className = '', ...props }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow-lg ${className}`} {...props}>
    {children}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input
    className={`flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all ${className}`}
    {...props}
  />
);

const Label = ({ children, ...props }) => (
  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-200" {...props}>
    {children}
  </label>
);

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <div className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-slide-up border border-white/10`}>
      {type === 'success' && <CheckCircle className="w-5 h-5" />}
      {message}
    </div>
  );
};

// ==================== HEADER ====================
const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [notifications] = useState(3);

  return (
    <header className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {user && (
            <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-accent rounded-lg text-foreground">
              <Menu className="w-6 h-6" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Suraksha</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <button className="p-2.5 hover:bg-accent rounded-lg relative text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full text-xs text-white flex items-center justify-center font-bold animate-pulse">
                  {notifications}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// ==================== SIDEBAR ====================
const Sidebar = ({ isOpen, onClose, currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', color: 'text-blue-500' },
    { id: 'map', icon: MapIcon, label: 'Safe Routes', color: 'text-purple-500' },
    { id: 'sos', icon: AlertTriangle, label: 'SOS Alert', color: 'text-red-500' },
    { id: 'services', icon: Phone, label: 'Emergency', color: 'text-orange-500' },
    { id: 'guides', icon: Users, label: 'Guides', color: 'text-green-500' },
    { id: 'chat', icon: MessageSquare, label: 'AI Assistant', color: 'text-cyan-500' },
    { id: 'blockchain', icon: Activity, label: 'Blockchain', color: 'text-indigo-500' },
    { id: 'profile', icon: User, label: 'Profile', color: 'text-pink-500' },
  ];

  const companyLinks = [
    { id: 'about', icon: Info, label: 'About Us' },
    { id: 'contact', icon: Mail, label: 'Contact' },
    { id: 'support', icon: HelpCircle, label: 'Support' },
    { id: 'privacy', icon: Lock, label: 'Privacy Policy' },
    { id: 'terms', icon: FileText, label: 'Terms' },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm" onClick={onClose}></div>}

      <aside className={`fixed lg:static top-0 left-0 h-full w-72 bg-card border-r border-border z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col shadow-2xl`}>
        <div className="flex items-center justify-between p-6 border-b border-border lg:hidden">
          <span className="text-lg font-bold">Menu</span>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase mb-3 px-3 tracking-wider">Main Menu</p>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    currentPage === item.id
                      ? 'bg-primary text-white shadow-lg shadow-blue-900/20'
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${currentPage === item.id ? 'text-white' : item.color}`} />
                  <span className="font-semibold">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase mb-3 px-3 tracking-wider">Company</p>
            <nav className="space-y-1">
              {companyLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-semibold">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-3 bg-gray-900/50 mt-auto">
          
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg flex items-center gap-3">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
               <User className="w-5 h-5 text-white" />
             </div>
             <div className="flex-1 min-w-0">
               <p className="font-bold text-sm text-white truncate">{user?.name}</p>
               <p className="text-xs text-blue-100/80 truncate">{user?.email}</p>
             </div>
          </div>

          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors shadow-lg shadow-red-900/20"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

// ==================== AUTH PAGES (CONNECTED TO BACKEND) ====================
const LoginPage = ({ onNavigate }) => {
  // 1. We get 'login', not 'register'
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Correct HandleSubmit for LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the login function from AuthContext
      const result = await login(form.email, form.password);
      
      if (result.success) {
        setToast({ message: 'Login successful!', type: 'success' });
        // No need to navigate manually, AuthContext usually updates the 'user' state 
        // which triggers the main App to show the Dashboard.
      } else {
        setToast({ message: result.message || 'Login failed', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 animate-slide-up">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-900/20">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black mb-2 text-white">Welcome Back</h1>
          <p className="text-gray-300 text-lg">Sign in to your Suraksha account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="your@email.com"
            required
            className="h-12 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
            className="h-12 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        <button type="button" onClick={() => onNavigate('forgot')} className="text-sm text-blue-400 hover:text-blue-300 font-semibold">
          Forgot password?
        </button>

        <Button disabled={isLoading} type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-900/20">
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        <div className="text-center text-sm text-gray-300">
          Don't have an account?{' '}
          <button type="button" onClick={() => onNavigate('register')} className="text-blue-400 font-bold hover:text-blue-300">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

// Find the RegisterPage component in App.jsx and replace it with this:

const RegisterPage = ({ onNavigate }) => {
  const { register, verifyAccount } = useAuth();
  
  // State for form
  const [step, setStep] = useState(1); // 1 = Register, 2 = OTP
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', type: 'tourist' });
  const [otp, setOtp] = useState('');
  
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        // CHANGE THIS LINE: was 'user_type', must be 'type' to match Python schema
        type: form.type 
    };
    const result = await register(payload);
    
    setIsLoading(false);
    if (result.success) {
  setToast({ message: 'Registration successful! Please login.', type: 'success' });
  setTimeout(() => onNavigate('login'), 2000);
}
  };

  // Handle OTP Verification
  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await verifyAccount(form.email, otp);
    
    setIsLoading(false);
    if (result.success) {
      setToast({ message: 'Account Verified! Logging in...', type: 'success' });
      // The AuthContext will update 'user', causing the main App to switch to Dashboard automatically
    } else {
      setToast({ message: result.message, type: 'error' });
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 animate-slide-up">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white">
            {step === 1 ? "Create Account" : "Verify Email"}
        </h1>
        <p className="text-gray-300 text-lg">
            {step === 1 ? "Join Suraksha for safer travel" : `Enter code sent to ${form.email}`}
        </p>
      </div>

      {step === 1 ? (
        // --- STEP 1: REGISTRATION FORM ---
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 1234567890" required className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required className="bg-gray-800 border-gray-700 text-white" />
          </div>

          <Button disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-900/20">
            {isLoading ? 'Sending OTP...' : 'Next'}
          </Button>
          
          <div className="text-center text-sm text-gray-300">
            Already have an account?{' '}
            <button type="button" onClick={() => onNavigate('login')} className="text-blue-400 font-bold hover:text-blue-300">
              Sign In
            </button>
          </div>
        </form>
      ) : (
        // --- STEP 2: OTP FORM ---
        <form onSubmit={handleVerify} className="space-y-6">
           <div className="space-y-2">
            <Label>One-Time Password (OTP)</Label>
            <Input 
                type="text" 
                maxLength="6"
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="123456" 
                className="bg-gray-800 border-gray-700 text-white text-center text-2xl tracking-widest" 
                autoFocus
            />
          </div>
          
          <Button disabled={isLoading} type="submit" className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:shadow-lg hover:shadow-green-900/20">
            {isLoading ? 'Verifying...' : 'Verify & Login'}
          </Button>

          <button 
            type="button" 
            onClick={() => setStep(1)} 
            className="w-full text-center text-sm text-gray-400 hover:text-white"
          >
            Wrong email? Go back
          </button>
        </form>
      )}
    </div>
  );
};
const ForgotPasswordPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setToast({ message: 'Reset link sent to your email!', type: 'success' });
    setTimeout(() => onNavigate('login'), 2000);
  };

  return (
    <div className="w-full max-w-md space-y-8 animate-slide-up">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white">Reset Password</h1>
        <p className="text-gray-300 text-lg">Enter your email to receive reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="bg-gray-800 border-gray-700 text-white" />
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-900/20">
          Send Reset Link
        </Button>

        <button type="button" onClick={() => onNavigate('login')} className="w-full text-center text-sm text-blue-400 font-semibold hover:text-blue-300">
          Back to Login
        </button>
      </form>
    </div>
  );
};
// ==================== WEATHER WIDGET ====================
const WeatherWidget = ({ weatherData, currentDateTime }) => {
  if (!weatherData) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-8 h-full flex flex-col items-center justify-center text-center">
        <Cloud className="w-12 h-12 text-blue-400 mb-4 animate-pulse" />
        <p className="text-gray-400">Loading local weather data...</p>
      </Card>
    );
  }

  // Format: "Jan 10, 2026"
  const formattedDate = currentDateTime ? currentDateTime.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }) : 'Jan 10, 2026';

  // Format: "12:57 PM"
  const formattedTime = currentDateTime ? currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) : '';

  return (
    <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-gray-700 p-8 h-full flex flex-col justify-between shadow-2xl backdrop-blur-md">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black text-white">{weatherData.temp || '22'}°C</h2>
          <p className="text-blue-300 font-bold uppercase tracking-widest mt-1">
            {weatherData.condition || 'Clear'}
          </p>
        </div>
        <div className="p-3 bg-blue-500/20 rounded-2xl">
          <Sun className="w-10 h-10 text-yellow-400" />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-gray-900/40 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Wind className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-tighter">Wind</span>
          </div>
          <p className="text-white font-bold">{weatherData.wind || '12'} km/h</p>
        </div>
        <div className="bg-gray-900/40 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Droplets className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-tighter">Humidity</span>
          </div>
          <p className="text-white font-bold">{weatherData.humidity || '45'}%</p>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-gray-400">
        <span className="text-sm font-bold">Bhopal, MP</span>
        <div className="flex flex-col items-end">
          <span className="text-xs font-mono font-bold">{formattedDate}</span>
          <span className="text-[10px] font-mono opacity-70">{formattedTime}</span>
        </div>
      </div>
    </Card>
  );
};

// ==================== WEATHER FORECAST SECTION ====================
// ==================== WEATHER FORECAST SECTION ====================
const WeatherForecastSection = ({ forecast }) => {
  // 1. Fallback State: Shows a loading animation if data isn't ready
  if (!forecast || !forecast.time) {
    return (
      <div className="px-6 py-8 text-center text-gray-500 animate-pulse font-mono text-sm">
        Syncing 7-day outlook...
      </div>
    );
  }

  // 2. Helper to pick the right weather icon based on WMO codes
  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="w-6 h-6 text-yellow-400" />;
    if (code <= 3) return <Cloud className="w-6 h-6 text-blue-300" />;
    if (code >= 45 && code <= 48) return <Wind className="w-6 h-6 text-gray-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-6 h-6 text-blue-500" />;
    return <CloudRain className="w-6 h-6 text-purple-400" />;
  };

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Calendar className="w-6 h-6 text-blue-500" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
          7-Day Outlook
        </h2>
      </div>
      
      {/* 7-Day Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {forecast.time.map((dateStr, index) => {
          const dateObj = new Date(dateStr);
          const isToday = index === 0;

          return (
            <div 
              key={index} 
              className={`rounded-2xl p-4 border transition-all group text-center ${
                isToday 
                  ? 'bg-blue-600/20 border-blue-500/50 shadow-lg' 
                  : 'bg-gray-800/40 border-gray-700 hover:border-blue-500'
              }`}
            >
              {/* Day Name (e.g., Mon, Tue) */}
              <p className={`font-black text-xs uppercase mb-1 ${isToday ? 'text-white' : 'text-blue-400'}`}>
                {isToday ? "Today" : dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
              </p>

              {/* Date (e.g., Jan 12) */}
              <p className="text-gray-500 text-[10px] mb-3 font-bold">
                {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>

              {/* Weather Icon with Hover Animation */}
              <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform">
                {getWeatherIcon(forecast.weather_code[index])}
              </div>

              {/* Max Temp */}
              <div className="text-sm font-black text-white">
                {Math.round(forecast.temperature_2m_max[index])}°C
              </div>

              {/* Min Temp */}
              <div className="text-[10px] text-gray-500 font-bold">
                {Math.round(forecast.temperature_2m_min[index])}°C
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
// ==================== ACTIVE ALERTS COMPONENT (ROW-WISE) ====================
const ActiveAlertsSection = () => {
  const alerts = [
    {
      id: "fog-01",
      title: "Severe Dense Fog Warning",
      message: "Visibility < 50m in Airport area. Major flight/train delays expected until 11:00 AM.",
      severity: "high",
      time: "Updated 10m ago",
      icon: <Wind className="w-6 h-6" />
    },
    {
      id: "cold-01",
      title: "Cold Wave Alert",
      message: "Minimum temperature likely to remain below 5°C for next 48 hours. Frost risk in open areas.",
      severity: "high",
      time: "Updated 1h ago",
      icon: <Thermometer className="w-6 h-6" />
    },
    {
      id: "aqi-01",
      title: "AQI Advisory: Very Poor",
      message: "Current AQI: 287. Sensitive groups should avoid outdoor activities and wear N95 masks.",
      severity: "medium",
      time: "Updated 3h ago",
      icon: <AlertTriangle className="w-6 h-6" />
    }
  ];

  const getStyles = (sev) => 
    sev === 'high' 
      ? 'border-red-600 bg-red-600/10 text-red-500' 
      : 'border-orange-500 bg-orange-500/10 text-orange-500';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-red-500 animate-pulse" />
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Live Alert Monitor</h2>
      </div>

      <div className="flex flex-col gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className={`flex flex-col md:flex-row md:items-center gap-6 border-l-[8px] rounded-2xl p-6 transition-all hover:bg-gray-800 ${getStyles(alert.severity)}`}>
            <div className="flex shrink-0 items-center justify-center p-3 bg-gray-900/50 rounded-xl">
              {alert.icon}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">{alert.title}</h3>
              <p className="text-sm text-gray-300 font-medium leading-relaxed">{alert.message}</p>
            </div>

            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 md:text-right">
              {alert.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== RECENT ACTIVITY SECTION ====================
const RecentActivitySection = ({ sosHistory = [] }) => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
        <Activity className="w-6 h-6 text-blue-500" />
        Recent SOS Activity
      </h2>
      
      <div className="space-y-3">
        {sosHistory && sosHistory.length > 0 ? (
          sosHistory.map((log) => (
            <Card key={log.id} className="p-4 bg-gray-800/50 border-gray-700 flex justify-between items-center transition-all hover:bg-gray-800">
              <div>
                <p className="text-white font-bold">{log.message || "Emergency Alert"}</p>
                <p className="text-xs text-gray-400 font-mono">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold flex items-center gap-1 ${
                  log.status === 'active' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {log.status === 'active' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />}
                  {log.status}
                </span>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">No recent alerts found in database.</p>
        )}
      </div>
    </div>
  );
};

// ==================== SAFETY NEWS FEED ====================
// ✅ CORRECT CODE (Ise rakhein aur rename karein)

// Naam badal kar 'SafetyNews' kar dein
const SafetyNews = () => { 
    const [news, setNews] = useState([]);

    useEffect(() => {
        const fetchNews = async () => {
            // ✅ Render URL (Sahi hai)
            const res = await fetch('https://suraksha-a74u.onrender.com/api/safety/news?query=travel safety india');
            const data = await res.json();
            setNews(data.articles || []);
        };
        fetchNews();
    }, []);

    return (
        <Card className="p-6 bg-gray-900/60 border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="text-blue-500" /> Local Safety Updates
            </h2>
            <div className="space-y-4">
                {news.map((article, i) => (
                    <div key={i} className="border-b border-gray-800 pb-2">
                        <a href={article.url} target="_blank" className="text-sm font-semibold text-blue-400 hover:underline">
                            {article.title}
                        </a>
                        <p className="text-xs text-gray-400 mt-1">{article.source.name}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// ==================== MAIN DASHBOARD PAGE ====================
// ==================== DASHBOARD PAGE ====================
const DashboardPage = ({ weatherData, currentDateTime, sosHistory, onTriggerSOS }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(5);
  // Toast state is managed by the parent App usually, but if needed locally:
  // const [toast, setToast] = useState(null); 

  // Effect to handle the countdown when SOS is activated
  useEffect(() => {
    let timer;
    if (isActivated && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isActivated && countdown === 0) {
      onTriggerSOS(); // Trigger the SOS function passed from App.jsx
      setIsActivated(false);
      setCountdown(5); // Reset countdown
    }
    return () => clearTimeout(timer);
  }, [isActivated, countdown, onTriggerSOS]);

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-[#020617] min-h-screen">
      {/* ROW 1: COMMAND CENTER & WEATHER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <Card className="bg-gray-900/60 border-gray-800 p-8 flex flex-col items-center justify-center relative overflow-hidden">
           {/* Animated Pulse Line */}
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
           
           <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-widest italic">Command Center</h2>
           
           <button 
             onClick={() => setIsActivated(true)} 
             className={`w-52 h-52 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group ${
               isActivated 
                 ? 'bg-red-600 animate-pulse scale-95 ring-8 ring-red-900/50' 
                 : 'bg-gradient-to-br from-red-600 to-pink-700 hover:scale-105'
             }`}
           >
             <div className="text-center">
               {isActivated ? (
                 <div className="text-white">
                   <div className="text-6xl font-black mb-2">{countdown}</div>
                   <div className="text-xl font-bold">CANCEL</div>
                 </div>
               ) : (
                 <>
                   <Shield className="w-20 h-20 text-white mx-auto mb-2 group-hover:rotate-12 transition-transform" />
                   <span className="text-white font-black text-4xl">SOS</span>
                 </>
               )}
             </div>
           </button>
           <p className="text-red-500 mt-8 font-black text-xs uppercase tracking-tighter animate-pulse text-center">
             Tap for immediate emergency assistance
           </p>
        </Card>
        
        <WeatherWidget weatherData={weatherData} currentDateTime={currentDateTime} />
      </div>

      {/* ROW 2: LIVE SAFETY NEWS */}
      <div className="w-full">
         <SafetyNews /> {/* Ensure this matches the component name defined above */}
      </div>

      {/* ROW 3: 7-DAY FORECAST (Restored) */}
      <div className="w-full bg-gray-900/40 rounded-3xl border border-gray-800 shadow-xl">
         <WeatherForecastSection forecast={weatherData?.daily} />
      </div>

      {/* ROW 4: HISTORY & ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="w-full bg-gray-900/60 rounded-3xl border border-blue-900/20 shadow-2xl overflow-hidden">
          <RecentActivitySection sosHistory={sosHistory} />
        </div>
        <div className="w-full bg-gray-900/60 rounded-3xl border border-red-900/20 shadow-2xl overflow-hidden">
          <ActiveAlertsSection />
        </div>
      </div>
    </div>
  );
};
// // ==================== MAP PAGE ====================
// const RecenterMap = ({ lat, lon }) => {
//     const map = useMap();
//     useEffect(() => {
//         if (lat && lon) {
//             map.flyTo([lat, lon], 13, { animate: true });
//         }
//     }, [lat, lon, map]);
//     return null;
// };
// const MapPage = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedRoute, setSelectedRoute] = useState(null);
//   const [showFilters, setShowFilters] = useState(false);
    
//   const safeRoutes = [
//     { id: 1, name: 'Guwahati to Shillong', safety: 95, time: '3h 30m', distance: '103 km', type: 'highway' },
//     { id: 2, name: 'Kaziranga Safari Route', safety: 90, time: '2h', distance: '45 km', type: 'park' },
//     { id: 3, name: 'Tawang Mountain Pass', safety: 75, time: '8h', distance: '320 km', type: 'mountain' },
//     { id: 4, name: 'Majuli River Crossing', safety: 85, time: '1h 30m', distance: '20 km', type: 'ferry' },
//   ];

//   const safeZones = [
//     { id: 1, name: 'Police Station - Guwahati', type: 'police', lat: 26.1445, lng: 91.7362 },
//     { id: 2, name: 'Hospital - Dispur', type: 'hospital', lat: 26.1433, lng: 91.7898 },
//     { id: 3, name: 'Tourist Help Center - Shillong', type: 'help', lat: 25.5788, lng: 91.8933 },
//   ];

//   return (
//     <div className="p-6 md:p-8 space-y-6 animate-fade-in">
//       <div>
//         <h1 className="text-4xl font-black mb-2 text-white">Safe Routes</h1>
//         <p className="text-gray-300 text-lg">Find and navigate through the safest routes in Northeast India</p>
//       </div>

//       {/* Search Bar */}
//       <div className="flex flex-col md:flex-row gap-4">
//         <div className="flex-1 relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <Input
//             placeholder="Search for destinations, routes, or places..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10 h-12 bg-gray-800 border-gray-700 text-white"
//           />
//         </div>
//         <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="gap-2 border-gray-700 text-gray-300 hover:bg-gray-800">
//           <Filter className="w-4 h-4" />
//           Filters
//         </Button>
//       </div>

//       {/* Filters */}
//       {showFilters && (
//         <Card className="p-4 animate-slide-up bg-gray-800 border-gray-700">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div>
//               <Label className="text-sm mb-2 block text-gray-200">Route Type</Label>
//               <select className="w-full p-2 border bg-gray-700 rounded-lg text-sm text-white">
//                 <option>All Types</option>
//                 <option>Highway</option>
//                 <option>Mountain</option>
//                 <option>Park</option>
//                 <option>Ferry</option>
//               </select>
//             </div>
//             <div>
//               <Label className="text-sm mb-2 block text-gray-200">Safety Level</Label>
//               <select className="w-full p-2 border bg-gray-700 rounded-lg text-sm text-white">
//                 <option>All Levels</option>
//                 <option>90% - 100%</option>
//                 <option>75% - 90%</option>
//                 <option>Below 75%</option>
//               </select>
//             </div>
//             <div>
//               <Label className="text-sm mb-2 block text-gray-200">Distance</Label>
//               <select className="w-full p-2 border bg-gray-700 rounded-lg text-sm text-white">
//                 <option>Any Distance</option>
//                 <option>Less than 50km</option>
//                 <option>50km - 150km</option>
//                 <option>More than 150km</option>
//               </select>
//             </div>
//             <div>
//               <Label className="text-sm mb-2 block text-gray-200">Travel Time</Label>
//               <select className="w-full p-2 border bg-gray-700 rounded-lg text-sm text-white">
//                 <option>Any Duration</option>
//                 <option>Less than 2 hours</option>
//                 <option>2 - 5 hours</option>
//                 <option>More than 5 hours</option>
//               </select>
//             </div>
//           </div>
//         </Card>
//       )}

//       {/* Map Container - LEAFLET INTEGRATION */}
//       <div className="h-96 rounded-xl overflow-hidden border border-gray-700 relative z-0 bg-gray-800">
//         <MapContainer 
//           center={[26.1445, 91.7362]} 
//           zoom={13} 
//           scrollWheelZoom={true} 
//           style={{ height: '100%', width: '100%' }}
//         >
//           <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />
//           {safeZones.map((zone) => (
//             <Marker key={zone.id} position={[zone.lat, zone.lng]}>
//               <Popup>
//                 <div className="text-black font-sans">
//                   <strong className="block text-lg">{zone.name}</strong>
//                   <span className="capitalize text-sm text-gray-600">{zone.type}</span>
//                 </div>
//               </Popup>
//             </Marker>
//           ))}
//         </MapContainer>
        
//         {/* Map Overlays */}
//         <div className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur rounded-lg shadow-lg p-2 z-[1000] border border-gray-700">
//           <Button variant="ghost" size="sm" className="block w-full text-left justify-start gap-2 text-gray-300 hover:bg-gray-700">
//             <Navigation className="w-4 h-4" />
//             My Location
//           </Button>
//           <Button variant="ghost" size="sm" className="block w-full text-left justify-start gap-2 text-gray-300 hover:bg-gray-700">
//             <Download className="w-4 h-4" />
//             Download Map
//           </Button>
//         </div>
//       </div>

//       {/* Recommended Safe Routes */}
//       <div className="space-y-4">
//         <h2 className="text-2xl font-black text-white">Recommended Safe Routes</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {safeRoutes.map((route) => (
//             <Card 
//               key={route.id} 
//               className={`p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-900/10 bg-gray-800 border-gray-700 ${
//                 selectedRoute === route.id ? 'ring-2 ring-blue-500' : ''
//               }`}
//               onClick={() => setSelectedRoute(route.id)}
//             >
//               <div className="flex justify-between items-start mb-3">
//                 <h3 className="font-bold text-lg text-white">{route.name}</h3>
//                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${
//                   route.safety >= 90 ? 'bg-green-500/10 text-green-500' : 
//                   route.safety >= 75 ? 'bg-yellow-500/10 text-yellow-500' : 
//                   'bg-red-500/10 text-red-500'
//                 }`}>
//                   {route.safety}% Safe
//                 </span>
//               </div>
//               <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
//                 <span className="flex items-center gap-1">
//                   <Clock className="w-4 h-4" />
//                   {route.time}
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <Navigation className="w-4 h-4" />
//                   {route.distance}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">
//                   {route.type}
//                 </span>
//                 <Button size="sm">View Details</Button>
//               </div>
//             </Card>
//           ))}
//         </div>
//       </div>

//       {/* Nearby Safe Zones */}
//       <div className="space-y-4">
//         <h2 className="text-2xl font-black text-white">Nearby Safe Zones</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {safeZones.map((zone) => (
//             <Card key={zone.id} className="p-5 hover:shadow-lg transition-all bg-gray-800 border-gray-700">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                   zone.type === 'police' ? 'bg-blue-500/10' :
//                   zone.type === 'hospital' ? 'bg-red-500/10' :
//                   'bg-green-500/10'
//                 }`}>
//                   {zone.type === 'police' ? <Shield className="w-5 h-5 text-blue-500" /> :
//                    zone.type === 'hospital' ? <Activity className="w-5 h-5 text-red-500" /> :
//                    <HelpCircle className="w-5 h-5 text-green-500" />}
//                 </div>
//                 <h3 className="font-bold text-white">{zone.name}</h3>
//               </div>
//               <div className="flex items-center gap-2 text-sm text-gray-300">
//                 <MapPin className="w-4 h-4" />
//                 {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
//               </div>
//               <div className="mt-3 flex gap-2">
//                 <Button size="sm" variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700">
//                   <Navigation className="w-4 h-4 mr-1" />
//                   Navigate
//                 </Button>
//                 <Button size="sm" variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700">
//                   <Phone className="w-4 h-4 mr-1" />
//                   Contact
//                 </Button>
//               </div>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// ==================== SOS PAGE ====================
const SOSPage = () => {
  const { user } = useAuth();
  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [toast, setToast] = useState(null);
  const [localNumbers, setLocalNumbers] = useState({ police: '100', ambulance: '108' });
  
  // Static data for emergency contacts
  const emergencyContacts = [
    { id: 1, name: 'Local Police', phone: '100', type: 'police' },
    { id: 2, name: 'Ambulance', phone: '108', type: 'medical' },
    { id: 3, name: 'Tourist Helpline', phone: '1363', type: 'tourism' },
    { id: 4, name: 'Women Helpline', phone: '1091', type: 'women' },
    { id: 5, name: 'Personal', phone: '9755079498', type: 'personal' }, 
  ];

  // Fetch local emergency numbers based on country
  // ... states ...
  // Fetch local emergency numbers based on country
  useEffect(() => {
    const updateNumbers = async () => {
      try {
        // 🔴 PURANA (DELETE): const res = await fetch("http://localhost:8000/api/country/info?country_code=IN");

        // 🟢 NAYA (ADD THIS): Render URL use karein
        const res = await fetch("https://suraksha-a74u.onrender.com/api/country/info?country_code=IN");
        
        const data = await res.json();
        setLocalNumbers(data.emergency);
      } catch (e) { 
        console.error("API Error", e); 
      }
    };
    updateNumbers();
  }, []);

  // --- NEW: Helper Functions for Call and SMS ---
  const handleCall = (phone) => {
    // This opens the device's default dialer
    window.location.href = `tel:${phone}`;
  };

  const handleMessage = (phone) => {
    // This opens the device's default SMS app with a pre-filled message
    const messageBody = encodeURIComponent("HELP! I am in an emergency. Please contact me immediately.");
    window.location.href = `sms:${phone}?body=${messageBody}`;
  };
  // ----------------------------------------------

  // Effect to handle the countdown when SOS is activated
  useEffect(() => {
    let timer;
    if (isActivated && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isActivated && countdown === 0) {
      sendSOS(); // Trigger the SOS function
      setIsActivated(false);
      setCountdown(5); // Reset countdown
    }
    return () => clearTimeout(timer);
  }, [isActivated, countdown]);

  const sendSOS = async () => {
    if (!navigator.geolocation) {
      setToast({ message: "Geolocation is not supported by your browser", type: "error" });
      return;
    }

    setToast({ message: "Acquiring location...", type: "info" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

       try {
          const payload = {
            latitude: latitude,
            longitude: longitude,
            message: customMessage || "Emergency! I need help immediately.",
            contacts: selectedContacts.map(String)
          };

          const token = localStorage.getItem('token');
          
          // 👇👇👇 UPDATE THIS URL 👇👇👇
          const response = await fetch("https://suraksha-a74u.onrender.com/api/sos/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error("Failed to send SOS");
          }

          const data = await response.json();
          setToast({ 
            message: `SOS Sent! ID: ${data.id}. Help is on the way.`, 
            type: "success" 
          });

        } catch (error) {
          console.error(error);
          setToast({ message: "Failed to send SOS signal. Call 100 directly!", type: "error" });
        }
      },
      (error) => {
        setToast({ message: "Unable to retrieve location. Please enable GPS.", type: "error" });
      }
    );
  };

  const toggleContact = (id) => {
    setSelectedContacts(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div>
        <h1 className="text-4xl font-black mb-2 text-white">Emergency SOS</h1>
        <p className="text-gray-300 text-lg">Send immediate alerts to emergency services and contacts</p>
      </div>

      {/* SOS Button */}
      <div className="flex justify-center py-8">
        <button
          onClick={() => setIsActivated(true)}
          className={`w-56 h-56 rounded-full shadow-2xl shadow-red-900/40 transition-all duration-300 flex items-center justify-center group ${
            isActivated 
              ? 'bg-red-600 animate-pulse' 
              : 'bg-gradient-to-br from-red-600 to-pink-600 hover:scale-105'
          }`}
        >
          <div className="text-center">
            {isActivated ? (
              <div className="text-white">
                <div className="text-6xl font-black mb-2">{countdown}</div>
                <div className="text-xl font-bold">CANCEL</div>
              </div>
            ) : (
              <>
                <AlertTriangle className="w-24 h-24 text-white mx-auto mb-4" />
                <span className="text-white font-black text-4xl">SOS</span>
                <p className="text-white/80 text-sm mt-2">Press and hold</p>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Emergency Contacts with NEW Action Buttons */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white">Emergency Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact) => (
            <Card 
              key={contact.id} 
              className={`p-4 transition-all bg-gray-800 border-gray-700 ${
                selectedContacts.includes(contact.id) ? 'ring-2 ring-red-500 bg-red-500/10' : 'hover:shadow-lg'
              }`}
            >
              {/* Card Header (Click to Select) */}
              <div 
                className="flex items-center justify-between cursor-pointer mb-3"
                onClick={() => toggleContact(contact.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    contact.type === 'police' ? 'bg-blue-500/10' :
                    contact.type === 'medical' ? 'bg-red-500/10' :
                    contact.type === 'women' ? 'bg-pink-500/10' :
                    'bg-green-500/10'
                  }`}>
                    {contact.type === 'police' ? <Shield className="w-6 h-6 text-blue-500" /> :
                     contact.type === 'medical' ? <Activity className="w-6 h-6 text-red-500" /> :
                     contact.type === 'women' ? <Users className="w-6 h-6 text-pink-500" /> :
                     <Phone className="w-6 h-6 text-green-500" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{contact.name}</h3>
                    <p className="text-sm text-gray-300">{contact.phone}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 ${
                  selectedContacts.includes(contact.id) 
                    ? 'bg-red-500 border-red-500' 
                    : 'border-gray-600'
                }`}>
                  {selectedContacts.includes(contact.id) && (
                    <Check className="w-full h-full text-white p-1" />
                  )}
                </div>
              </div>

              {/* NEW: Direct Action Buttons */}
              <div className="flex gap-2 border-t border-gray-700 pt-3">
                <Button 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); handleCall(contact.phone); }} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white border-none shadow-md"
                >
                    <Phone className="w-4 h-4 mr-2" /> Call
                </Button>
                <Button 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); handleMessage(contact.phone); }} 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md"
                >
                    <MessageSquare className="w-4 h-4 mr-2" /> SMS
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Message */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white">Custom Message</h2>
        <Card className="p-5 bg-gray-800 border-gray-700">
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-message" className="text-gray-200">Additional Information (Optional)</Label>
              <textarea
                id="custom-message"
                className="w-full mt-2 p-3 border border-gray-700 bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-white"
                rows={4}
                placeholder="Provide any additional information that might help emergency services locate you..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ==================== SERVICES PAGE ====================
const ServicesPage = () => {
  const [activeTab, setActiveTab] = useState('emergency');
  const [toast, setToast] = useState(null);
    
  const emergencyServices = [
    { id: 1, name: 'Police', phone: '100', icon: Shield, color: 'text-blue-500' },
    { id: 2, name: 'Ambulance', phone: '108', icon: Activity, color: 'text-red-500' },
    { id: 3, name: 'Fire Brigade', phone: '101', icon: AlertTriangle, color: 'text-orange-500' },
    { id: 4, name: 'Disaster Management', phone: '1078', icon: Phone, color: 'text-purple-500' },
  ];

  const touristServices = [
    { id: 1, name: 'Tourist Helpline', phone: '1363', icon: Users, color: 'text-green-500' },
    { id: 2, name: 'Tourist Police', phone: '9864012776', icon: Shield, color: 'text-blue-500' },
    { id: 3, name: 'Hotel Association', phone: '0361-2546377', icon: Home, color: 'text-purple-500' },
    { id: 4, name: 'Transport Helpline', phone: '0361-2734866', icon: Navigation, color: 'text-indigo-500' },
  ];

  const handleCall = (phone) => {
    setToast({ message: `Calling ${phone}...`, type: 'info' });
    // In a real app, this would initiate a call
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div>
        <h1 className="text-4xl font-black mb-2 text-white">Emergency Services</h1>
        <p className="text-gray-300 text-lg">Quick access to emergency and support services</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('emergency')}
          className={`px-4 py-2 rounded-md font-semibold transition-all ${
            activeTab === 'emergency' 
              ? 'bg-gray-700 text-white shadow-sm' 
              : 'hover:bg-gray-700 text-gray-300'
          }`}
        >
          Emergency
        </button>
        <button
          onClick={() => setActiveTab('tourist')}
          className={`px-4 py-2 rounded-md font-semibold transition-all ${
            activeTab === 'tourist' 
              ? 'bg-gray-700 text-white shadow-sm' 
              : 'hover:bg-gray-700 text-gray-300'
          }`}
        >
          Tourist Support
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(activeTab === 'emergency' ? emergencyServices : touristServices).map((service) => (
          <Card key={service.id} className="p-6 hover:shadow-lg transition-all bg-gray-800 border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center">
                  <service.icon className={`w-7 h-7 ${service.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">{service.name}</h3>
                  <p className="text-2xl font-bold text-white">{service.phone}</p>
                </div>
              </div>
              <Button 
                onClick={() => handleCall(service.phone)}
                className="gap-2 h-12 px-6"
              >
                <Phone className="w-5 h-5" />
                Call
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Important Information */}
      <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-900/50 bg-gray-800">
        <h2 className="text-2xl font-black mb-4 text-white">Important Information</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-bold text-white">In case of emergency</h3>
              <p className="text-gray-300">Stay calm, provide clear information about your location and the nature of emergency.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-bold text-white">Know your location</h3>
              <p className="text-gray-300">Use landmarks, road signs, or GPS coordinates to help emergency services find you quickly.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h3 className="font-bold text-white">Tourist-specific support</h3>
              <p className="text-gray-300">The tourist helpline can assist with language barriers and travel-related emergencies.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Hospitals Map */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-white">Nearby Hospitals</h2>
        <Card className="h-64 overflow-hidden relative border-gray-700 bg-gray-800">
          <div className="absolute inset-0 bg-gray-700/50 flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-xl font-bold mb-2 text-white">Hospital Locations</p>
              <p className="text-gray-300">Showing nearest medical facilities</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ==================== GUIDES PAGE ====================
// ==================== GUIDES PAGE (Safe & Robust) ====================
const GuidesPage = () => {
  // 1. Static Guides Data
  const [guides] = useState([
    { 
      id: 1, 
      name: 'Raj Sharma', 
      rating: 4.8, 
      reviews: 127, 
      languages: ['English', 'Hindi', 'Assamese'], 
      specialties: ['Wildlife', 'Cultural Tours'], 
      price: 2500, 
      experience: '5 years',
      verified: true,
      available: true
    },
    { 
      id: 2, 
      name: 'Priya Das', 
      rating: 4.9, 
      reviews: 89, 
      languages: ['English', 'Bengali', 'Hindi'], 
      specialties: ['Trekking', 'Adventure Sports'], 
      price: 3000, 
      experience: '7 years',
      verified: true,
      available: true
    },
    { 
      id: 3, 
      name: 'Bhim Thapa', 
      rating: 4.7, 
      reviews: 156, 
      languages: ['English', 'Nepali', 'Hindi'], 
      specialties: ['Mountain Tours', 'Photography'], 
      price: 2800, 
      experience: '6 years',
      verified: true,
      available: false
    },
  ]);

  const [selectedGuide, setSelectedGuide] = useState(null);
  const [toast, setToast] = useState(null);
  const [apod, setApod] = useState(null);

  // 2. Robust API Fetching with Fallback
 // client/src/App.jsx -> GuidesPage component mein ye replace karein

  useEffect(() => {
    // 🟢 Step 1: Key Environment Variable se uthao
    const apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
    
    // Debugging ke liye (Browser console mein dikhega)
    console.log("Fetching NASA APOD with Key ending in:", apiKey.slice(-4));

    // 🟢 Step 2: API Call with Key
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("NASA API Rate Limit or Error");
        return res.json();
      })
      .then(data => {
        if (data.media_type === 'video') throw new Error("Video not supported");
        setApod(data);
      })
      .catch(err => {
        console.warn("Using Fallback Space Image:", err.message);
        // Fallback Image
        setApod({
          url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
          title: "Earth from Orbit (Fallback View)",
          date: new Date().toISOString().split('T')[0],
          explanation: "Connecting to NASA... In the meantime, enjoy this view of Earth."
        });
      });
  }, []);

  const handleBookGuide = (guideId) => {
    setToast({ message: 'Guide booking request sent!', type: 'success' });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div>
        <h1 className="text-4xl font-black mb-2 text-white">Local & Cosmic Guides</h1>
        <p className="text-gray-300 text-lg">Explore the earth with locals, and the universe with NASA.</p>
      </div>

      {/* --- NASA APOD SECTION --- */}
      {apod && (
        <Card className="relative overflow-hidden border-gray-700 group h-64 md:h-80 shadow-2xl rounded-2xl">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${apod.url})` }}
          ></div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3" /> NASA APOD
              </span>
              <span className="text-gray-300 text-xs font-mono bg-black/50 px-2 py-1 rounded-full">
                {apod.date}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-md">
              {apod.title}
            </h2>
            <p className="text-gray-200 text-sm md:text-base line-clamp-2 md:line-clamp-3 max-w-3xl drop-shadow-sm">
              {apod.explanation}
            </p>
          </div>
        </Card>
      )}
      {/* ----------------------------- */}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search guides by name, specialty, or language..."
            className="pl-10 h-12 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Button variant="outline" className="gap-2 border-gray-700 text-gray-300 hover:bg-gray-800">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Guides List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <Card key={guide.id} className="overflow-hidden hover:shadow-lg transition-all bg-gray-800 border-gray-700">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-900/20">
                    {guide.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{guide.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-white">{guide.rating}</span>
                      <span className="text-sm text-gray-300">({guide.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {guide.verified && (
                    <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${guide.available ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {guide.available ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm font-semibold mb-1 text-white">Languages</p>
                  <div className="flex flex-wrap gap-1">
                    {guide.languages.map((lang, idx) => (
                      <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300">{lang}</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Exp: {guide.experience}</span>
                  <span className="font-bold text-white">₹{guide.price}/day</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700" onClick={() => setSelectedGuide(guide.id)}>
                  View Profile
                </Button>
                <Button className="flex-1" disabled={!guide.available} onClick={() => handleBookGuide(guide.id)}>
                  Book Now
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
/// ==================== CHAT PAGE (With JokeAPI) ====================
// ==================== CHAT PAGE (FINAL & CLEAN) ====================
const ChatPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI travel assistant. Ask me about safe routes, emergency contacts, or travel tips!", sender: 'ai', time: '10:00 AM' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    // 1. User Message Show karein
    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    const userMessage = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      // 2. Backend API Call (Using api.js function)
      // Ab hum direct fetch nahi kar rahe, balki centralized api function use kar rahe hain
      const data = await chatWithAI(userMessage);

      // 3. AI Response Show karein
      const botResponse = {
        id: Date.now(),
        text: data.reply || "I am listening...",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error("Chat Error:", error);
      // Fallback Message
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "System Offline. Please check your internet or API Key.",
        sender: 'ai',
        time: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    { id: 1, text: "Safe routes near me", icon: Navigation },
    { id: 2, text: "Emergency contacts", icon: Phone },
    { id: 3, text: "Local weather", icon: Cloud },
    { id: 4, text: "Travel safety tips", icon: MessageSquare },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] p-6 md:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-4xl font-black mb-2 text-white">AI Travel Assistant</h1>
        <p className="text-gray-300 text-lg">Get instant help with your travel queries</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-gray-800 border-gray-700">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${message.sender === 'user' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'bg-gray-700 text-white'}`}>
                <p>{message.text}</p>
                <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>{message.time}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-700 p-4 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-700 p-4 bg-gray-800">
          <p className="text-sm font-semibold mb-3 text-white">Quick Actions</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="gap-2 border-gray-700 text-gray-300 hover:bg-gray-700"
                onClick={() => setInputText(action.text)}
              >
                <action.icon className="w-4 h-4" />
                {action.text}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-gray-700 border-gray-600 text-white"
            />
            <Button onClick={handleSendMessage} className="gap-2">
              <Send className="w-4 h-4" />
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
// ==================== BLOCKCHAIN PAGE ====================
const BlockchainPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([
    { 
      id: '0x1a2b3c4d5e6f7g8h9i0j', 
      type: 'identity', 
      timestamp: '2023-11-15 14:32:10', 
      status: 'confirmed',
      description: 'Identity verification'
    },
    { 
      id: '0x9i8h7g6f5e4d3c2b1a0z', 
      type: 'sos', 
      timestamp: '2023-11-14 09:15:22', 
      status: 'confirmed',
      description: 'Emergency alert sent'
    },
    { 
      id: '0x5e6f7g8h9i0j1k2l3m4n', 
      type: 'location', 
      timestamp: '2023-11-13 18:45:33', 
      status: 'confirmed',
      description: 'Location check-in'
    },
  ]);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);

  const handleExportData = () => {
    setToast({ message: 'Blockchain data exported successfully!', type: 'success' });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div>
        <h1 className="text-4xl font-black mb-2 text-white">Blockchain Security</h1>
        <p className="text-gray-300 text-lg">Your data secured with blockchain technology</p>
      </div>

      {/* User Blockchain Info */}
      <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-900/50 bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Your Blockchain Identity</h2>
          <Button variant="outline" className="gap-2 border-gray-700 text-gray-300 hover:bg-gray-700" onClick={handleExportData}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg font-mono text-sm break-all text-white border border-gray-600">
          {user?.blockchain_id || 'Not available'}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="font-semibold text-white">Verified Identity</span>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md font-semibold transition-all ${
            activeTab === 'overview' 
              ? 'bg-gray-700 text-white shadow-sm' 
              : 'hover:bg-gray-700 text-gray-300'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-md font-semibold transition-all ${
            activeTab === 'transactions' 
              ? 'bg-gray-700 text-white shadow-sm' 
              : 'hover:bg-gray-700 text-gray-300'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-md font-semibold transition-all ${
            activeTab === 'security' 
              ? 'bg-gray-700 text-white shadow-sm' 
              : 'hover:bg-gray-700 text-gray-300'
          }`}
        >
          Security
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-bold text-lg text-white">Data Integrity</h3>
              </div>
              <p className="text-3xl font-bold mb-2 text-white">100%</p>
              <p className="text-gray-300">All records verified</p>
            </Card>
            
            <Card className="p-6 bg-gray-800 border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-bold text-lg text-white">Security Score</h3>
              </div>
              <p className="text-3xl font-bold mb-2 text-white">A+</p>
              <p className="text-gray-300">High security level</p>
            </Card>
            
            <Card className="p-6 bg-gray-800 border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-bold text-lg text-white">Last Activity</h3>
              </div>
              <p className="text-3xl font-bold mb-2 text-white">2h ago</p>
              <p className="text-gray-300">Location check-in</p>
            </Card>
          </div>

          <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-900/50 bg-gray-800">
            <h3 className="font-bold text-lg mb-4 text-white">Blockchain Benefits</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Immutable Records</h4>
                  <p className="text-gray-300">Your travel data cannot be altered or deleted once recorded</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Decentralized Security</h4>
                  <p className="text-gray-300">No single point of failure with distributed ledger technology</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Privacy Protection</h4>
                  <p className="text-gray-300">Your personal information is encrypted and only accessible with your permission</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Transaction History</h2>
          {transactions.map((tx) => (
            <Card key={tx.id} className="p-5 bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'identity' ? 'bg-blue-500/10' :
                    tx.type === 'sos' ? 'bg-red-500/10' :
                    'bg-green-500/10'
                  }`}>
                    {tx.type === 'identity' ? <User className="w-5 h-5 text-blue-500" /> :
                     tx.type === 'sos' ? <AlertTriangle className="w-5 h-5 text-red-500" /> :
                     <MapPin className="w-5 h-5 text-green-500" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{tx.description}</h3>
                    <p className="text-sm text-gray-400 font-mono">{tx.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{tx.timestamp}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tx.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="font-bold text-lg mb-4 text-white">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-300">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700">Enable</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Biometric Verification</h4>
                  <p className="text-sm text-gray-300">Use fingerprint or face recognition for quick access</p>
                </div>
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700">Setup</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Emergency Contacts</h4>
                  <p className="text-sm text-gray-300">Manage who gets notified during emergencies</p>
                </div>
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700">Manage</Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="font-bold text-lg mb-4 text-white">Privacy Controls</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Location Sharing</h4>
                  <p className="text-sm text-gray-300">Control who can see your location</p>
                </div>
                <select className="p-2 border bg-gray-700 rounded-lg text-white border-gray-600">
                  <option>Emergency Only</option>
                  <option>Trusted Contacts</option>
                  <option>Public</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ==================== PROFILE PAGE ====================
const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    emergencyContact: '',
    bloodGroup: '',
    allergies: '',
    medicalConditions: '',
  });
  const [toast, setToast] = useState(null);

  const handleSaveProfile = () => {
    setToast({ message: 'Profile updated successfully!', type: 'success' });
  };

  const handleLogout = () => {
    setToast({ message: 'Logged out successfully', type: 'success' });
    setTimeout(() => logout(), 1000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div>
        <h1 className="text-4xl font-black mb-2 text-white">My Profile</h1>
        <p className="text-gray-300 text-lg">Manage your personal information and preferences</p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-900/50 bg-gray-800">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-900/20">
            {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            <p className="text-gray-300 mb-2">{user?.email}</p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold">
                {user?.type || 'Tourist'}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-300">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Verified
              </span>
            </div>
          </div>
          <Button variant="outline" className="gap-2 border-gray-700 text-gray-300 hover:bg-gray-700">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </Card>

      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('personal')} className={`px-4 py-2 rounded-md font-semibold transition-all ${activeTab === 'personal' ? 'bg-gray-700 text-white shadow-sm' : 'hover:bg-gray-700 text-gray-300'}`}>Personal Info</button>
        <button onClick={() => setActiveTab('medical')} className={`px-4 py-2 rounded-md font-semibold transition-all ${activeTab === 'medical' ? 'bg-gray-700 text-white shadow-sm' : 'hover:bg-gray-700 text-gray-300'}`}>Medical Info</button>
        <button onClick={() => setActiveTab('security')} className={`px-4 py-2 rounded-md font-semibold transition-all ${activeTab === 'security' ? 'bg-gray-700 text-white shadow-sm' : 'hover:bg-gray-700 text-gray-300'}`}>Security</button>
      </div>

      {activeTab === 'personal' && (
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h3 className="font-bold text-lg mb-4 text-white">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label className="text-gray-200">Full Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-gray-700 border-gray-600 text-white" /></div>
            <div className="space-y-2"><Label className="text-gray-200">Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-gray-700 border-gray-600 text-white" /></div>
            <div className="space-y-2"><Label className="text-gray-200">Phone Number</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-gray-700 border-gray-600 text-white" /></div>
            <div className="space-y-2"><Label className="text-gray-200">Emergency Contact</Label><Input value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} placeholder="Name and phone number" className="bg-gray-700 border-gray-600 text-white" /></div>
          </div>
          <div className="mt-6 flex justify-end"><Button onClick={handleSaveProfile} className="gap-2"><CheckCircle className="w-4 h-4" /> Save Changes</Button></div>
        </Card>
      )}

      {activeTab === 'medical' && (
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h3 className="font-bold text-lg mb-4 text-white">Medical Information</h3>
          <div className="space-y-6">
            <div className="space-y-2"><Label className="text-gray-200">Blood Group</Label>
              <select className="w-full p-2 border bg-gray-700 rounded-lg text-white" value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}>
                <option value="">Select Blood Group</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </div>
            <div className="space-y-2"><Label className="text-gray-200">Allergies</Label><textarea className="w-full p-3 border border-gray-600 bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-white" rows={3} placeholder="List any known allergies..." value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} /></div>
            <div className="space-y-2"><Label className="text-gray-200">Medical Conditions</Label><textarea className="w-full p-3 border border-gray-600 bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-white" rows={3} placeholder="List any chronic medical conditions..." value={formData.medicalConditions} onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })} /></div>
          </div>
          <div className="mt-6 flex justify-end"><Button onClick={handleSaveProfile} className="gap-2"><CheckCircle className="w-4 h-4" /> Save Changes</Button></div>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="font-bold text-lg mb-4 text-white">Change Password</h3>
            <div className="space-y-4">
              <div className="space-y-2"><Label className="text-gray-200">Current Password</Label><Input type="password" className="bg-gray-700 border-gray-600 text-white" /></div>
              <div className="space-y-2"><Label className="text-gray-200">New Password</Label><Input type="password" className="bg-gray-700 border-gray-600 text-white" /></div>
              <div className="space-y-2"><Label className="text-gray-200">Confirm New Password</Label><Input type="password" className="bg-gray-700 border-gray-600 text-white" /></div>
            </div>
            <div className="mt-6 flex justify-end"><Button className="gap-2"><Lock className="w-4 h-4" /> Update Password</Button></div>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="font-bold text-lg mb-4 text-white">Danger Zone</h3>
            <div className="flex items-center justify-between">
              <div><p className="font-semibold text-white">Delete Account</p><p className="text-sm text-gray-300">Permanently delete your account and all data</p></div>
              <Button variant="destructive" onClick={handleLogout}>Logout</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ==================== STATIC PAGES ====================
const AboutPage = () => (
  <div className="p-6 md:p-8 space-y-8 animate-fade-in">
    <div>
      <h1 className="text-4xl font-black mb-2 text-white">About Suraksha</h1>
      <p className="text-gray-300 text-lg">Your trusted travel companion in Northeast India</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Our Mission</h2>
        <p className="text-gray-300">
          Suraksha is dedicated to ensuring the safety and security of travelers exploring the beautiful landscapes of Northeast India. 
          We leverage cutting-edge technology, including blockchain, to provide real-time assistance, emergency services, and reliable information.
        </p>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Our Vision</h2>
        <p className="text-gray-300">
          We envision a future where every traveler can explore Northeast India with confidence, knowing that help is just a tap away. 
          Our goal is to make the region one of the safest tourist destinations in the world.
        </p>
      </div>
    </div>

    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Our Values</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gray-800 border-gray-700">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-white">Safety First</h3>
          <p className="text-gray-300">Every feature and service is designed with traveler safety as the top priority.</p>
        </Card>
        <Card className="p-6 bg-gray-800 border-gray-700">
          <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-white">Community</h3>
          <p className="text-gray-300">We believe in the power of local communities and their role in ensuring traveler safety.</p>
        </Card>
        <Card className="p-6 bg-gray-800 border-gray-700">
          <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-white">Innovation</h3>
          <p className="text-gray-300">We continuously evolve our technology to address emerging safety challenges.</p>
        </Card>
      </div>
    </div>

    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Our Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center bg-gray-800 border-gray-700">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-900/20">
            NC
          </div>
          <h3 className="font-bold text-lg text-white">Nishant Chourasiya</h3>
          <p className="text-gray-300">CEO & Co-Founder</p>
        </Card>
        <Card className="p-6 text-center bg-gray-800 border-gray-700">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-900/20">
            PG
          </div>
          <h3 className="font-bold text-lg text-white">Prince Gupta</h3>
          <p className="text-gray-300">CTO</p>
        </Card>
        <Card className="p-6 text-center bg-gray-800 border-gray-700">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-red-900/20">
            PW
          </div>
          <h3 className="font-bold text-lg text-white">Pratmesh Wani</h3>
          <p className="text-gray-300">CPO</p>
        </Card>
        <Card className="p-6 text-center bg-gray-800 border-gray-700">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-red-900/20">
            PS
          </div>
          <h3 className="font-bold text-lg text-white">Prateek Sahu</h3>
          <p className="text-gray-300">CFO</p>
        </Card>
        <Card className="p-6 text-center bg-gray-800 border-gray-700">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-red-900/20">
            DA
          </div>
          <h3 className="font-bold text-lg text-white">Deepak Adlak</h3>
          <p className="text-gray-300">CMO</p>
        </Card>
      </div>
    </div>
  </div>
);

const ContactPage = () => (
  <div className="p-6 md:p-8 space-y-8 animate-fade-in">
    <div>
      <h1 className="text-4xl font-black mb-2 text-white">Contact Us</h1>
      <p className="text-gray-300 text-lg">We are here to help you 24/7</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="p-6 bg-gray-800 border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Get in Touch</h2>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input placeholder="Your Name" className="bg-gray-700 border-gray-600 text-white" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input placeholder="your@email.com" className="bg-gray-700 border-gray-600 text-white" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <textarea className="w-full p-3 border border-gray-600 bg-gray-700 rounded-lg text-white h-32" placeholder="How can we help?"></textarea>
          </div>
          <Button className="w-full">Send Message</Button>
        </form>
      </Card>
      <div className="space-y-6">
        <Card className="p-6 bg-gray-800 border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-white">Email Us</h3>
              <p className="text-gray-300">support@suraksha.com</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gray-800 border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-white">Call Us</h3>
              <p className="text-gray-300">+91 123 456 7890</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
);

const SupportPage = () => (
  <div className="p-6 md:p-8 space-y-8 animate-fade-in">
    <h1 className="text-4xl font-black mb-2 text-white">Support Center</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {['Account Issues', 'Payment Queries', 'App Guide'].map((item, i) => (
        <Card key={i} className="p-6 bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-all">
          <HelpCircle className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{item}</h3>
          <p className="text-gray-400">Get help with {item.toLowerCase()} and related questions.</p>
        </Card>
      ))}
    </div>
  </div>
);

const TermsPage = () => (
  <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-4xl">
    <h1 className="text-4xl font-black mb-6 text-white">Terms of Service</h1>
    <Card className="p-8 bg-gray-800 border-gray-700 space-y-4 text-gray-300">
      <p>Last updated: November 2025</p>
      <h3 className="text-xl font-bold text-white">1. Acceptance of Terms</h3>
      <p>By accessing and using Suraksha, you accept and agree to be bound by the terms and provision of this agreement.</p>
      <h3 className="text-xl font-bold text-white">2. User Conduct</h3>
      <p>Users agree to use the SOS features responsibly. False alarms may result in account suspension.</p>
    </Card>
  </div>
);

const PrivacyPage = () => (
  <div className="p-6 md:p-8 space-y-6 animate-fade-in max-w-4xl">
    <h1 className="text-4xl font-black mb-6 text-white">Privacy Policy</h1>
    <Card className="p-8 bg-gray-800 border-gray-700 space-y-4 text-gray-300">
      <p>Your privacy is important to us. It is Suraksha's policy to respect your privacy regarding any information we may collect.</p>
      <h3 className="text-xl font-bold text-white">Data Encryption</h3>
      <p>All personal data, including location history and medical records, is encrypted using blockchain technology.</p>
    </Card>
  </div>
);

// ==================== MAIN APP ====================
const App = () => {
  const { user, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global Data States
  const [weather, setWeather] = useState(null);
  const [sosHistory, setSosHistory] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // 1. Instant Clock: Updates every second
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // 2. High-Priority Data Fetching
  useEffect(() => {
    if (user) {
      // PRIORITY 1: Weather (Trigger GPS immediately)
      const fetchWeather = async () => {
        if (!navigator.geolocation) {
          console.warn("Geolocation not supported by browser");
          const fallback = await getWeather(23.25, 77.41);
          setWeather(fallback);
          return;
        }

        console.log("📍 Requesting GPS location for weather...");

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            console.log("✅ GPS success:", pos.coords.latitude, pos.coords.longitude);
            try {
              const data = await getWeather(pos.coords.latitude, pos.coords.longitude);
              setWeather(data);
            } catch (err) {
              console.error("❌ Weather API error:", err);
            }
          },
          async (error) => {
            console.warn("⚠️ GPS error/denied:", error.message);
            // Immediate fallback so the UI doesn't hang
            const data = await getWeather(23.25, 77.41); 
            setWeather(data);
          },
          { 
            timeout: 5000,           // Force failure after 5 seconds
            enableHighAccuracy: false // Uses Wi-Fi/Cell towers (much faster than GPS satellites)
          }
        );
      };
      
      // PRIORITY 2: SOS History (Non-blocking)
      const fetchHistory = async () => {
        try {
          const data = await getSOSHistory();
          setSosHistory(data || []);
        } catch (err) { console.error("History error", err); }
      };

      fetchWeather();
      fetchHistory(); // Fires in parallel
    }
  }, [user]);

  // Function to handle SOS trigger
  const handleTriggerSOS = async () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch("https://suraksha-a74u.onrender.com/api/sos/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              latitude,
              longitude,
              message: "Emergency triggered from Dashboard",
              contacts: []
            })
          });

          if (!response.ok) {
            throw new Error("Failed to send SOS");
          }

          const data = await response.json();
          console.log("SOS sent successfully:", data);
          
          // Refresh history after sending
          const newHistory = await getSOSHistory();
          setSosHistory(newHistory);
        } catch (error) {
          console.error("Error sending SOS:", error);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  };

  // 1. PHASE ONE: Full Screen Loading Animation
  if (authLoading) {
    return <IntroAnimation fastMode={false} />;
  }

  // 2. PHASE TWO: Split Screen (Guest Experience)
  if (!user) {
    const authPage = currentPage === 'register' ? 'register' : 
                     currentPage === 'forgot' ? 'forgot' : 'login';
    
    return (
      <div className="flex min-h-screen w-full bg-[#020817] text-white overflow-hidden">
        <style>{`
          html, body, #root { background-color: #020817; color: white; margin: 0; padding: 0; }
          .scrollbar-none::-webkit-scrollbar { display: none; }
        `}</style>
        <div className="hidden md:flex md:w-1/2 bg-[#020817] relative items-center justify-center overflow-hidden border-r border-gray-700">
           <IntroAnimation fastMode={true} />
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-900">
           <div className="w-full max-w-md animate-fade-in">
             {authPage === 'login' && <LoginPage onNavigate={setCurrentPage} />}
             {authPage === 'register' && <RegisterPage onNavigate={setCurrentPage} />}
             {authPage === 'forgot' && <ForgotPasswordPage onNavigate={setCurrentPage} />}
           </div>
        </div>
      </div>
    );
  }

  // 3. PHASE THREE: Dashboard Logic (Injected with fetched data)
  const renderPage = () => {
    // Props passed down to components so they don't have to fetch themselves
    const dashboardProps = { 
      weatherData: weather, 
      currentDateTime, 
      sosHistory,
      onTriggerSOS: handleTriggerSOS
    };

    switch(currentPage) {
      case 'dashboard': return <DashboardPage {...dashboardProps} />;
      case 'map': return <MapPage />;
      case 'sos': return <SOSPage />;
      case 'services': return <ServicesPage />;
      case 'guides': return <GuidesPage />;
      case 'chat': return <ChatPage />;
      case 'blockchain': return <BlockchainPage />;
      case 'profile': return <ProfilePage />;
      case 'about': return <AboutPage />;
      case 'contact': return <ContactPage />;
      case 'support': return <SupportPage />;
      case 'privacy': return <PrivacyPage />;
      case 'terms': return <TermsPage />;
      default: return <DashboardPage {...dashboardProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <style>{`
          html, body, #root { background-color: #111827; color: white; }
      `}</style>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex w-full fixed top-[73px] bottom-0"> 
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <main className="flex-1 overflow-y-auto bg-gray-900 pb-20 w-full scrollbar-none">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;