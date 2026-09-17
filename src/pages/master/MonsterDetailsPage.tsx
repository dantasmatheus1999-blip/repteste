import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Edit3, 
  Skull, 
  Shield, 
  Zap, 
  Heart, 
  Brain, 
  Wind, 
  Target,
  Info,
  Sword,
  Sparkles,
  Flame,
  Droplets,
  Mountain,
  Sun,
  Moon
} from 'lucide-react';
import { motion } from 'motion/react';
import { MasterService } from '../../services/masterService';
import { NPC } from '../../types/master';
import { Button } from '../../components/Button';
import { CollapsibleSection } from '../../components/CollapsibleSection';

export interface MonsterDetailsPageProps {
  customCampaignId?: string;
  customMonsterId?: string;
  onClose?: () => void;
  onEdit?: (monsterId: string) => void;
  isEmbedded?: boolean;
}

export const MonsterDetailsPage: React.FC<MonsterDetailsPageProps> = ({
  customCampaignId,
  customMonsterId,
  onClose,
  onEdit,
  isEmbedded
}) => {
  const navigate = useNavigate();
  const params = useParams<{ campaignId: string; monsterId: string }>();
  const campaignId = customCampaignId !== undefined ? customCampaignId : params.campaignId;
  const monsterId = customMonsterId !== undefined ? customMonsterId : params.monsterId;
  const [monster, setMonster] = useState<NPC | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parseAttackText = (text: string): any => {
      if (!text) return { name: 'Ataque', description: '' };

      const action: any = {
        name: 'Ataque',
        description: text,
        bonus: undefined,
        damage: undefined,
        type: '',
        critical: '',
        range: '',
        damageType: '',
        observations: ''
      };

      let workingText = text;

      // Try to split by " — " or " - " or " : "
      const separators = [' — ', ' - ', ' : '];
      for (const sep of separators) {
        if (workingText.includes(sep)) {
          const parts = workingText.split(sep);
          action.name = parts[0].trim();
          workingText = parts.slice(1).join(sep).trim();
          break;
        }
      }

      // Extract bonus: look for +X or -X followed by "ataque" or just the first +X/-X
      const bonusMatch = workingText.match(/([+-]\d+)\s*(?:ataque|no ataque|de ataque)/i) || 
                         workingText.match(/(?:ataque|bônus):\s*([+-]\d+)/i) ||
                         workingText.match(/([+-]\d+)/);
      if (bonusMatch) {
        const val = bonusMatch[1] || bonusMatch[0];
        action.bonus = parseInt(val);
      }

      // Extract damage: look for something like "XdX+X" or "| XdX+X dano"
      const damageMatch = workingText.match(/\|\s*([^|]+)\s*dano/i) || 
                          workingText.match(/dano:\s*([^|]+)/i) ||
                          workingText.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)/i);
      if (damageMatch) {
        action.damage = (damageMatch[1] || damageMatch[0]).trim();
      }

      // Extract critical: "Crítico: 18-20 / x3"
      const critMatch = workingText.match(/Crítico:\s*([^|E\n]+)/i);
      if (critMatch) action.critical = critMatch[1].trim();

      // Extract effect: "Efeito: ..."
      const effectMatch = workingText.match(/Efeito:\s*([^|]+)/i);
      if (effectMatch) action.observations = effectMatch[1].trim();

      // Extract critical effect: "Efeito crítico: ..."
      const critEffectMatch = workingText.match(/Efeito crítico:\s*([^|E]+)/i);
      if (critEffectMatch) {
        const ce = critEffectMatch[1].trim();
        action.observations = action.observations ? `${action.observations} | Crítico: ${ce}` : `Crítico: ${ce}`;
      }

      // Extract type: "Corpo a corpo", "Distância"
      if (workingText.toLowerCase().includes('corpo a corpo')) action.type = 'Corpo a corpo';
      else if (workingText.toLowerCase().includes('distância') || workingText.toLowerCase().includes('à distância')) action.type = 'Distância';
      else if (workingText.toLowerCase().includes('mágico')) action.type = 'Mágico';

      return action;
    };

    const normalizeAttackData = (attack: any) => {
      if (typeof attack === 'string') return parseAttackText(attack);
      
      const normalized = {
        name: attack.name || 'Ataque',
        description: attack.description || '',
        type: attack.type || attack.attackType || '',
        bonus: attack.bonus ?? attack.attackBonus,
        damage: attack.damage || '',
        critical: attack.critical || attack.crit || '',
        range: attack.range || '',
        damageType: attack.damageType || '',
        observations: attack.observations || attack.effect || attack.criticalEffect || ''
      };

      // Combine all text for parsing
      const fullText = `${normalized.name} — ${normalized.description} ${normalized.observations}`.trim();

      // Aggressive fallback check: if bonus is 0 or damage is missing/0/--
      const isBonusInvalid = normalized.bonus === undefined || normalized.bonus === 0;
      const isDamageInvalid = !normalized.damage || normalized.damage === '0' || normalized.damage === '--' || normalized.damage === '—';
      
      if ((isBonusInvalid || isDamageInvalid) && fullText) {
        const parsed = parseAttackText(fullText);
        
        if (isBonusInvalid && parsed.bonus !== undefined && parsed.bonus !== 0) {
          normalized.bonus = parsed.bonus;
        }
        if (isDamageInvalid && parsed.damage && parsed.damage !== '0' && parsed.damage !== '--') {
          normalized.damage = parsed.damage;
        }
        if (!normalized.type && parsed.type) normalized.type = parsed.type;
        if (!normalized.critical && parsed.critical) normalized.critical = parsed.critical;
        if (!normalized.range && parsed.range) normalized.range = parsed.range;
        if (parsed.observations && (!normalized.observations || normalized.observations.length < 5)) {
          normalized.observations = parsed.observations;
        }
      }

      return normalized;
    };

    const normalizeAbilityData = (ability: any) => {
      if (typeof ability === 'string') return { name: 'Habilidade', description: ability, type: 'Passiva' };
      return {
        name: ability.name || 'Habilidade',
        description: ability.description || ability.effect || '',
        type: ability.type || 'Ação',
        cost: ability.cost || '',
        range: ability.range || '',
        cooldown: ability.cooldown || '',
        condition: ability.condition || '',
        duration: ability.duration || '',
        observations: ability.observations || ''
      };
    };

    const normalizeSynergyData = (synergy: any) => {
      if (!synergy) return null;
      if (typeof synergy === 'string') return { name: 'Sinergia', effect: synergy };
      return {
        name: synergy.name || synergy.title || 'Sinergia',
        condition: synergy.condition || synergy.activation || '',
        effect: synergy.effect || synergy.description || '',
        target: synergy.target || synergy.alvo || '',
        type: synergy.type || '',
        observations: synergy.observations || synergy.notes || ''
      };
    };

    const fetchMonster = async () => {
      if (!monsterId) return;
      try {
        const data = await MasterService.getNPC(monsterId);
        if (data) {
          // Normalize data to ensure all expected fields exist
          const normalized = {
            ...data,
            stats: {
              hp: data.stats?.hp ?? (data as any).hp ?? 0,
              mp: data.stats?.mp ?? (data as any).mp ?? 0,
              ac: data.stats?.ac ?? (data as any).defense ?? (data as any).ac ?? 10,
              str: data.stats?.str ?? (data as any).strength ?? 10,
              dex: data.stats?.dex ?? (data as any).dexterity ?? 10,
              con: data.stats?.con ?? (data as any).constitution ?? 10,
              int: data.stats?.int ?? (data as any).intelligence ?? 10,
              wis: data.stats?.wis ?? (data as any).wisdom ?? 10,
              cha: data.stats?.cha ?? (data as any).charisma ?? 10,
            },
            initiative: data.initiative ?? (data as any).initiative ?? 0,
            speed: data.speed ?? (data as any).speed ?? '9m',
            perception: data.perception ?? (data as any).perception ?? 0,
            actions: (data.actions || (data as any).attacks || []).map(normalizeAttackData),
            abilities: (data.abilities || (data as any).specialAbilities || []).map(normalizeAbilityData),
            weaknesses: data.weaknesses || [],
            advantages: data.advantages || [],
            synergies: (data as any).synergies ? (data as any).synergies.map(normalizeSynergyData) : 
                       data.synergy ? [normalizeSynergyData(data.synergy)] : []
          };
          setMonster(normalized as any);
        } else {
          setError('Criatura não encontrada.');
        }
      } catch (err) {
        console.error('Error fetching monster:', err);
        setError('Erro ao carregar os detalhes da criatura.');
      } finally {
        setLoading(false);
      }
    };

    fetchMonster();
  }, [monsterId]);

  const handleEdit = () => {
    if (onEdit && monsterId) {
      onEdit(monsterId);
      return;
    }
    const editPath = campaignId 
      ? `/master/campaigns/${campaignId}/monsters/${monsterId}/edit`
      : `/master/monsters/${monsterId}/edit`;
    navigate(editPath);
  };

  const handleGoBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-mythos-bg flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold shadow-[0_0_20px_rgba(212,175,55,0.4)] mb-4"></div>
        <p className="text-gold/40 font-cinzel italic animate-pulse">Consultando os anais de Arton...</p>
      </div>
    );
  }

  if (error || !monster) {
    return (
      <div className="min-h-screen bg-mythos-bg flex flex-col items-center justify-center p-8 text-center">
        <Skull size={64} className="text-red-500/40 mb-6" />
        <h2 className="text-3xl font-cinzel text-gold mb-4">{error || 'Criatura não encontrada'}</h2>
        <Button variant="secondary" onClick={handleGoBack}>Voltar ao Bestiário</Button>
      </div>
    );
  }

  return (
    <div className={`text-gold font-cinzel selection:bg-gold/30 ${isEmbedded ? 'bg-transparent min-h-0' : 'min-h-screen bg-mythos-bg'}`}>
      {/* Header Bar */}
      <div className={`sticky top-0 z-50 bg-mythos-bg/90 backdrop-blur-xl border-b border-gold/10 px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleGoBack}
              className="p-2 hover:bg-gold/10 rounded-full transition-colors text-gold/60 hover:text-gold"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <Skull size={20} className="text-gold/40" />
                <h1 className="text-2xl font-black tracking-widest uppercase">{monster.name}</h1>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/40">
                {monster.race} <span className="text-gold/10 mx-2">|</span> {monster.rank} <span className="text-gold/10 mx-2">|</span> ND {monster.nd}
                {monster.theme && monster.theme !== 'Nenhum' && (
                  <>
                    <span className="text-gold/10 mx-2">|</span> {monster.theme}
                  </>
                )}
              </p>
            </div>
          </div>
          <Button 
            variant="primary" 
            icon={Edit3}
            onClick={handleEdit}
            className="shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            Editar Criatura
          </Button>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto ${isEmbedded ? 'px-3 sm:px-6 py-4 sm:py-6' : 'px-4 sm:px-6 py-6 sm:py-8'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Image & Basic Info */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-6">
            <div className="relative group aspect-[16/10] sm:aspect-[4/3] lg:aspect-[4/5] max-h-80 rounded-2xl overflow-hidden border-2 border-gold/20 shadow-2xl bg-black/40">
              {monster.imageUrl ? (
                <img 
                  src={monster.imageUrl} 
                  alt={monster.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-black/40 flex items-center justify-center">
                  <Skull size={80} className="text-gold/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-mythos-bg via-transparent to-transparent opacity-60" />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5">
              <div className="p-3 bg-black/40 border border-gold/10 rounded-xl text-center space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gold/40">PV</p>
                <p className="text-xl sm:text-2xl font-black text-red-500">{monster.stats?.hp}</p>
              </div>
              <div className="p-3 bg-black/40 border border-gold/10 rounded-xl text-center space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gold/40">PM</p>
                <p className="text-xl sm:text-2xl font-black text-blue-400">{monster.stats?.mp}</p>
              </div>
              <div className="p-3 bg-black/40 border border-gold/10 rounded-xl text-center space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gold/40">Defesa</p>
                <p className="text-xl sm:text-2xl font-black text-gold">{monster.stats?.ac}</p>
              </div>
              <div className="p-3 bg-black/40 border border-gold/10 rounded-xl text-center space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gold/40">Iniciativa</p>
                <p className="text-xl sm:text-2xl font-black text-gold">+{monster.initiative}</p>
              </div>
              <div className="p-3 bg-black/40 border border-gold/10 rounded-xl text-center space-y-0.5 col-span-1 sm:col-span-2 lg:col-span-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gold/40">Deslocamento</p>
                <p className="text-lg font-black text-gold">{monster.speed}</p>
              </div>
              <div className="p-3 bg-black/40 border border-gold/10 rounded-xl text-center space-y-0.5 col-span-1 sm:col-span-2 lg:col-span-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gold/40">Percepção</p>
                <p className="text-lg font-black text-gold">+{monster.perception}</p>
              </div>
            </div>

            {/* Identification Info */}
            <div className="p-4 sm:p-5 bg-gold/5 border border-gold/10 rounded-2xl space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-gold/60 flex items-center gap-2">
                <Info size={15} /> Identificação
              </h3>
              <div className="grid grid-cols-1 gap-2.5 text-xs">
                <div className="flex justify-between border-b border-gold/5 pb-1.5">
                  <span className="text-gold/40 uppercase tracking-widest text-[11px]">Tamanho</span>
                  <span className="text-gold font-bold">{monster.size}</span>
                </div>
                <div className="flex justify-between border-b border-gold/5 pb-1.5">
                  <span className="text-gold/40 uppercase tracking-widest text-[11px]">Ambiente</span>
                  <span className="text-gold font-bold">{monster.environment || 'Qualquer'}</span>
                </div>
                <div className="flex justify-between border-b border-gold/5 pb-1.5">
                  <span className="text-gold/40 uppercase tracking-widest text-[11px]">Organização</span>
                  <span className="text-gold font-bold">{monster.organization || 'Solitário'}</span>
                </div>
                {monster.subtype && (
                  <div className="flex justify-between border-b border-gold/5 pb-1.5">
                    <span className="text-gold/40 uppercase tracking-widest text-[11px]">Subtipo</span>
                    <span className="text-gold font-bold">{monster.subtype}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-gold/5 pb-1.5">
                  <span className="text-gold/40 uppercase tracking-widest text-[11px]">Origem</span>
                  <span className="text-gold font-bold">{monster.origin || 'Desconhecida'}</span>
                </div>
                {monster.tags && monster.tags.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-gold/40 uppercase tracking-widest text-[10px] block">Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {monster.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gold/10 border border-gold/20 rounded text-[8px] font-black uppercase tracking-widest text-gold/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">
            
            {/* Attributes Section */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
              {[
                { label: 'FOR', val: monster.stats?.str, icon: Sword },
                { label: 'DES', val: monster.stats?.dex, icon: Wind },
                { label: 'CON', val: monster.stats?.con, icon: Heart },
                { label: 'INT', val: monster.stats?.int, icon: Brain },
                { label: 'SAB', val: monster.stats?.wis, icon: Sparkles },
                { label: 'CAR', val: monster.stats?.cha, icon: Zap }
              ].map((attr) => (
                <div key={attr.label} className="p-3 bg-gold/5 border border-gold/10 rounded-xl text-center group hover:border-gold/30 transition-all">
                  <attr.icon size={15} className="mx-auto mb-1.5 text-gold/40 group-hover:text-gold transition-colors" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-gold/40">{attr.label}</p>
                  <p className="text-lg font-black text-gold">{attr.val}</p>
                </div>
              ))}
            </div>

            {/* Main Content Sections */}
            <div className="space-y-4 sm:space-y-5">
              <CollapsibleSection title="Combate e Habilidades" icon={Sword} defaultOpen={true}>
                <div className="space-y-6">
                  {/* Actions/Attacks */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gold/60 flex items-center gap-2">
                      <Target size={16} /> Ataques e Ações
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {monster.actions?.map((action, idx) => (
                        <div key={idx} className="p-3.5 bg-black/40 border border-gold/10 rounded-xl space-y-2 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-gold font-bold uppercase tracking-wider text-sm">{action.name}</h4>
                              <div className="flex gap-2 text-[9px] font-black uppercase tracking-widest text-gold/40 shrink-0">
                                <span>{action.type}</span>
                                {action.range && <span>• {action.range}</span>}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                              <span className="text-gold/60">Ataque: <strong className="text-gold">{action.bonus !== undefined ? (action.bonus >= 0 ? `+${action.bonus}` : action.bonus) : '—'}</strong></span>
                              <span className="text-gold/60">Dano: <strong className="text-gold">{action.damage || '—'}</strong> {action.damageType && `(${action.damageType})`}</span>
                              {action.critical && <span className="text-gold/60">Crítico: <strong className="text-gold">{action.critical}</strong></span>}
                            </div>
                          </div>
                          {action.observations && (
                            <div className="text-[11px] text-gold/50 italic border-t border-gold/5 pt-1.5 mt-1">
                              <p><strong className="text-gold/70 not-italic uppercase tracking-tighter mr-1 text-[10px]">Efeito:</strong> {action.observations}</p>
                            </div>
                          )}
                          {action.description && action.description !== action.observations && (
                            <p className="text-[10px] text-gold/30 leading-relaxed">{action.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Abilities */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gold/60 flex items-center gap-2">
                      <Sparkles size={16} /> Habilidades Especiais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {monster.abilities && monster.abilities.length > 0 ? (
                        monster.abilities.map((ability: any, idx: number) => (
                          <div key={idx} className="p-3.5 bg-black/40 border border-gold/10 rounded-xl space-y-2 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-gold font-bold uppercase tracking-wider text-sm">{ability.name}</h4>
                                <span className="text-[9px] font-black uppercase tracking-widest text-gold/40 shrink-0">{ability.type}</span>
                              </div>
                              <p className="text-xs text-gold/70 leading-relaxed">{ability.description}</p>
                            </div>
                            
                            {(ability.cost || ability.range || ability.cooldown || ability.condition) && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gold/5 text-[10px]">
                                {ability.cost && (
                                  <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gold/30">Custo</p>
                                    <p className="text-gold/60">{ability.cost}</p>
                                  </div>
                                )}
                                {ability.range && (
                                  <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gold/30">Alcance</p>
                                    <p className="text-gold/60">{ability.range}</p>
                                  </div>
                                )}
                                {ability.cooldown && (
                                  <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gold/30">Recarga</p>
                                    <p className="text-gold/60">{ability.cooldown}</p>
                                  </div>
                                )}
                                {ability.condition && (
                                  <div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gold/30">Condição</p>
                                    <p className="text-gold/60">{ability.condition}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {ability.observations && (
                              <p className="text-[10px] text-gold/40 italic pt-1 border-t border-gold/5">
                                {ability.observations}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gold/20 italic col-span-2">Nenhuma habilidade especial cadastrada.</p>
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Fraquezas e Vantagens" icon={Shield}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-black uppercase tracking-widest text-red-400/70 flex items-center gap-2">
                        <Target size={15} /> Fraquezas
                      </h3>
                      <ul className="space-y-1.5">
                        {monster.weaknesses?.map((w, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-red-400/80">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500/40 shrink-0" /> {w}
                          </li>
                        ))}
                        {(!monster.weaknesses || monster.weaknesses.length === 0) && <li className="text-xs text-gold/20 italic">Nenhuma fraqueza conhecida.</li>}
                      </ul>
                    </div>
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-black uppercase tracking-widest text-green-400/70 flex items-center gap-2">
                        <Shield size={15} /> Vantagens
                      </h3>
                      <ul className="space-y-1.5">
                        {monster.advantages?.map((a, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-green-400/80">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/40 shrink-0" /> {a}
                          </li>
                        ))}
                        {(!monster.advantages || monster.advantages.length === 0) && <li className="text-xs text-gold/20 italic">Nenhuma vantagem conhecida.</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gold/5">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/40">Resistências</h4>
                      <p className="text-xs text-gold/60">{monster.resistances || 'Nenhuma'}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/40">Imunidades</h4>
                      <p className="text-xs text-gold/60">{monster.immunities || 'Nenhuma'}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/40">Vulnerabilidades</h4>
                      <p className="text-xs text-gold/60">{monster.vulnerabilities || 'Nenhuma'}</p>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Sinergias" icon={Zap}>
                <div className="space-y-3">
                  {(monster as any).synergies && (monster as any).synergies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {(monster as any).synergies.map((synergy: any, idx: number) => (
                        <div key={idx} className="p-3.5 bg-black/40 border border-gold/10 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-gold font-bold uppercase tracking-wider text-sm">{synergy.name}</h4>
                            {synergy.type && <span className="text-[9px] font-black uppercase tracking-widest text-gold/40">{synergy.type}</span>}
                          </div>
                          <div className="space-y-1.5">
                            {synergy.condition && (
                              <p className="text-xs text-gold/60"><strong className="text-gold/40 uppercase tracking-tighter mr-1 text-[10px]">Condição:</strong> {synergy.condition}</p>
                            )}
                            <p className="text-xs text-gold/80 leading-relaxed"><strong className="text-gold/40 uppercase tracking-tighter mr-1 text-[10px]">Efeito:</strong> {synergy.effect}</p>
                            {synergy.target && (
                              <p className="text-xs text-gold/60"><strong className="text-gold/40 uppercase tracking-tighter mr-1 text-[10px]">Alvo:</strong> {synergy.target}</p>
                            )}
                          </div>
                          {synergy.observations && (
                            <p className="text-[10px] text-gold/40 italic border-t border-gold/5 pt-1.5">
                              {synergy.observations}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gold/20 italic">Nenhuma sinergia cadastrada.</p>
                  )}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Descrição e Táticas" icon={Info}>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-black/30 border border-gold/10 rounded-xl space-y-1.5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/50">Táticas de Combate</h4>
                      <p className="text-xs sm:text-sm text-gold/70 leading-relaxed italic">{monster.tactics || 'Nenhuma tática registrada.'}</p>
                    </div>
                    <div className="p-3.5 bg-black/30 border border-gold/10 rounded-xl space-y-1.5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/50">Comportamento</h4>
                      <p className="text-xs sm:text-sm text-gold/70 leading-relaxed">{monster.behavior || 'Nenhum comportamento registrado.'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-black/30 border border-gold/10 rounded-xl space-y-1.5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/50">Lore / História</h4>
                      <p className="text-xs sm:text-sm text-gold/70 leading-relaxed">{monster.lore || 'Nenhuma história registrada.'}</p>
                    </div>
                    <div className="p-3.5 bg-black/30 border border-gold/10 rounded-xl space-y-1.5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/50">Descrição Geral</h4>
                      <p className="text-xs sm:text-sm text-gold/70 leading-relaxed">{monster.description || 'Nenhuma descrição registrada.'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gold/5">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/40">Tesouro</h4>
                      <p className="text-xs text-gold/70 leading-relaxed">{monster.treasure || 'Nenhum tesouro registrado.'}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gold/40">Notas do Mestre</h4>
                      <p className="text-xs text-gold/50 leading-relaxed italic">{monster.masterNotes || 'Nenhuma nota registrada.'}</p>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
