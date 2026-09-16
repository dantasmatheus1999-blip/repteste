import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, History, Trash2, Zap, Trophy, AlertCircle } from 'lucide-react';
import { Button } from '../../Button';
import { Card } from '../../Card';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
type AnimationType = 'classic' | 'arcane-drop' | 'mystic-explosion' | 'fast-spin' | 'master-invocation' | 'random';

interface RollResult {
  id: string;
  type: DiceType;
  value: number;
  timestamp: number;
  isCritical: boolean;
  isFumble: boolean;
}

export const DiceRollerPanel: React.FC = () => {
  const [isRolling, setIsRolling] = useState(false);
  const [currentResult, setCurrentResult] = useState<RollResult | null>(null);
  const [history, setHistory] = useState<RollResult[]>([]);
  const [selectedDice, setSelectedDice] = useState<DiceType>('d20');
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType>(() => {
    return (localStorage.getItem('dice-animation-pref') as AnimationType) || 'classic';
  });
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>('classic');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    localStorage.setItem('dice-animation-pref', selectedAnimation);
  }, [selectedAnimation]);

  const rollDice = useCallback((type: DiceType) => {
    if (isRolling) return;
    
    // Handle random animation
    const animToUse = selectedAnimation === 'random' 
      ? (['classic', 'arcane-drop', 'mystic-explosion', 'fast-spin', 'master-invocation'] as AnimationType[])[Math.floor(Math.random() * 5)]
      : selectedAnimation;
    
    setCurrentAnimation(animToUse);
    setIsRolling(true);
    setCurrentResult(null);
    setShake(false);

    // Simulate rolling time
    const rollDuration = 1500;
    
    setTimeout(() => {
      const sides = parseInt(type.substring(1));
      const value = Math.floor(Math.random() * sides) + 1;
      
      const result: RollResult = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        value,
        timestamp: Date.now(),
        isCritical: type === 'd20' && value === 20,
        isFumble: type === 'd20' && value === 1,
      };

      setCurrentResult(result);
      setHistory(prev => [result, ...prev].slice(0, 20));
      setIsRolling(false);
      
      if (result.isCritical || result.isFumble) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }, rollDuration);
  }, [isRolling]);

  const clearHistory = () => setHistory([]);

  const diceOptions: { type: DiceType; label: string }[] = [
    { type: 'd4', label: 'D4' },
    { type: 'd6', label: 'D6' },
    { type: 'd8', label: 'D8' },
    { type: 'd10', label: 'D10' },
    { type: 'd12', label: 'D12' },
    { type: 'd20', label: 'D20' },
    { type: 'd100', label: 'D100' },
  ];

  const animationOptions: { type: AnimationType; label: string; description: string }[] = [
    { type: 'classic', label: 'Clássica', description: 'Rolagem tradicional de mesa' },
    { type: 'arcane-drop', label: 'Queda Arcana', description: 'Cai das alturas com magia' },
    { type: 'mystic-explosion', label: 'Explosão', description: 'Surge em energia mística' },
    { type: 'fast-spin', label: 'Giro Rápido', description: 'Rotação intensa no eixo' },
    { type: 'master-invocation', label: 'Invocação', description: 'Conjurado pelo mestre' },
    { type: 'random', label: 'Aleatória', description: 'Surpreenda-se a cada rolagem' },
  ];

  return (
    <motion.div 
      animate={shake ? {
        x: [0, -10, 10, -10, 10, 0],
        y: [0, 5, -5, 5, -5, 0]
      } : {}}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 sm:p-8 max-w-6xl mx-auto"
    >
      {/* Main Roller Area */}
      <div className="lg:col-span-8 space-y-8">
        <div className="flex items-center justify-between border-b border-gold/10 pb-4">
          <h2 className="text-3xl font-cinzel text-gold tracking-widest uppercase font-black">
            Mesa de Dados
          </h2>
          <div className="flex gap-2">
            {diceOptions.map((dice) => (
              <button
                key={dice.type}
                onClick={() => setSelectedDice(dice.type)}
                className={`px-3 py-1 text-[10px] font-black tracking-tighter uppercase transition-all border ${
                  selectedDice === dice.type 
                    ? 'bg-gold text-black border-gold' 
                    : 'bg-gold/5 text-gold/40 border-gold/10 hover:border-gold/30'
                }`}
              >
                {dice.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative aspect-video sm:aspect-[21/9] bg-black/40 border border-gold/10 rounded-sm overflow-hidden flex items-center justify-center group">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-gold" />
            <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-gold" />
            <div className="absolute bottom-0 left-0 w-32 h-32 border-l border-b border-gold" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-gold" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border border-gold/20 rounded-full rotate-45" />
              <div className="absolute w-48 h-48 border border-gold/10 rounded-full -rotate-12" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isRolling ? (
              <DiceAnimation key="rolling" type={selectedDice} animationType={currentAnimation} />
            ) : currentResult ? (
              <motion.div
                key="result"
                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="text-center space-y-4 z-10"
              >
                <div className="relative inline-block">
                  <motion.div
                    animate={currentResult.isCritical ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0],
                      filter: ["drop-shadow(0 0 0px #D4AF37)", "drop-shadow(0 0 20px #D4AF37)", "drop-shadow(0 0 0px #D4AF37)"]
                    } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`text-8xl sm:text-9xl font-cinzel font-black ${
                      currentResult.isCritical ? 'text-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 
                      currentResult.isFumble ? 'text-red-600' : 'text-gold/80'
                    }`}
                  >
                    {currentResult.value}
                  </motion.div>
                  
                  {currentResult.isCritical && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 text-gold font-black tracking-[0.3em] uppercase text-xs whitespace-nowrap"
                    >
                      <Trophy size={16} className="inline mr-2" /> Crítico!
                    </motion.div>
                  )}
                  
                  {currentResult.isFumble && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 text-red-500 font-black tracking-[0.3em] uppercase text-xs whitespace-nowrap"
                    >
                      <AlertCircle size={16} className="inline mr-2" /> Falha Crítica!
                    </motion.div>
                  )}
                </div>
                
                <p className="text-gold/40 uppercase font-black tracking-[0.5em] text-[10px]">
                  Resultado Final
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6 z-10"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto border-2 border-gold/20 rounded-full flex items-center justify-center bg-gold/5 group-hover:border-gold/40 transition-colors">
                  <Dices size={48} className="text-gold/20 group-hover:text-gold/60 transition-colors" />
                </div>
                <p className="text-gold/40 font-cinzel italic text-sm">
                  Pronto para desafiar o destino?
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Roll Button Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <Button
              size="lg"
              onClick={() => rollDice(selectedDice)}
              disabled={isRolling}
              icon={Zap}
              className="shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] transition-all px-12"
            >
              Rolar {selectedDice.toUpperCase()}
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar: History & Animation Selector */}
      <div className="lg:col-span-4 space-y-8">
        {/* Animation Selector */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gold/10 pb-2">
            <Zap size={16} className="text-gold" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gold/60">Estilo de Animação</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {animationOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setSelectedAnimation(opt.type)}
                className={`flex flex-col items-start p-2 rounded-sm border transition-all text-left group ${
                  selectedAnimation === opt.type
                    ? 'bg-gold/10 border-gold shadow-[0_0_10px_rgba(212,175,55,0.1)]'
                    : 'bg-black/40 border-gold/10 hover:border-gold/30'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-tighter ${
                  selectedAnimation === opt.type ? 'text-gold' : 'text-gold/40 group-hover:text-gold/60'
                }`}>
                  {opt.label}
                </span>
                <span className="text-[8px] text-gold/20 leading-tight mt-1 line-clamp-1">
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gold/10 pb-4">
            <h3 className="text-xl font-cinzel text-gold/60 tracking-widest uppercase font-bold flex items-center gap-2">
              <History size={18} /> Histórico
            </h3>
          <button 
            onClick={clearHistory}
            className="text-gold/20 hover:text-red-500 transition-colors"
            title="Limpar Histórico"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence initial={false}>
            {history.length === 0 ? (
              <p className="text-gold/20 italic text-center py-8 text-sm">Nenhuma rolagem ainda.</p>
            ) : (
              history.map((roll) => (
                <motion.div
                  key={roll.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex items-center justify-between p-4 rounded-sm bg-black/40 border transition-all ${
                    roll.isCritical ? 'border-gold/40 bg-gold/5' : 
                    roll.isFumble ? 'border-red-900/40 bg-red-900/5' : 'border-gold/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-sm border flex items-center justify-center font-cinzel font-black text-lg ${
                      roll.isCritical ? 'bg-gold text-black border-gold' : 
                      roll.isFumble ? 'bg-red-600 text-white border-red-600' : 'bg-gold/10 text-gold border-gold/20'
                    }`}>
                      {roll.value}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-gold/60 tracking-widest">
                        {roll.type.toUpperCase()}
                      </p>
                      <p className="text-[8px] text-gold/20">
                        {new Date(roll.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {roll.isCritical && <Trophy size={14} className="text-gold" />}
                  {roll.isFumble && <AlertCircle size={14} className="text-red-500" />}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  </motion.div>
);
};

const DiceAnimation: React.FC<{ type: DiceType; animationType: AnimationType }> = ({ type, animationType }) => {
  const renderDiceShape = () => {
    switch (type) {
      case 'd4':
        return (
          <svg width="100" height="100" viewBox="0 0 100 100">
            <path d="M50 10 L90 80 L10 80 Z" fill="rgba(0,0,0,0.8)" stroke="#D4AF37" strokeWidth="2" />
            <path d="M50 10 L50 80" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            <path d="M10 80 L50 45 L90 80" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
          </svg>
        );
      case 'd6':
        return (
          <svg width="100" height="100" viewBox="0 0 100 100">
            <rect x="15" y="15" width="70" height="70" fill="rgba(0,0,0,0.8)" stroke="#D4AF37" strokeWidth="2" rx="4" />
            <path d="M15 15 L35 35 L85 35 L65 15 Z" fill="rgba(212,175,55,0.1)" stroke="#D4AF37" strokeWidth="1" />
            <path d="M85 35 L85 85 L65 65 L65 15" fill="rgba(212,175,55,0.05)" stroke="#D4AF37" strokeWidth="1" />
          </svg>
        );
      case 'd8':
        return (
          <svg width="100" height="100" viewBox="0 0 100 100">
            <path d="M50 5 L90 50 L50 95 L10 50 Z" fill="rgba(0,0,0,0.8)" stroke="#D4AF37" strokeWidth="2" />
            <path d="M10 50 L90 50" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            <path d="M50 5 L50 95" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
          </svg>
        );
      case 'd10':
      case 'd100':
        return (
          <svg width="100" height="100" viewBox="0 0 100 100">
            <path d="M50 5 L85 40 L50 95 L15 40 Z" fill="rgba(0,0,0,0.8)" stroke="#D4AF37" strokeWidth="2" />
            <path d="M15 40 L85 40" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            <path d="M50 5 L50 95" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            <path d="M15 40 L50 60 L85 40" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
          </svg>
        );
      case 'd12':
        return (
          <svg width="100" height="100" viewBox="0 0 100 100">
            <path d="M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z" fill="rgba(0,0,0,0.8)" stroke="#D4AF37" strokeWidth="2" />
            <path d="M50 30 L85 25 M50 30 L15 25 M50 30 L50 5" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            <path d="M50 70 L85 75 M50 70 L15 75 M50 70 L50 95" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            <path d="M50 30 L50 70" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
          </svg>
        );
      case 'd20':
      default:
        return (
          <svg width="120" height="120" viewBox="0 0 100 100" className="drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            <path
              d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z"
              fill="rgba(0,0,0,0.8)"
              stroke="#D4AF37"
              strokeWidth="2"
            />
            <path d="M50 5 L50 95" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            <path d="M5 25 L95 25" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            <path d="M5 75 L95 75" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            <path d="M50 5 L5 25" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            <path d="M50 5 L95 25" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            <path d="M5 75 L50 95" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            <path d="M95 75 L50 95" stroke="#D4AF37" strokeWidth="1" opacity="0.3" />
            
            <path d="M50 5 L25 40 L75 40 Z" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
            <path d="M25 40 L5 25" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
            <path d="M75 40 L95 25" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
            <path d="M25 40 L25 70" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
            <path d="M75 40 L75 70" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
            <path d="M25 70 L50 95 L75 70 Z" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.5" />
          </svg>
        );
    }
  };

  const getAnimationVariants = () => {
    switch (animationType) {
      case 'arcane-drop':
        return {
          animate: {
            rotateX: [0, 360, 720, 1080],
            rotateY: [0, 360, 720, 1080],
            rotateZ: [0, 180, 360, 540],
            scale: [0.2, 1.5, 0.8, 1.1, 1],
            y: [-400, 0, -50, 20, 0],
            opacity: [0, 1, 1, 1, 1],
            filter: [
              "drop-shadow(0 0 0px #D4AF37)",
              "drop-shadow(0 0 50px #D4AF37)",
              "drop-shadow(0 0 10px #D4AF37)",
              "drop-shadow(0 0 20px #D4AF37)",
              "drop-shadow(0 0 0px #D4AF37)"
            ]
          },
          transition: { duration: 1.5, ease: "backOut" as any }
        };
      case 'mystic-explosion':
        return {
          animate: {
            rotateX: [0, 1080, 2160],
            rotateY: [0, 1080, 2160],
            rotateZ: [0, 720, 1440],
            scale: [0, 2.5, 1],
            opacity: [0, 1, 1],
            filter: [
              "drop-shadow(0 0 0px #D4AF37)",
              "drop-shadow(0 0 100px #D4AF37)",
              "drop-shadow(0 0 0px #D4AF37)"
            ]
          },
          transition: { duration: 1.2, ease: "circOut" as any }
        };
      case 'fast-spin':
        return {
          animate: {
            rotateZ: [0, 1440, 2880],
            rotateX: [0, 720, 1440],
            scale: [1, 1.4, 1],
            filter: [
              "drop-shadow(0 0 0px #D4AF37)",
              "drop-shadow(0 0 40px #D4AF37)",
              "drop-shadow(0 0 0px #D4AF37)"
            ]
          },
          transition: { duration: 1.5, ease: "easeInOut" as any }
        };
      case 'master-invocation':
        return {
          animate: {
            rotateY: [0, 180, 360, 540, 720],
            scale: [0.5, 1.2, 1],
            opacity: [0, 1, 1],
            y: [20, -10, 0],
            filter: [
              "drop-shadow(0 0 0px #D4AF37)",
              "drop-shadow(0 0 60px #D4AF37)",
              "drop-shadow(0 0 0px #D4AF37)"
            ]
          },
          transition: { duration: 1.8, ease: "anticipate" as any }
        };
      case 'classic':
      default:
        return {
          animate: {
            rotateX: [0, 720, 1440, 2160],
            rotateY: [0, 1080, 2160, 3240],
            rotateZ: [0, 360, 720, 1080],
            scale: [0.5, 1.3, 0.7, 1.1, 1],
            y: [100, -80, 40, -20, 0],
            x: [-200, 100, -30, 20, 0],
            filter: [
              "drop-shadow(0 0 0px #D4AF37)",
              "drop-shadow(0 0 30px #D4AF37)",
              "drop-shadow(0 0 10px #D4AF37)",
              "drop-shadow(0 0 40px #D4AF37)",
              "drop-shadow(0 0 0px #D4AF37)"
            ]
          },
          transition: { duration: 1.5, ease: "circOut" as any }
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.1, 0.4, 0.1],
        }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="absolute inset-0 bg-gold/10 rounded-full blur-[60px]"
      />

      <motion.div
        animate={variants.animate}
        transition={variants.transition}
        className="relative z-10"
      >
        {renderDiceShape()}
        
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0, 1, 0] }}
          transition={{ duration: 1.5 }}
        >
          <span className="text-2xl font-cinzel font-black text-gold drop-shadow-md">?</span>
        </motion.div>
      </motion.div>

      {/* Decorative Runes for Invocation */}
      {animationType === 'master-invocation' && (
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: [0, 0.3, 0], rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 border border-dashed border-gold/40 rounded-full"
        />
      )}

      {/* Energy Ring for Explosion */}
      {animationType === 'mystic-explosion' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 2], opacity: [0, 0.5, 0] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute inset-0 border-4 border-gold rounded-full blur-sm"
        />
      )}

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.5, 0],
              x: (Math.random() - 0.5) * 300,
              y: (Math.random() - 0.5) * 300,
              opacity: [0, 0.8, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 1.2,
              delay: Math.random() * 0.4,
              repeat: Infinity,
            }}
            className="absolute top-1/2 left-1/2 w-1 h-1 bg-gold rounded-full shadow-[0_0_10px_#D4AF37]"
          />
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1.5] }}
        transition={{ duration: 0.5, delay: 1.4 }}
        className="absolute inset-0 border-2 border-gold/30 rounded-full"
      />
    </div>
  );
};
