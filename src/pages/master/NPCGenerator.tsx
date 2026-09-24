import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Dices, 
  ChevronLeft,
  RefreshCw,
  Save,
  User,
  ScrollText,
  Check,
  Zap,
  Shield,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { NPC, NPCAttitude } from '../../types/master';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { T20_RACES } from '../../data/t20Races';

const ROLES = ['Comerciante', 'Guarda', 'Nobre', 'Camponês', 'Aventureiro', 'Mago', 'Clérigo', 'Ladino', 'Guerreiro', 'Taberneiro'];
const ATTITUDES: NPCAttitude[] = ['friendly', 'neutral', 'hostile'];
const PERSONALITIES = [
  'Arrogante e impaciente', 'Gentil e prestativo', 'Sempre desconfiado', 'Muito falante e curioso',
  'Sombrio e misterioso', 'Otimista incurável', 'Cínico e sarcástico', 'Honrado e rígido',
  'Medroso e hesitante', 'Ganancioso e calculista'
];
const IDEALS = [
  'A lei deve ser seguida acima de tudo', 'A liberdade é o bem mais precioso', 'O conhecimento deve ser preservado',
  'A força é a única linguagem que importa', 'Ajudar os necessitados é um dever', 'A glória pessoal é o objetivo final',
  'A tradição deve ser mantida', 'A mudança é necessária para o progresso'
];
const NAMES = {
  Humano: ['Alaric', 'Beren', 'Cedric', 'Dara', 'Elowen', 'Faramir', 'Gwen', 'Haldor', 'Idril', 'Joram'],
  Elfo: ['Aeliana', 'Beleg', 'Celeborn', 'Dior', 'Elrond', 'Fëanor', 'Galadriel', 'Haldir', 'Indis', 'Legolas'],
  Anão: ['Balin', 'Dain', 'Erebor', 'Fili', 'Gimli', 'Hurin', 'Ithun', 'Kili', 'Loni', 'Moria'],
  // Add more as needed
};

