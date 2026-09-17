import React, { useState, useEffect } from 'react';
import { Sword, RefreshCw, X, Sparkles, ShieldAlert, Crosshair, Wand2, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MonsterGeneratorService, GeneratedMonster } from '../../../services/monsterGeneratorService';
import { CombatRole, MonsterRole, MonsterRank, CreatureType } from '../../../constants/monsterData';
import { CombatStyle, RealmorScale } from '../../../types/master';
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

  // Generator Filters State (4 Eixos de Arquitetura REALMOR + T20)
  const [nd, setNd] = useState('1');
  const [combatRole, setCombatRole] = useState<CombatRole>('solo');
  const [combatStyle, setCombatStyle] = useState<CombatStyle>('marcial');
  const [realmorScale, setRealmorScale] = useState<RealmorScale>('normal');
  const [role, setRole] = useState<MonsterRole>('bruto');
  const [type, setType] = useState<CreatureType>('monstro');
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
        combatRole,
        combatStyle,
        realmorScale,
        rank: realmorScale as MonsterRank,
        role, 
        type, 
        environment, 
        theme
      });
      setGeneratedMonster(monster);
      setLoading(false);
    }, 350);
  };

  const allNds = [
    '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', 'S', 'S+'
  ];

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
                    Gerador de Ameaças T20 & REALMOR
                  </h3>
                  <p className="text-[10px] text-stone-400 font-cinzel italic">
                    Tabela 2-3 Oficial (Ameaças de Arton) + Arquitetura 4 Eixos
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

            {/* Grid de Parâmetros com os 4 Eixos Independentes */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              {/* EIXO 1: PAPEL DE COMBATE T20 (Tabela 2-3 de Ameaças de Arton) */}
              <div className="space-y-1.5 bg-amber-950/20 border border-amber-800/40 rounded p-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase font-black text-amber-300 tracking-wider font-cinzel flex items-center gap-1.5">
                    <ShieldAlert size={13} className="text-amber-400" />
                    1. Papel de Combate (Tabela 2-3 Oficial)
                  </label>
                  <span className="text-[9px] font-cinzel text-amber-400/70 uppercase">
                    Ameaças de Arton
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCombatRole('solo')}
                    className={`py-2 px-2 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatRole === 'solo'
                        ? 'bg-amber-600 text-stone-950 border-amber-300 shadow-[0_0_12px_rgba(217,119,6,0.4)]'
                        : 'bg-stone-900 text-stone-300 border-amber-900/40 hover:border-amber-700'
                    }`}
                  >
                    <span>⚔️ Solo</span>
                    <span className="text-[9px] opacity-80 font-normal">Tabela 2-3 A</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCombatRole('lacaio')}
                    className={`py-2 px-2 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatRole === 'lacaio'
                        ? 'bg-amber-600 text-stone-950 border-amber-300 shadow-[0_0_12px_rgba(217,119,6,0.4)]'
                        : 'bg-stone-900 text-stone-300 border-amber-900/40 hover:border-amber-700'
                    }`}
                  >
                    <span>👥 Lacaio</span>
                    <span className="text-[9px] opacity-80 font-normal">Tabela 2-3 B</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCombatRole('especial')}
                    className={`py-2 px-2 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatRole === 'especial'
                        ? 'bg-amber-600 text-stone-950 border-amber-300 shadow-[0_0_12px_rgba(217,119,6,0.4)]'
                        : 'bg-stone-900 text-stone-300 border-amber-900/40 hover:border-amber-700'
                    }`}
                  >
                    <span>🔮 Especial</span>
                    <span className="text-[9px] opacity-80 font-normal">Tabela 2-3 C</span>
                  </button>
                </div>
                <p className="text-[10px] text-amber-200/70 font-cinzel italic pt-1">
                  {combatRole === 'solo' && '⚔️ Solo: Criatura para combate individual (PV robusto, atributos equilibrados).'}
                  {combatRole === 'lacaio' && '👥 Lacaio: Criatura feita para grupos numerosos (alto ataque/dano, PV baixo).'}
                  {combatRole === 'especial' && '🔮 Especial: Conjuradores, líderes e suporte (foco em magias, CD de habilidades e controle).'}
                </p>
              </div>

              {/* EIXO 2 & EIXO 3: ESTILO DE COMBATE E ND */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* ND */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    2. Nível de Desafio (ND)
                  </label>
                  <select 
                    value={nd} 
                    onChange={(e) => setNd(e.target.value)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    {allNds.map(val => (
                      <option key={val} value={val} className="bg-stone-900 text-amber-100">ND {val}</option>
                    ))}
                  </select>
                </div>

                {/* Função Tática / Distribuição de Resistências */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    Perfil de Resistências
                  </label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as MonsterRole)}
                    className="w-full bg-stone-900 border border-amber-900/40 rounded px-3 py-2 text-amber-100 font-cinzel text-xs focus:border-amber-500/70 focus:outline-none transition-colors"
                  >
                    <option value="bruto" className="bg-stone-900 text-amber-100">Bruto (Fort Forte, Von Média, Ref Fraca)</option>
                    <option value="emboscador" className="bg-stone-900 text-amber-100">Emboscador (Ref Forte, Fort Média, Von Fraca)</option>
                    <option value="controlador" className="bg-stone-900 text-amber-100">Controlador (Von Forte, Fort Média, Ref Fraca)</option>
                    <option value="conjurador" className="bg-stone-900 text-amber-100">Conjurador (Von Forte, Ref Média, Fort Fraca)</option>
                    <option value="tanque" className="bg-stone-900 text-amber-100">Tanque (Fort Forte, Von Média, Ref Fraca)</option>
                    <option value="especialista" className="bg-stone-900 text-amber-100">Especialista (Ref Forte, Von Média, Fort Fraca)</option>
                  </select>
                </div>
              </div>

              {/* EIXO 3: ESTILO DE COMBATE */}
              <div className="space-y-1.5 bg-stone-900/60 border border-stone-800 rounded p-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase font-black text-amber-300 tracking-wider font-cinzel flex items-center gap-1.5">
                    <Crosshair size={13} className="text-amber-400" />
                    3. Estilo de Combate
                  </label>
                  <span className="text-[9px] font-cinzel text-stone-400 uppercase">
                    Mecânica de Ofensiva
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCombatStyle('marcial')}
                    className={`py-2 px-1.5 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatStyle === 'marcial'
                        ? 'bg-amber-600 text-stone-950 border-amber-300 shadow-[0_0_10px_rgba(217,119,6,0.3)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>🗡️ Marcial</span>
                    <span className="text-[9px] opacity-80 font-normal">Corpo a corpo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCombatStyle('atirador')}
                    className={`py-2 px-1.5 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatStyle === 'atirador'
                        ? 'bg-blue-600 text-stone-950 border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>🏹 Atirador</span>
                    <span className="text-[9px] opacity-80 font-normal">À distância</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCombatStyle('conjurador')}
                    className={`py-2 px-1.5 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatStyle === 'conjurador'
                        ? 'bg-purple-600 text-purple-50 border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>✨ Conjurador</span>
                    <span className="text-[9px] opacity-80 font-normal">Magias & PM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCombatStyle('tatico')}
                    className={`py-2 px-1.5 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      combatStyle === 'tatico'
                        ? 'bg-emerald-600 text-emerald-50 border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>🧭 Tático</span>
                    <span className="text-[9px] opacity-80 font-normal">Controle/Apoio</span>
                  </button>
                </div>
              </div>

              {/* EIXO 4: ESCALA DE PODER REALMOR */}
              <div className="space-y-1.5 bg-stone-900/50 border border-stone-800 rounded p-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase font-black text-amber-300 tracking-wider font-cinzel flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    4. Escala de Poder REALMOR
                  </label>
                  <span className="text-[9px] font-cinzel text-stone-400 uppercase">
                    Importância no Encontro
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRealmorScale('normal')}
                    className={`py-2 px-2 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      realmorScale === 'normal'
                        ? 'bg-emerald-700 text-emerald-50 border-emerald-400 shadow-[0_0_10px_rgba(160,185,129,0.3)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>🟢 Normal</span>
                    <span className="text-[9px] opacity-80 font-normal">Padrão T20</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRealmorScale('elite')}
                    className={`py-2 px-2 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      realmorScale === 'elite'
                        ? 'bg-purple-700 text-purple-50 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>🟣 Elite</span>
                    <span className="text-[9px] opacity-80 font-normal">Líder / Notável</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRealmorScale('chefe')}
                    className={`py-2 px-2 rounded text-xs font-cinzel font-bold border transition-all flex flex-col items-center gap-0.5 ${
                      realmorScale === 'chefe'
                        ? 'bg-red-700 text-red-50 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <span>🔴 Chefe</span>
                    <span className="text-[9px] opacity-80 font-normal">Mecânica de Boss</span>
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 font-cinzel italic pt-1">
                  {realmorScale === 'normal' && '🟢 Normal: Estatísticas e repertório equilibrados conforme a Tabela 2-3.'}
                  {realmorScale === 'elite' && '🟣 Elite: Espécime notável com mais opções táticas e habilidades complementares.'}
                  {realmorScale === 'chefe' && '🔴 Chefe: Inclui Ações de Chefe, Gatilho de 2ª Fase (50% PV), Reações e Resiliência Lendária.'}
                </p>
              </div>

              {/* Informação conceitual de desmistificação */}
              <div className="px-3 py-2 rounded bg-amber-950/10 border border-amber-900/20 text-[10px] text-amber-300/80 font-cinzel">
                💡 <strong>Arquitetura 4 Eixos:</strong> <em>Especial NÃO é Chefe.</em> Especial define suporte/magia na T20; Chefe define recursos lendários REALMOR. Um Conjurador pode ser Solo Chefe ou Especial Normal.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider font-cinzel">
                    Tema Elemental / Arcano
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
                      <span>Gerando Ameaça T20...</span>
                    </>
                  ) : (
                    <>
                      <Sword size={15} className="text-stone-950" />
                      <span>Gerar Criatura</span>
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
