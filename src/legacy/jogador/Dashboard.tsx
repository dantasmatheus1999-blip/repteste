// Módulo legado preservado como rascunho para consulta futura.
// Não excluir sem autorização.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Sword, Plus, Dices, ScrollText, Castle, Hourglass, Flame, Compass } from 'lucide-react';
import { useDiceRoller } from '../../hooks/useDiceRoller';
import { motion, AnimatePresence } from 'motion/react';

export const LegacyDashboard = () => {
  const navigate = useNavigate();
  const { roll, history, isRolling, lastResult } = useDiceRoller();

  return (
    <div className="space-y-6 sm:space-y-10 px-1 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-cinzel text-gold-gradient drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] tracking-[0.1em] sm:tracking-[0.25em] uppercase break-words">
            Grimório Central <span className="text-[10px] opacity-30 ml-2">v1.1</span>
          </h2>
          <p className="text-gold/60 text-xs sm:text-sm md:text-base font-medium tracking-[0.1em] sm:tracking-[0.15em] italic drop-shadow-sm">"O destino é escrito com sangue e tinta no grande grimório."</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto relative z-10">
          <Button 
            variant="secondary" 
            size="sm" 
            icon={Plus} 
            className="flex-1 sm:flex-none text-[10px] sm:text-xs"
            onClick={() => navigate('/master/campaigns/new')}
          >
            Criar Campanha
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={Plus} 
            className="flex-1 sm:flex-none text-[10px] sm:text-xs"
            onClick={() => navigate('/characters/sheet')}
          >
            Novo Herói
          </Button>
          <Button 
            size="sm" 
            icon={Compass} 
            className="flex-1 sm:flex-none text-[10px] sm:text-xs"
            onClick={() => navigate('/master/campaigns')}
          >
            Campanhas
          </Button>
        </div>
        <div className="absolute -top-10 -left-10 w-20 h-20 sm:w-40 sm:h-40 bg-gold/5 blur-3xl rounded-full pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        <Card title="Minhas Campanhas" subtitle="Você é o mestre em 2 mesas" icon={Castle}>
          <div className="space-y-4">
            <div className="p-5 rounded-sm bg-black/40 border-l-4 border-gold hover:bg-gold/5 transition-all cursor-pointer group relative overflow-hidden border border-gold/10">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                <Castle size={40} />
              </div>
              <h4 className="font-cinzel text-lg text-gold group-hover:text-yellow-200 transition-colors">O Despertar de Kallyadranoch</h4>
              <p className="text-[10px] text-gold/50 mt-1 uppercase font-bold tracking-[0.2em]">Tormenta 20 • 4 Jogadores</p>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold/20" />
                ))}
              </div>
            </div>
            <div className="p-5 rounded-sm bg-black/40 border-l-4 border-gold/40 hover:bg-gold/5 transition-all cursor-pointer group relative overflow-hidden border border-gold/10">
              <h4 className="font-cinzel text-lg text-gold/80 group-hover:text-gold transition-colors">Sombras de Valkaria</h4>
              <p className="text-[10px] text-gold/40 mt-1 uppercase font-bold tracking-[0.2em]">Tormenta 20 • 5 Jogadores</p>
            </div>
          </div>
        </Card>

        <Card title="Rolar Dados" subtitle="Teste sua sorte" icon={Dices}>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[4, 6, 8, 10, 12, 20].map(d => (
                <motion.button
                  key={d}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => roll(`1d${d}`)}
                  disabled={isRolling}
                  className="flex flex-col items-center justify-center p-4 rounded-sm bg-mythos-bg border-2 border-gold/20 hover:border-gold text-gold transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)] group relative overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors" />
                  <Dices size={24} className="mb-1 opacity-30 group-hover:opacity-100 transition-opacity relative z-10" />
                  <span className="font-bold font-medieval text-xl relative z-10">d{d}</span>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-gold/20 group-hover:border-gold transition-colors" />
                </motion.button>
              ))}
            </div>

            <div className="h-24 flex items-center justify-center bg-black/40 rounded-sm border border-gold/10 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {isRolling ? (
                  <motion.div
                    key="rolling"
                    initial={{ rotate: 0, scale: 1 }}
                    animate={{ rotate: 360, scale: 1.2 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                    className="text-gold/40"
                  >
                    <Dices size={48} />
                  </motion.div>
                ) : lastResult ? (
                  <motion.div
                    key={lastResult.id}
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <p className="text-[10px] uppercase font-bold text-gold/40 tracking-[0.3em] mb-1">{lastResult.formula}</p>
                    <span className="text-5xl font-medieval text-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]">
                      {lastResult.result}
                    </span>
                  </motion.div>
                ) : (
                  <p className="text-gold/20 font-cinzel text-xs italic">Aguardando o destino...</p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        <Card title="Histórico" subtitle="Últimos resultados" icon={Hourglass}>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            {history && history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gold/20">
                <Dices size={40} className="mb-3 opacity-10" />
                <p className="text-sm italic font-cinzel">O destino ainda não foi traçado...</p>
              </div>
            ) : (
              history.map(r => (
                <div key={r.id} className="flex justify-between items-center p-4 rounded-sm bg-black/30 border border-gold/10 hover:border-gold/30 transition-colors group">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gold/40 tracking-widest group-hover:text-gold/60 transition-colors">{r.formula}</p>
                    <p className="text-[10px] text-gold/30 italic">{r.details}</p>
                  </div>
                  <span className="text-3xl font-medieval text-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">{r.result}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Seção de Lore/Dica do Dia */}
      <div className="parchment p-8 rounded-sm relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
          <ScrollText size={120} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <Flame className="text-[#8b5a2b]" size={20} />
            <h3 className="font-cinzel text-xl text-[#2c1e11] font-bold">Crônicas de Arton</h3>
          </div>
          <p className="text-[#4a3728] leading-relaxed italic font-medium">
            "Dizem que nas profundezas das Montanhas Sanguinárias, o próprio Kallyadranoch sussurra segredos proibidos para aqueles que ousam desafiar o frio eterno. Muitos partiram em busca de glória, mas poucos retornaram com mais do que cicatrizes e pesadelos."
          </p>
          <div className="pt-4 flex justify-between items-center border-t border-[#8b5a2b]/20">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8b5a2b]">Escriba Real • 16 de Março</span>
            <button className="text-[10px] uppercase font-bold tracking-widest text-[#8b5a2b] hover:text-[#2c1e11] transition-colors">Ler mais crônicas →</button>
          </div>
        </div>
      </div>
    </div>
  );
};