export const NPCGenerator: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { campaignId } = useParams<{ campaignId: string }>();
  
  const [generatedNPC, setGeneratedNPC] = useState<Partial<NPC> | null>(null);
  const [saving, setSaving] = useState(false);

  const generateNPC = () => {
    const selectedRace = T20_RACES[Math.floor(Math.random() * T20_RACES.length)];
    const race = selectedRace.name;
    const role = ROLES[Math.floor(Math.random() * ROLES.length)];
    const attitude = ATTITUDES[Math.floor(Math.random() * ATTITUDES.length)];
    const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    const ideal = IDEALS[Math.floor(Math.random() * IDEALS.length)];
    
    const raceNames = NAMES[race as keyof typeof NAMES] || NAMES.Humano;
    const name = raceNames[Math.floor(Math.random() * raceNames.length)];

    const npc: Partial<NPC> = {
      name,
      race,
      role,
      attitude,
      personality,
      ideals: ideal,
      description: `Um(a) ${race} que atua como ${role.toLowerCase()}.`,
      isFavorite: false,
      stats: {
        hp: Math.floor(Math.random() * 20) + 10,
        mp: Math.floor(Math.random() * 10) + 5,
        ac: Math.floor(Math.random() * 5) + 10,
        str: Math.floor(Math.random() * 8) + 8,
        dex: Math.floor(Math.random() * 8) + 8,
        con: Math.floor(Math.random() * 8) + 8,
        int: Math.floor(Math.random() * 8) + 8,
        wis: Math.floor(Math.random() * 8) + 8,
        cha: Math.floor(Math.random() * 8) + 8,
      }
    };

    setGeneratedNPC(npc);
  };

  const handleSave = async () => {
    if (!user || !generatedNPC) return;

    setSaving(true);
    try {
      await MasterService.createNPC(user.uid, campaignId || '', generatedNPC);
      navigate(campaignId ? `/master/campaigns/${campaignId}` : '/master/npcs');
    } catch (error) {
      console.error("Error saving generated NPC:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => campaignId ? navigate(`/master/campaigns/${campaignId}`) : navigate('/master/npcs')}
            className="flex items-center gap-2 text-gold/40 hover:text-gold transition-colors text-xs uppercase tracking-widest font-bold mb-2"
          >
            <ChevronLeft size={14} /> Voltar
          </button>
          <h2 className="text-4xl font-cinzel text-gold-gradient">Gerador de NPCs</h2>
          <p className="text-gold/40 text-sm italic">Invoque novos personagens instantaneamente com o sopro do destino.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Generator Controls */}
        <div className="space-y-6">
          <Card title="O Sopro do Destino" icon={Dices}>
            <div className="space-y-6 py-4">
              <p className="text-sm text-gold/40 italic text-center">
                "Role os dados para manifestar um novo habitante em Arton."
              </p>
              <Button 
                fullWidth 
                icon={RefreshCw} 
                onClick={generateNPC}
                className="py-6 text-xl font-cinzel"
              >
                Gerar NPC Aleatório
              </Button>
            </div>
          </Card>

          {generatedNPC && (
            <div className="space-y-3">
              <Button 
                fullWidth 
                icon={Save} 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Consagrando...' : 'Salvar no Grimório'}
              </Button>
              <Button 
                variant="secondary" 
                fullWidth 
                icon={RefreshCw} 
                onClick={generateNPC}
              >
                Gerar Outro
              </Button>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="space-y-6">
          {generatedNPC ? (
            <div className="animate-in zoom-in-95 duration-500">
              <Card title="Manifestação" icon={User}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-sm bg-gold/5 border border-gold/10 flex items-center justify-center text-gold/20">
                      <User size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-cinzel text-gold">{generatedNPC.name}</h3>
                      <p className="text-[10px] text-gold/40 uppercase font-bold tracking-widest">
                        {generatedNPC.race} • {generatedNPC.role}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gold/5">
                    <div className="flex items-start gap-3">
                      <ScrollText size={16} className="text-gold/20 mt-1" />
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Personalidade</p>
                        <p className="text-sm text-gold/60 italic">{generatedNPC.personality}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap size={16} className="text-gold/20 mt-1" />
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Ideais</p>
                        <p className="text-sm text-gold/60 italic">{generatedNPC.ideals}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check size={16} className="text-gold/20 mt-1" />
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Atitude</p>
                        <p className={`text-sm font-bold uppercase ${
                          generatedNPC.attitude === 'friendly' ? 'text-emerald-500' : 
                          generatedNPC.attitude === 'hostile' ? 'text-red-500' : 'text-gold/60'
                        }`}>
                          {generatedNPC.attitude === 'friendly' ? 'Amigável' : 
                           generatedNPC.attitude === 'hostile' ? 'Hostil' : 'Neutro'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gold/5">
                    <div className="p-2 bg-black/20 border border-gold/5 rounded-sm text-center">
                      <p className="text-[8px] text-gold/30 uppercase font-bold tracking-widest">PV</p>
                      <p className="text-lg font-medieval text-gold">{generatedNPC.stats?.hp}</p>
                    </div>
                    <div className="p-2 bg-black/20 border border-gold/5 rounded-sm text-center">
                      <p className="text-[8px] text-gold/30 uppercase font-bold tracking-widest">PM</p>
                      <p className="text-lg font-medieval text-gold">{generatedNPC.stats?.mp}</p>
                    </div>
                    <div className="p-2 bg-black/20 border border-gold/5 rounded-sm text-center">
                      <p className="text-[8px] text-gold/30 uppercase font-bold tracking-widest">Def</p>
                      <p className="text-lg font-medieval text-gold">{generatedNPC.stats?.ac}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-gold/10 rounded-sm text-center space-y-4">
              <User size={48} className="text-gold/5" />
              <p className="text-gold/20 italic text-sm">Aguardando a manifestação do destino...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
