
import React, { useState } from 'react';
import { Sword, Zap, Settings2, RefreshCw, Save, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../Button';
import { MonsterGeneratorService, GeneratedMonster } from '../../../services/monsterGeneratorService';
import { MonsterRole, MonsterRank, CreatureType } from '../../../constants/monsterData';
import { GeneratedMonsterSheet } from './GeneratedMonsterSheet';

interface MonsterGeneratorCardProps {
  onSave?: (monster: GeneratedMonster) => void;
}

export const MonsterGeneratorCard: React.FC<MonsterGeneratorCardProps> = ({ onSave }) => {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [generatedMonster, setGeneratedMonster] = useState<GeneratedMonster | null>(null);
  const [loading, setLoading] = useState(false);

  // Advanced Filters State
  const [nd, setNd] = useState('1');
  const [role, setRole] = useState<MonsterRole>('bruto');
  const [type, setType] = useState<CreatureType>('monstro');
  const [rank, setRank] = useState<MonsterRank>('normal');
  const [environment, setEnvironment] = useState('floresta');
  const [theme, setTheme] = useState('sombra');

  const handleQuickGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const monster = MonsterGeneratorService.generate();
      setGeneratedMonster(monster);
      setLoading(false);
    }, 500);
  };

  const handleAdvancedGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const monster = MonsterGeneratorService.generate({
        nd, role, type, rank, environment, theme
      });
      setGeneratedMonster(monster);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-8 border-2 border-gold/20 relative overflow-hidden group">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-gold/10 transition-colors duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-3xl font-cinzel text-gold-gradient flex items-center gap-3">
              <Sword className="text-gold/60" size={28} /> Gerador de Monstro
            </h3>
            <p className="text-gold/40 text-sm italic font-cinzel tracking-wide">
              "Invoque horrores das profundezas de Arton em um piscar de olhos."
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleQuickGenerate} 
              disabled={loading}
              icon={Zap}
              className="shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            >
              {loading ? 'Invocando...' : 'Gerar Monstro'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setIsAdvanced(!isAdvanced)}
              icon={isAdvanced ? ChevronUp : Settings2}
              className="bg-black/40"
            >
              {isAdvanced ? 'Fechar Filtros' : 'Modo Avançado'}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {isAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-8 mt-8 border-t border-gold/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gold/40 tracking-widest">Nível de Desafio (ND)</label>
                  <select 
                    value={nd} 
                    onChange={(e) => setNd(e.target.value)}
                    className="w-full bg-black/60 border border-gold/10 rounded-sm p-3 text-gold font-cinzel text-sm focus:border-gold/40 outline-none"
                  >
                    {['1/4', '1/2', '1', '2', '3', '4', '5', '7', '10', '15', '20'].map(val => (
                      <option key={val} value={val}>ND {val}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gold/40 tracking-widest">Função</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as MonsterRole)}
                    className="w-full bg-black/60 border border-gold/10 rounded-sm p-3 text-gold font-cinzel text-sm focus:border-gold/40 outline-none"
                  >
                    <option value="bruto">Bruto</option>
                    <option value="emboscador">Emboscador</option>
                    <option value="controlador">Controlador</option>
                    <option value="conjurador">Conjurador</option>
                    <option value="tanque">Tanque</option>
                    <option value="especialista">Especialista</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gold/40 tracking-widest">Tipo de Criatura</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as CreatureType)}
                    className="w-full bg-black/60 border border-gold/10 rounded-sm p-3 text-gold font-cinzel text-sm focus:border-gold/40 outline-none"
                  >
                    <option value="animal">Animal</option>
                    <option value="besta">Besta</option>
                    <option value="construto">Construto</option>
                    <option value="demônio">Demônio</option>
                    <option value="espírito">Espírito</option>
                    <option value="humanoide">Humanoide</option>
                    <option value="monstro">Monstro</option>
                    <option value="morto-vivo">Morto-Vivo</option>
                    <option value="planta">Planta</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gold/40 tracking-widest">Rank</label>
                  <select 
                    value={rank} 
                    onChange={(e) => setRank(e.target.value as MonsterRank)}
                    className="w-full bg-black/60 border border-gold/10 rounded-sm p-3 text-gold font-cinzel text-sm focus:border-gold/40 outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="elite">Elite</option>
                    <option value="chefe">Chefe</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gold/40 tracking-widest">Ambiente</label>
                  <select 
                    value={environment} 
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full bg-black/60 border border-gold/10 rounded-sm p-3 text-gold font-cinzel text-sm focus:border-gold/40 outline-none"
                  >
                    <option value="floresta">Floresta</option>
                    <option value="pântano">Pântano</option>
                    <option value="montanha">Montanha</option>
                    <option value="caverna">Caverna</option>
                    <option value="ruínas">Ruínas</option>
                    <option value="deserto">Deserto</option>
                    <option value="cidade">Cidade</option>
                    <option value="mar">Mar</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gold/40 tracking-widest">Tema</label>
                  <select 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-black/60 border border-gold/10 rounded-sm p-3 text-gold font-cinzel text-sm focus:border-gold/40 outline-none"
                  >
                    <option value="sombra">Sombra</option>
                    <option value="fogo">Fogo</option>
                    <option value="gelo">Gelo</option>
                    <option value="veneno">Veneno</option>
                    <option value="arcano">Arcano</option>
                    <option value="sagrado">Sagrado</option>
                    <option value="profano">Profano</option>
                    <option value="natureza">Natureza</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-3 pt-4">
                  <Button fullWidth onClick={handleAdvancedGenerate} disabled={loading} icon={Zap}>
                    {loading ? 'Invocando...' : 'Gerar Monstro com Filtros'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result Section */}
      <AnimatePresence>
        {generatedMonster && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <GeneratedMonsterSheet 
              monster={generatedMonster} 
              onReroll={() => isAdvanced ? handleAdvancedGenerate() : handleQuickGenerate()}
              onSave={onSave ? () => onSave(generatedMonster) : undefined}
              onClose={() => setGeneratedMonster(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
