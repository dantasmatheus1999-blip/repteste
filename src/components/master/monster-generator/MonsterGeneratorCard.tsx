import React, { useState, useEffect } from 'react';
import { Sword, RefreshCw, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MonsterGeneratorService, GeneratedMonster } from '../../../services/monsterGeneratorService';
import { MonsterRole, MonsterRank, CreatureType } from '../../../constants/monsterData';
import { GeneratedMonsterSheet } from './GeneratedMonsterSheet';

interface MonsterGeneratorCardProps {
  onSave?: (monster: GeneratedMonster) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const MonsterGeneratorCard: React.FC<MonsterGeneratorCardProps> = ({ 
  onSave, 
  onClose,
  isModal = false 
}) => {
  const [generatedMonster, setGeneratedMonster] = useState<GeneratedMonster | null>(null);
  const [loading, setLoading] = useState(false);

  // Generator Filters State (Configuração do Modo Avançado como padrão e único)
  const [nd, setNd] = useState('1');
  const [role, setRole] = useState<MonsterRole>('bruto');
  const [type, setType] = useState<CreatureType>('monstro');
  const [rank, setRank] = useState<MonsterRank>('normal');
  const [environment, setEnvironment] = useState('floresta');
  const [theme, setTheme] = useState('sombra');

  // Suporte a tecla ESC para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const monster = MonsterGeneratorService.generate({
        nd, 
        role, 
        type, 
        rank, 
        environment, 
        theme
      });
      setGeneratedMonster(monster);
      setLoading(false);
    }, 350);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {!generatedMonster ? (
          <motion.div
            key="generator-form"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl bg-stone-950/95 border-2 border-amber-600/50 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.85)] backdrop-blur-md overflow-hidden flex flex-col select-none"
          >
            {/* Header Compacto */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border-b border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sword size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-cinzel font-black uppercase tracking-widest text-amber-300 flex items-center gap-2">
                    Gerar Monstro
                  </h3>
                  <p className="text-[10px] text-stone-400 font-cinzel italic">
                    Parâmetros e Regras de Tormenta 20
                  </p>
                </div>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-md text-stone-400 hover:text-amber-200 hover:bg-stone-800 transition-colors"
                  title="Fechar (ESC)"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Grid Compacto de Parâmetros */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* ND */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    Nível de Desafio
                  </label>
                  <select 
                    value={nd} 
                    onChange={(e) => setNd(e.target.value)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    {['1/4', '1/2', '1', '2', '3', '4', '5', '7', '10', '15', '20'].map(val => (
                      <option key={val} value={val} className="bg-stone-900 text-amber-100">ND {val}</option>
                    ))}
                  </select>
                </div>

                {/* Função */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    Função
                  </label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as MonsterRole)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    <option value="bruto" className="bg-stone-900 text-amber-100">Bruto</option>
                    <option value="emboscador" className="bg-stone-900 text-amber-100">Emboscador</option>
                    <option value="controlador" className="bg-stone-900 text-amber-100">Controlador</option>
                    <option value="conjurador" className="bg-stone-900 text-amber-100">Conjurador</option>
                    <option value="tanque" className="bg-stone-900 text-amber-100">Tanque</option>
                    <option value="especialista" className="bg-stone-900 text-amber-100">Especialista</option>
                  </select>
                </div>

                {/* Tipo de Criatura */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    Tipo de Criatura
                  </label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as CreatureType)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    <option value="animal" className="bg-stone-900 text-amber-100">Animal</option>
                    <option value="besta" className="bg-stone-900 text-amber-100">Besta</option>
                    <option value="construto" className="bg-stone-900 text-amber-100">Construto</option>
                    <option value="demônio" className="bg-stone-900 text-amber-100">Demônio</option>
                    <option value="espírito" className="bg-stone-900 text-amber-100">Espírito</option>
                    <option value="humanoide" className="bg-stone-900 text-amber-100">Humanoide</option>
                    <option value="monstro" className="bg-stone-900 text-amber-100">Monstro</option>
                    <option value="morto-vivo" className="bg-stone-900 text-amber-100">Morto-Vivo</option>
                    <option value="planta" className="bg-stone-900 text-amber-100">Planta</option>
                  </select>
                </div>

                {/* Rank */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    Rank
                  </label>
                  <select 
                    value={rank} 
                    onChange={(e) => setRank(e.target.value as MonsterRank)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    <option value="normal" className="bg-stone-900 text-amber-100">Normal</option>
                    <option value="elite" className="bg-stone-900 text-amber-100">Elite</option>
                    <option value="chefe" className="bg-stone-900 text-amber-100">Chefe</option>
                  </select>
                </div>

                {/* Ambiente */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    Ambiente
                  </label>
                  <select 
                    value={environment} 
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    <option value="floresta" className="bg-stone-900 text-amber-100">Floresta</option>
                    <option value="pântano" className="bg-stone-900 text-amber-100">Pântano</option>
                    <option value="montanha" className="bg-stone-900 text-amber-100">Montanha</option>
                    <option value="caverna" className="bg-stone-900 text-amber-100">Caverna</option>
                    <option value="ruínas" className="bg-stone-900 text-amber-100">Ruínas</option>
                    <option value="deserto" className="bg-stone-900 text-amber-100">Deserto</option>
                    <option value="cidade" className="bg-stone-900 text-amber-100">Cidade</option>
                    <option value="mar" className="bg-stone-900 text-amber-100">Mar</option>
                  </select>
                </div>

                {/* Tema */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    Tema
                  </label>
                  <select 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    <option value="sombra" className="bg-stone-900 text-amber-100">Sombra</option>
                    <option value="fogo" className="bg-stone-900 text-amber-100">Fogo</option>
                    <option value="gelo" className="bg-stone-900 text-amber-100">Gelo</option>
                    <option value="veneno" className="bg-stone-900 text-amber-100">Veneno</option>
                    <option value="arcano" className="bg-stone-900 text-amber-100">Arcano</option>
                    <option value="sagrado" className="bg-stone-900 text-amber-100">Sagrado</option>
                    <option value="profano" className="bg-stone-900 text-amber-100">Profano</option>
                    <option value="natureza" className="bg-stone-900 text-amber-100">Natureza</option>
                  </select>
                </div>
              </div>

              {/* Botão de Geração Final */}
              <div className="pt-2">
                <button 
                  id="btn-trigger-generate-monster"
                  onClick={handleGenerate} 
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-stone-950 font-cinzel font-black text-xs uppercase tracking-widest rounded border border-amber-400/60 shadow-[0_0_20px_rgba(217,119,6,0.3)] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin text-stone-950" />
                      <span>Invocando Criatura...</span>
                    </>
                  ) : (
                    <>
                      <Sword size={15} className="text-stone-950" />
                      <span>Gerar Monstro</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="generated-sheet"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="w-full max-w-4xl max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <GeneratedMonsterSheet 
              monster={generatedMonster} 
              onReroll={handleGenerate}
              onSave={onSave ? () => onSave(generatedMonster) : undefined}
              onClose={() => setGeneratedMonster(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
