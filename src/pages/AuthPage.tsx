import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Castle, Sparkles, Wand2, BookOpen, ShieldCheck, Sword, ScrollText } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle welcome screen transition after registration
  // In a real app, we'd trigger this from the RegisterForm success
  // For now, let's add a listener or just provide the component
  
  const WelcomeScreen = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-12 py-12"
    >
      <div className="relative inline-block">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-40px] border border-dashed border-gold/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-60px] border border-dotted border-gold/10 rounded-full"
        />
        <div className="relative z-10 w-32 h-32 bg-mythos-card rounded-full flex items-center justify-center border-2 border-gold/40 shadow-[0_0_60px_rgba(197,160,89,0.3)]">
          <ShieldCheck size={64} className="text-gold animate-pulse" />
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-4xl md:text-5xl font-cinzel text-gold-gradient font-black tracking-[0.2em] uppercase">
          Bem-vindo, Herói
        </h2>
        <p className="text-gold/60 font-cinzel italic text-lg max-w-md mx-auto leading-relaxed">
          "Seu nome foi inscrito com sangue e ouro no Grimório Eterno. O destino de Mythos agora repousa em suas mãos."
        </p>
      </div>

      <div className="max-w-xs mx-auto pt-4">
        <button
          onClick={() => navigate('/select-profile')}
          className="btn-premium btn-premium-gold w-full h-16 group"
        >
          <Sword size={20} className="group-hover:rotate-45 transition-transform duration-500" />
          <span className="tracking-[0.3em]">Iniciar Jornada</span>
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen w-full bg-mythos-bg overflow-hidden flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-arcane/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        <div className="animate-mist absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        
        {/* Floating Particles */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: Math.random() * 0.4
            }}
            animate={{ 
              y: [null, "-30%"],
              opacity: [null, 0]
            }}
            transition={{ 
              duration: Math.random() * 15 + 15, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute w-1 h-1 bg-gold/40 rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* Main Column Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[400px] mx-auto z-10 transition-all duration-300"
      >
        {/* Responsive Mobile-First Form Container */}
        <div className="w-full md:glass-card relative p-2 sm:p-4 md:p-10 border-0 md:bg-mythos-bg md:border md:border-gold/15 rounded-none md:rounded-3xl shadow-none overflow-hidden">
          
          {/* Top Brand Header (Logo, Name, Screen Title, Quote) - Spacious & Breathing spacing */}
          {!showWelcome && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-9 select-none relative z-10 transition-all">
              {/* Logo pequeno e elegante */}
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-gold/10 bg-black/30"
              >
                <BookOpen size={14} className="text-gold/70" />
              </motion.div>
              
              {/* REALMOR */}
              <h1 className="text-xl font-cinzel text-gold-gradient font-black tracking-[0.35em] uppercase leading-none">
                REALMOR
              </h1>

              {/* Subtle visual spacing divider */}
              <div className="w-5 h-[1px] bg-gold/15" />

              {/* Dynamic Screen Title & Quote */}
              <div className="space-y-1.5 animate-in fade-in duration-500">
                <h2 className="text-xs font-cinzel text-gold/80 font-bold tracking-[0.25em] uppercase">
                  {isLogin ? "Acessar o Codex" : "Inscrição no Grimório"}
                </h2>
                <p className="text-[10px] text-gold/45 font-sans italic tracking-wide max-w-[280px] sm:max-w-none mx-auto leading-tight">
                  {isLogin 
                    ? '"Que os deuses guiem sua jornada através das páginas do destino"' 
                    : '"Seu nome será gravado eternamente nos anais da história"'
                  }
                </p>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {showWelcome ? (
              <WelcomeScreen key="welcome" />
            ) : (
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10"
              >
                {isLogin ? (
                  <LoginForm onToggle={() => setIsLogin(false)} />
                ) : (
                  <RegisterForm onSuccess={() => setShowWelcome(true)} onToggle={() => setIsLogin(true)} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

