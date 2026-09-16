import React from 'react';
import { motion } from 'motion/react';
import { ScrollText, Sparkles, ChevronRight, Castle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const WelcomePage: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-mythos-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-gold/5 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center space-y-12">
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, duration: 1 }}
            className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-mythos-card border-4 border-gold shadow-[0_0_50px_rgba(212,175,55,0.4)] relative"
          >
            <ScrollText size={64} className="text-gold" />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-gold/30"
            />
            <Sparkles size={32} className="absolute -top-4 -right-4 text-gold animate-pulse" />
          </motion.div>

          {/* Welcome Message */}
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl sm:text-6xl font-cinzel text-gold-gradient font-black tracking-[0.1em] uppercase leading-tight"
            >
              Seu nome foi inscrito no Grimório
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="space-y-4"
            >
              <p className="text-xl sm:text-2xl font-cinzel text-gold/60 italic leading-relaxed">
                "O REALMOR reconhece sua presença, <span className="text-gold font-bold not-italic">{profile?.name || 'Herói'}</span>. Sua jornada começa agora."
              </p>
              <div className="h-px w-32 bg-gold/20 mx-auto" />
            </motion.div>
          </div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="flex justify-center"
          >
            <Link to="/">
              <Button
                size="lg"
                className="px-16 py-8 text-2xl font-cinzel tracking-widest shadow-[0_0_40px_rgba(212,175,55,0.2)] group"
                icon={ChevronRight}
              >
                Entrar no Codex
              </Button>
            </Link>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 2.5, duration: 2 }}
            className="flex justify-center gap-12 pt-12"
          >
            <Castle size={24} className="text-gold/40" />
            <Sparkles size={24} className="text-gold/40" />
            <ScrollText size={24} className="text-gold/40" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
