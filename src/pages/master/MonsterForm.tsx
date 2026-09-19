import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  Trash2, 
  Plus, 
  Skull, 
  Sword, 
  Shield, 
  Zap, 
  Heart, 
  Brain, 
  Wind, 
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Edit3,
  Search,
  AlertCircle,
  CheckCircle2,
  Info,
  Target,
  Flame,
  Droplets,
  Mountain,
  Sun,
  Moon,
  Skull as SkullIcon,
  Minus,
  Upload,
  Loader2,
  BookOpen,
  ShieldAlert,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { fetchStorageMonsterLibrary, StorageMonster } from '../../services/monsterStorageService';
import { MasterService } from '../../services/masterService';
import { NPC, MonsterAction, MonsterAbility } from '../../types/master';
import { Button } from '../../components/Button';
import { ComfyService } from '../../services/comfyService';
import { StorageService } from '../../services/storageService';
import { NumericStepper } from '../../components/NumericStepper';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { 
  AttackLibraryService, 
  ATTACK_CATEGORIES, 
  ATTACK_BASES, 
  ATTACK_STYLES, 
  ATTACK_INTENSITIES, 
  ATTACK_EFFECTS, 
  ATTACK_CRITICALS, 
  ATTACK_RANGES, 
  ATTACK_THEMES 
} from '../../services/attackLibraryService';
import { 
  SkillLibraryService, 
  ALL_SKILLS, 
  SKILL_INTENSITIES, 
  SKILL_RANGES, 
  SKILL_DURATIONS, 
  SKILL_RECHARGES, 
  SKILL_THEMES 
} from '../../services/skillLibraryService';

const MONSTER_TYPES = [
  'Animal', 'Construto', 'Espírito', 'Humanóide', 'Monstro', 'Morto-Vivo', 'Planta'
];

const MONSTER_SIZES = [
  'Minúsculo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal'
];

const MONSTER_NDS = [
  '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'
];

const MONSTER_RANKS = [
  'Lacaio', 'Solo', 'Elite', 'Chefe'
];

const MONSTER_THEMES = [
  'Nenhum', 'Fogo', 'Gelo', 'Relâmpago', 'Ácido', 'Trevas', 'Luz', 'Veneno'
];

const MONSTER_ROLES = [
  'Atacante', 'Tanque', 'Suporte', 'Controlador', 'Espião', 'Atirador', 'Mágico'
];

const MONSTER_ENVIRONMENTS = [
  'Florestas', 'Montanhas', 'Desertos', 'Pântanos', 'Planícies', 'Cidades', 'Cavernas', 'Subterrâneo', 'Aquático', 'Ártico', 'Qualquer'
];

const MONSTER_ORGANIZATIONS = [
  'Solitário', 'Par', 'Bando (3-6)', 'Grupo (7-12)', 'Horda (13+)', 'Sociedade'
];

const MOVEMENT_TYPES = [
  'Terrestre', 'Voo', 'Natação', 'Escavação', 'Escalada'
];

const DAMAGE_TYPES = [
  'Corte', 'Perfuração', 'Impacto', 'Fogo', 'Frio', 'Eletricidade', 'Ácido', 'Trevas', 'Luz', 'Essência', 'Veneno', 'Mental', 'Magia'
];

export interface MonsterFormProps {
  customCampaignId?: string;
  customMonsterId?: string;
  onSaveSuccess?: () => void;
  onCancel?: () => void;
  isEmbedded?: boolean;
}

export const MonsterForm: React.FC<MonsterFormProps> = ({
  customCampaignId,
  customMonsterId,
  onSaveSuccess,
  onCancel,
  isEmbedded
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams<{ campaignId: string; monsterId: string }>();
  
  const campaignId = customCampaignId !== undefined ? customCampaignId : params.campaignId;
  const monsterId = customMonsterId !== undefined ? customMonsterId : params.monsterId;
  const isEditing = Boolean(monsterId && monsterId !== 'new');

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Storage Library Modal State
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [storageMonsters, setStorageMonsters] = useState<StorageMonster[]>([]);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [libraryFilter, setLibraryFilter] = useState('');

  // Image Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [visualPrompt, setVisualPrompt] = useState('');
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [editMode, setEditMode] = useState<'simple' | 'advanced'>('simple');
  const [formData, setFormData] = useState<Partial<NPC>>({
    name: '',
    race: 'Monstro', // Type
    subtype: '',
    theme: 'Nenhum',
    size: 'Médio',
    origin: '',
    environment: '',
    organization: '',
    tags: [],
    role: 'Solo',
    nd: '1',
    rank: 'Lacaio',
    description: '',
    personality: '', // Used for tactics/lore
    attitude: 'hostile',
    category: 'monster',
    campaignId: campaignId || '',
    isFavorite: false,
    isImportant: false,
    imageUrl: null,
    initiative: 0,
    speed: '9m',
    perception: 0,
    resistances: '',
    immunities: '',
    vulnerabilities: '',
    treasure: '',
    lore: '',
    behavior: '',
    masterNotes: '',
    stats: {
      hp: 10,
      mp: 0,
      ac: 10,
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
    },
    actions: [],
    weaknesses: [],
    advantages: [],
    combatProfile: {
      name: 'Equilibrado',
      description: 'Uma criatura com estatísticas balanceadas.'
    },
    synergy: {
      name: '',
      effect: ''
    }
  });

  // Local state for lists to make editing easier
  const [actions, setActions] = useState<MonsterAction[]>([]);
  const [abilities, setAbilities] = useState<MonsterAbility[]>([]);
  const [synergies, setSynergies] = useState<any[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [advantages, setAdvantages] = useState<string[]>([]);

  // Guided parameters for Simple Mode
  const [actionParams, setActionParams] = useState<Record<number, any>>({});
  const [abilityParams, setAbilityParams] = useState<Record<number, any>>({});

  useEffect(() => {
    if (isEditing && user) {
      const fetchMonster = async () => {
        try {
          const data = await MasterService.getNPC(monsterId);
          if (data) {
            // Normalize data to ensure stats object is populated correctly
            const normalized = {
              ...data,
              stats: {
                hp: data.stats?.hp ?? (data as any).hp ?? 10,
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
            };
            
            setFormData(normalized);
            setVisualPrompt(data.visualPrompt || '');
            
            if (data.abilities || (data as any).specialAbilities) {
              const abs = (data.abilities || (data as any).specialAbilities || []).map((a: any) => ({
                name: a.name || '',
                description: a.description || a.effect || '',
                type: a.type || 'Ação',
                cost: a.cost || '',
                range: a.range || '',
                cooldown: a.cooldown || '',
                condition: a.condition || '',
                duration: a.duration || '',
                observations: a.observations || ''
              }));
              setAbilities(abs);
            }
            
            // Parse actions if they exist
            if (data.actions || (data as any).attacks) {
              const parseAttackText = (text: string): any => {
                if (!text) return { name: 'Ataque', description: '' };
                const action: any = { name: 'Ataque', description: text, bonus: undefined, damage: undefined, type: '', critical: '', range: '', damageType: '', observations: '' };
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

                // Extract bonus
                const bonusMatch = workingText.match(/([+-]\d+)\s*(?:ataque|no ataque|de ataque)/i) || 
                                   workingText.match(/(?:ataque|bônus):\s*([+-]\d+)/i) ||
                                   workingText.match(/([+-]\d+)/);
                if (bonusMatch) {
                  const val = bonusMatch[1] || bonusMatch[0];
                  action.bonus = parseInt(val);
                }

                // Extract damage
                const damageMatch = workingText.match(/\|\s*([^|]+)\s*dano/i) || 
                                    workingText.match(/dano:\s*([^|]+)/i) ||
                                    workingText.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)/i);
                if (damageMatch) {
                  action.damage = (damageMatch[1] || damageMatch[0]).trim();
                }

                // Extract critical
                const critMatch = workingText.match(/Crítico:\s*([^|E\n]+)/i);
                if (critMatch) action.critical = critMatch[1].trim();

                // Extract effect
                const effectMatch = workingText.match(/Efeito:\s*([^|]+)/i);
                if (effectMatch) action.observations = effectMatch[1].trim();

                // Extract critical effect
                const critEffectMatch = workingText.match(/Efeito crítico:\s*([^|E]+)/i);
                if (critEffectMatch) {
                  const ce = critEffectMatch[1].trim();
                  action.observations = action.observations ? `${action.observations} | Crítico: ${ce}` : `Crítico: ${ce}`;
                }

                // Extract type
                if (workingText.toLowerCase().includes('corpo a corpo')) action.type = 'Corpo a corpo';
                else if (workingText.toLowerCase().includes('distância') || workingText.toLowerCase().includes('à distância')) action.type = 'Distância';
                else if (workingText.toLowerCase().includes('mágico')) action.type = 'Mágico';

                return action;
              };

              const parsedActions = (data.actions || (data as any).attacks || []).map((a: any) => {
                if (typeof a === 'string') return parseAttackText(a);
                
                const normalizedAction = { 
                  name: a.name || 'Ataque', 
                  description: a.description || '',
                  type: a.type || a.attackType || '',
                  bonus: a.bonus ?? a.attackBonus,
                  damage: a.damage || '',
                  critical: a.critical || a.crit || '',
                  range: a.range || '',
                  damageType: a.damageType || '',
                  observations: a.observations || a.effect || a.criticalEffect || ''
                };

                // Combine all text for parsing
                const fullText = `${normalizedAction.name} — ${normalizedAction.description} ${normalizedAction.observations}`.trim();

                // Aggressive fallback check
                const isBonusInvalid = normalizedAction.bonus === undefined || normalizedAction.bonus === 0;
                const isDamageInvalid = !normalizedAction.damage || normalizedAction.damage === '0' || normalizedAction.damage === '--' || normalizedAction.damage === '—';
                
                if ((isBonusInvalid || isDamageInvalid) && fullText) {
                  const parsed = parseAttackText(fullText);
                  
                  if (isBonusInvalid && parsed.bonus !== undefined && parsed.bonus !== 0) {
                    normalizedAction.bonus = parsed.bonus;
                  }
                  if (isDamageInvalid && parsed.damage && parsed.damage !== '0' && parsed.damage !== '--') {
                    normalizedAction.damage = parsed.damage;
                  }
                  if (!normalizedAction.type && parsed.type) normalizedAction.type = parsed.type;
                  if (!normalizedAction.critical && parsed.critical) normalizedAction.critical = parsed.critical;
                  if (!normalizedAction.range && parsed.range) normalizedAction.range = parsed.range;
                  if (parsed.observations && (!normalizedAction.observations || normalizedAction.observations.length < 5)) {
                    normalizedAction.observations = parsed.observations;
                  }
                }

                return normalizedAction;
              });
              setActions(parsedActions);
            }

            if ((data as any).synergies) {
              setSynergies((data as any).synergies);
            } else if (data.synergy) {
              setSynergies([data.synergy]);
            }
            
            setWeaknesses(data.weaknesses || []);
            setAdvantages(data.advantages || []);
          }
        } catch (err) {
          console.error('Error fetching monster:', err);
          setError('Não foi possível carregar os dados da criatura.');
        } finally {
          setLoading(false);
        }
      };
      fetchMonster();
    }
  }, [monsterId, isEditing, user]);

  // Pré-preenchimento vindo da Biblioteca de Monstros (via state ou query params)
  useEffect(() => {
    if (!isEditing) {
      const stateName = (location.state as any)?.name || searchParams.get('name');
      const stateImage = (location.state as any)?.imageUrl || searchParams.get('imageUrl');
      if (stateName || stateImage) {
        setFormData(prev => ({
          ...prev,
          ...(stateName ? { name: stateName } : {}),
          ...(stateImage ? { imageUrl: stateImage } : {})
        }));
        if (stateImage) {
          setTempImageUrl(stateImage);
        }
      }
    }
  }, [location.state, searchParams, isEditing]);

  const handleOpenLibrary = async () => {
    setIsLibraryModalOpen(true);
    if (storageMonsters.length === 0) {
      setLoadingStorage(true);
      setStorageError(null);
      try {
        const items = await fetchStorageMonsterLibrary();
        setStorageMonsters(items);
      } catch (err: any) {
        console.error('[MonsterForm] Erro ao carregar biblioteca do storage:', err);
        setStorageError(err?.message || 'Erro de permissão no Firebase Storage');
      } finally {
        setLoadingStorage(false);
      }
    }
  };

  const handleSelectFromLibrary = (monster: StorageMonster) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: monster.url,
      ...((!prev.name || prev.name.trim() === '') ? { name: monster.name } : {})
    }));
    setTempImageUrl(monster.url);
    setIsLibraryModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('stats.')) {
      const statName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        stats: {
          ...prev.stats!,
          [statName]: parseInt(value) || 0
        }
      }));
    } else if (name === 'initiative' || name === 'perception') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleActionChange = (index: number, field: keyof MonsterAction, value: string | number) => {
    const newActions = [...actions];
    const finalValue = field === 'bonus' ? parseInt(value as string) || 0 : value;
    newActions[index] = { ...newActions[index], [field]: finalValue } as MonsterAction;
    setActions(newActions);
  };

  const addAction = () => {
    setActions([...actions, { 
      name: 'Novo Ataque', 
      description: '', 
      type: 'Corpo-a-corpo', 
      bonus: 0,
      damage: '1d6', 
      critical: '20/x2',
      range: 'Curto',
      damageType: 'Corte',
      observations: ''
    }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const generateLibraryAttacks = () => {
    const newActions = AttackLibraryService.generateAttacks(
      formData.nd || '1',
      formData.theme || 'Nenhum',
      formData.rank || 'Lacaio'
    );
    setActions([...actions, ...newActions]);
  };

  const generateLibrarySkills = () => {
    const newAbilities = SkillLibraryService.generateSkills(
      formData.nd || '1',
      formData.theme || 'Nenhum',
      formData.rank || 'Lacaio'
    );
    setAbilities([...abilities, ...newAbilities]);
  };

  const handleActionParamChange = (index: number, param: string, value: string) => {
    const newParams = { ...actionParams[index], [param]: value };
    setActionParams({ ...actionParams, [index]: newParams });
    
    // Rebuild the action
    const newAction = AttackLibraryService.buildGuidedAttack({
      category: newParams.category || 'Corpo-a-corpo',
      base: newParams.base || 'Golpe',
      style: newParams.style || 'Brutal',
      intensity: newParams.intensity || 'Normal',
      effect: newParams.effect || 'Nenhum',
      critical: newParams.critical || '20 / x2',
      range: newParams.range || 'Corpo-a-corpo',
      theme: newParams.theme || 'Nenhum',
      nd: formData.nd || '1',
      rank: formData.rank || 'Lacaio'
    });
    
    const newActions = [...actions];
    newActions[index] = newAction;
    setActions(newActions);
  };

  const handleAbilityParamChange = (index: number, param: string, value: string) => {
    const newParams = { ...abilityParams[index], [param]: value };
    setAbilityParams({ ...abilityParams, [index]: newParams });
    
    // Rebuild the ability
    const newAbility = SkillLibraryService.buildGuidedSkill({
      baseName: newParams.baseName || 'Pele Resistente',
      intensity: newParams.intensity || 'Normal',
      range: newParams.range || 'Pessoal',
      duration: newParams.duration || 'Instantânea',
      recharge: newParams.recharge || 'Nenhuma',
      theme: newParams.theme || 'Nenhum'
    });
    
    const newAbilities = [...abilities];
    newAbilities[index] = newAbility;
    setAbilities(newAbilities);
  };

  const addAbility = () => {
    setAbilities([...abilities, { 
      name: 'Nova Habilidade', 
      description: '',
      type: 'Passiva',
      cost: '0 PM',
      cooldown: 'Nenhuma',
      condition: 'Nenhuma',
      range: 'Pessoal',
      observations: ''
    }]);
  };

  const handleAbilityChange = (index: number, field: keyof MonsterAbility, value: string | number) => {
    const newAbilities = [...abilities];
    newAbilities[index] = { ...newAbilities[index], [field]: value } as MonsterAbility;
    setAbilities(newAbilities);
  };

  const removeAbility = (index: number) => {
    setAbilities(abilities.filter((_, i) => i !== index));
  };

  const addWeakness = () => setWeaknesses([...weaknesses, '']);
  const updateWeakness = (index: number, value: string) => {
    const newW = [...weaknesses];
    newW[index] = value;
    setWeaknesses(newW);
  };
  const removeWeakness = (index: number) => setWeaknesses(weaknesses.filter((_, i) => i !== index));

  const addAdvantage = () => setAdvantages([...advantages, '']);
  const updateAdvantage = (index: number, value: string) => {
    const newA = [...advantages];
    newA[index] = value;
    setAdvantages(newA);
  };
  const removeAdvantage = (index: number) => setAdvantages(advantages.filter((_, i) => i !== index));

  const handleGenerateImage = async () => {
    if (!visualPrompt) {
      setError('Por favor, descreva a aparência da criatura para gerar a imagem.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    try {
      const result = await ComfyService.generateImage(visualPrompt);

      if (result) {
        setTempImageUrl(result);
      } else {
        throw new Error('Falha ao obter a URL da imagem gerada.');
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Erro ao gerar imagem. Verifique a conexão com o servidor de IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploadingImage(true);
      setError(null);
      const metadata = await StorageService.uploadFile(file, {
        category: 'monster',
        name: formData.name || file.name.replace(/\.[^/.]+$/, ''),
        relatedEntityId: monsterId
      });
      setTempImageUrl(null);
      setFormData(prev => ({ ...prev, imageUrl: metadata.url }));
    } catch (err) {
      console.error('Erro ao enviar imagem de monstro:', err);
      setError('Falha ao enviar imagem da criatura para o Firebase Storage.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.name) {
      setError('O nome da criatura é obrigatório.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let finalImageUrl = formData.imageUrl || null;

      // If we have a temporary image from generation, upload it to permanent storage
      if (tempImageUrl && (tempImageUrl.startsWith('http') || tempImageUrl.startsWith('data:') || tempImageUrl.startsWith('blob:'))) {
        const fileName = `monsters/${user.uid}/${Date.now()}.png`;
        finalImageUrl = await StorageService.uploadNpcImage(tempImageUrl, fileName);
      }

      const finalData: NPC = {
        ...formData as NPC,
        imageUrl: finalImageUrl,
        visualPrompt,
        actions: actions.map(a => ({
          ...a,
          bonus: a.bonus === undefined ? 0 : a.bonus
        })),
        weaknesses,
        advantages,
        abilities,
        synergies,
        updatedAt: new Date()
      };

      if (isEditing) {
        await MasterService.updateNPC(monsterId, finalData);
      } else {
        await MasterService.createNPC(user.uid, campaignId || null, finalData);
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSaveSuccess) {
          onSaveSuccess();
        } else {
          navigate(campaignId ? `/master/campaigns/${campaignId}/monsters` : '/master/monsters');
        }
      }, 1000);
    } catch (err) {
      console.error('Error saving monster:', err);
      setError('Erro ao salvar a criatura. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-12 h-12 text-gold animate-spin" />
        <p className="text-gold/60 font-cinzel italic">Invocando registros do Bestiário...</p>
      </div>
    );
  }

  return (
    <div className={`mx-auto animate-in fade-in duration-700 ${isEmbedded ? 'max-w-full px-2 py-2 pb-16' : 'max-w-6xl px-4 pb-32'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-gold/10 pb-8">
        <div className="space-y-2">
          <button 
            onClick={handleGoBack}
            className="group flex items-center gap-2 text-gold/40 hover:text-gold transition-all text-[10px] uppercase tracking-[0.3em] font-black mb-4"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gold/10 border border-gold/20">
              <Skull className="text-gold w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-cinzel text-gold-gradient font-black tracking-widest uppercase">
                  {isEditing ? 'Editar Criatura' : 'Nova Criatura'}
                </h1>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  editMode === 'simple' 
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                    : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                }`}>
                  Modo {editMode === 'simple' ? 'Simples' : 'Avançado'}
                </div>
              </div>
              <p className="text-gold/40 font-cinzel italic">
                {editMode === 'simple' 
                  ? 'Ajustes rápidos e controlados para sua criatura' 
                  : 'Customização total e profunda de cada detalhe do monstro'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <Button 
            variant="ghost" 
            onClick={() => setEditMode(editMode === 'simple' ? 'advanced' : 'simple')}
            icon={editMode === 'simple' ? Zap : Edit3}
            className="flex-1 md:flex-none border-gold/20 text-gold/60 hover:text-gold"
          >
            Mudar para {editMode === 'simple' ? 'Modo Avançado' : 'Modo Simples'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="flex-1 md:flex-none"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            icon={Save}
            className="flex-1 md:flex-none shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            {saving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Registrar no Bestiário')}
          </Button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium"
        >
          <AlertCircle size={20} />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 text-sm font-medium"
        >
          <CheckCircle2 size={20} />
          Criatura salva com sucesso! Redirecionando...
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image & Visuals */}
        <div className="lg:col-span-4 space-y-8">
          <section className="glass-card p-6 rounded-2xl border border-gold/10 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gold/60 flex items-center gap-2">
              <ImageIcon size={16} /> Representação Visual
            </h3>

            <div className="relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-gold/20 bg-black/40 group">
              {(tempImageUrl || formData.imageUrl) ? (
                <img 
                  src={tempImageUrl || formData.imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gold/10 space-y-4">
                  <Skull size={64} />
                  <p className="text-[10px] uppercase tracking-widest font-black">Sem Imagem</p>
                </div>
              )}
              
              {isGenerating && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <RefreshCw className="w-12 h-12 text-gold animate-spin" />
                  <div className="space-y-2 w-full">
                    <p className="text-gold font-cinzel text-sm animate-pulse">Tecendo a forma da criatura...</p>
                    <div className="h-1 w-full bg-gold/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 15 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Prompt Visual (IA)</label>
                <textarea 
                  value={visualPrompt}
                  onChange={(e) => setVisualPrompt(e.target.value)}
                  placeholder="Descreva a aparência da criatura para a IA..."
                  className="w-full bg-black/40 border border-gold/10 rounded-xl p-4 text-gold text-sm focus:outline-none focus:border-gold/40 min-h-[120px] resize-none font-cinzel"
                />
              </div>
              <div className="space-y-2">
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  onClick={handleGenerateImage}
                  disabled={isGenerating}
                  icon={Sparkles}
                >
                  {isGenerating ? 'Gerando...' : 'Gerar Imagem com IA'}
                </Button>

                <div className="pt-2 border-t border-gold/10 space-y-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full text-xs border border-gold/30 hover:border-gold text-gold bg-gold/5 hover:bg-gold/10"
                    onClick={handleOpenLibrary}
                    icon={BookOpen}
                  >
                    📚 Escolher da Biblioteca (monstro/)
                  </Button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    icon={uploadingImage ? Loader2 : Upload}
                  >
                    {uploadingImage ? 'Enviando ao Storage...' : 'Enviar Imagem do Arquivo'}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Identification Section */}
          <CollapsibleSection title="Identificação" icon={Info} defaultOpen={true}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Nome da Criatura</label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Dragão de Gelo"
                  className="w-full bg-black/40 border border-gold/10 rounded-xl p-4 text-gold text-lg font-cinzel focus:outline-none focus:border-gold/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Tipo</label>
                  {editMode === 'simple' ? (
                    <select 
                      name="race"
                      value={formData.race}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                    >
                      {MONSTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      name="race"
                      value={formData.race}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Subtipo</label>
                  <input 
                    type="text"
                    name="subtype"
                    value={formData.subtype}
                    onChange={handleInputChange}
                    placeholder="Ex: Elemental"
                    className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">ND</label>
                  {editMode === 'simple' ? (
                    <select 
                      name="nd"
                      value={formData.nd}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none text-center font-bold"
                    >
                      {MONSTER_NDS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      name="nd"
                      value={formData.nd}
                      onChange={handleInputChange}
                      placeholder="Ex: 5"
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40 text-center"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Tamanho</label>
                  {editMode === 'simple' ? (
                    <select 
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                    >
                      {MONSTER_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Rank</label>
                  {editMode === 'simple' ? (
                    <select 
                      name="rank"
                      value={formData.rank}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none uppercase tracking-widest font-black"
                    >
                      {MONSTER_RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      name="rank"
                      value={formData.rank}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Tema</label>
                  {editMode === 'simple' ? (
                    <select 
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                    >
                      {MONSTER_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Papel</label>
                  {editMode === 'simple' ? (
                    <select 
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                    >
                      <option value="">Selecione um papel...</option>
                      {MONSTER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      placeholder="Ex: Atacante"
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Origem</label>
                  <input 
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    placeholder="Ex: Arton"
                    className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Ambiente</label>
                  {editMode === 'simple' ? (
                    <select 
                      name="environment"
                      value={formData.environment}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                    >
                      <option value="">Selecione um ambiente...</option>
                      {MONSTER_ENVIRONMENTS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      name="environment"
                      value={formData.environment}
                      onChange={handleInputChange}
                      placeholder="Ex: Montanhas"
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Organização</label>
                  {editMode === 'simple' ? (
                    <select 
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                    >
                      <option value="">Selecione uma organização...</option>
                      {MONSTER_ORGANIZATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="Ex: Solitário"
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Tags (separadas por vírgula)</label>
                <input 
                  type="text"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                  placeholder="Ex: voador, gelo, perigoso"
                  className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Sinergias" icon={Zap}>
            <div className="space-y-6">
              {synergies.map((synergy, idx) => (
                <div key={idx} className="p-4 bg-gold/5 border border-gold/10 rounded-xl space-y-4 relative group">
                  <button 
                    onClick={() => setSynergies(synergies.filter((_, i) => i !== idx))}
                    className="absolute top-4 right-4 text-red-400/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Nome da Sinergia</label>
                      <input 
                        type="text"
                        value={synergy.name || ''}
                        onChange={(e) => {
                          const newS = [...synergies];
                          newS[idx] = { ...newS[idx], name: e.target.value };
                          setSynergies(newS);
                        }}
                        className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Tipo</label>
                      <input 
                        type="text"
                        value={synergy.type || ''}
                        onChange={(e) => {
                          const newS = [...synergies];
                          newS[idx] = { ...newS[idx], type: e.target.value };
                          setSynergies(newS);
                        }}
                        placeholder="Ex: Buff, Debuff, Suporte"
                        className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Condição de Ativação</label>
                      <input 
                        type="text"
                        value={synergy.condition || ''}
                        onChange={(e) => {
                          const newS = [...synergies];
                          newS[idx] = { ...newS[idx], condition: e.target.value };
                          setSynergies(newS);
                        }}
                        className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Alvo Afetado</label>
                      <input 
                        type="text"
                        value={synergy.target || ''}
                        onChange={(e) => {
                          const newS = [...synergies];
                          newS[idx] = { ...newS[idx], target: e.target.value };
                          setSynergies(newS);
                        }}
                        className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Efeito</label>
                    <textarea 
                      value={synergy.effect || ''}
                      onChange={(e) => {
                        const newS = [...synergies];
                        newS[idx] = { ...newS[idx], effect: e.target.value };
                        setSynergies(newS);
                      }}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40 min-h-[60px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Observações</label>
                    <input 
                      type="text"
                      value={synergy.observations || ''}
                      onChange={(e) => {
                        const newS = [...synergies];
                        newS[idx] = { ...newS[idx], observations: e.target.value };
                        setSynergies(newS);
                      }}
                      className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={() => setSynergies([...synergies, { name: '', condition: '', effect: '', target: '', type: '', observations: '' }])}
                className="w-full py-3 border border-dashed border-gold/20 rounded-xl text-gold/40 hover:text-gold hover:border-gold/40 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-black"
              >
                <Plus size={14} /> Adicionar Sinergia
              </button>
            </div>
          </CollapsibleSection>
        </div>

        {/* Right Column: Stats & Abilities */}
        <div className="lg:col-span-8 space-y-12">
          {/* Attributes Section */}
          <CollapsibleSection title="Atributos" icon={Brain} defaultOpen={true}>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { label: 'FOR', name: 'stats.str', icon: Sword, color: 'text-red-400' },
                { label: 'DES', name: 'stats.dex', icon: Wind, color: 'text-blue-400' },
                { label: 'CON', name: 'stats.con', icon: Heart, color: 'text-green-400' },
                { label: 'INT', name: 'stats.int', icon: Brain, color: 'text-purple-400' },
                { label: 'SAB', name: 'stats.wis', icon: Sun, color: 'text-yellow-400' },
                { label: 'CAR', name: 'stats.cha', icon: Moon, color: 'text-pink-400' },
              ].map((attr) => (
                <div key={attr.label} className="glass-card p-4 rounded-xl border border-gold/10 flex flex-col items-center gap-2 group hover:border-gold/30 transition-all">
                  <attr.icon size={16} className={`${attr.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                  <span className="text-[10px] font-black text-gold/40 tracking-widest">{attr.label}</span>
                  <NumericStepper
                    value={(formData.stats as any)[attr.name.split('.')[1]]}
                    onChange={(val) => {
                      const statName = attr.name.split('.')[1];
                      setFormData(prev => ({
                        ...prev,
                        stats: {
                          ...prev.stats!,
                          [statName]: val
                        }
                      }));
                    }}
                    min={-10}
                    max={99}
                    size="sm"
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Combat Stats Section */}
          <CollapsibleSection title="Estatísticas de Combate" icon={Shield} defaultOpen={true}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-card p-4 rounded-xl border border-gold/10 flex flex-col gap-2 group hover:border-gold/30 transition-all">
                <div className="flex items-center gap-2 text-red-400">
                  <Heart size={16} />
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">PV</label>
                </div>
                <NumericStepper
                  value={formData.stats?.hp || 0}
                  onChange={(val) => setFormData(prev => ({ ...prev, stats: { ...prev.stats!, hp: val } }))}
                  min={0}
                  max={9999}
                  size="md"
                  className="w-full"
                />
              </div>

              <div className="glass-card p-4 rounded-xl border border-gold/10 flex flex-col gap-2 group hover:border-gold/30 transition-all">
                <div className="flex items-center gap-2 text-blue-400">
                  <Zap size={16} />
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">PM</label>
                </div>
                <NumericStepper
                  value={formData.stats?.mp || 0}
                  onChange={(val) => setFormData(prev => ({ ...prev, stats: { ...prev.stats!, mp: val } }))}
                  min={0}
                  max={9999}
                  size="md"
                  className="w-full"
                />
              </div>

              <div className="glass-card p-4 rounded-xl border border-gold/10 flex flex-col gap-2 group hover:border-gold/30 transition-all">
                <div className="flex items-center gap-2 text-gold">
                  <Shield size={16} />
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Defesa</label>
                </div>
                <NumericStepper
                  value={formData.stats?.ac || 0}
                  onChange={(val) => setFormData(prev => ({ ...prev, stats: { ...prev.stats!, ac: val } }))}
                  min={0}
                  max={99}
                  size="md"
                  className="w-full"
                />
              </div>

              <div className="glass-card p-4 rounded-xl border border-gold/10 flex flex-col gap-2 group hover:border-gold/30 transition-all">
                <div className="flex items-center gap-2 text-gold/60">
                  <Zap size={16} />
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Iniciativa</label>
                </div>
                <NumericStepper
                  value={formData.initiative || 0}
                  onChange={(val) => setFormData(prev => ({ ...prev, initiative: val }))}
                  min={-10}
                  max={99}
                  size="md"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-card p-4 rounded-xl border border-gold/10 flex flex-col gap-2 group hover:border-gold/30 transition-all">
                <div className="flex items-center gap-2 text-gold/60">
                  <Wind size={16} />
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Deslocamento</label>
                </div>
                {editMode === 'simple' ? (
                  <div className="flex gap-2 items-center">
                    <NumericStepper
                      value={parseInt(formData.speed?.match(/\d+/)?.[0] || '9')}
                      onChange={(val) => {
                        const type = formData.speed?.includes(' ') ? formData.speed.split(' ')[0] : 'Terrestre';
                        setFormData(prev => ({ ...prev, speed: `${type} ${val}m` }));
                      }}
                      min={0}
                      max={99}
                      step={3}
                      size="sm"
                      className="w-24"
                    />
                    <select 
                      value={formData.speed?.split(' ')[0] || 'Terrestre'}
                      onChange={(e) => {
                        const val = formData.speed?.match(/\d+/)?.[0] || '9';
                        setFormData(prev => ({ ...prev, speed: `${e.target.value} ${val}m` }));
                      }}
                      className="bg-transparent text-xs text-gold focus:outline-none border-none appearance-none cursor-pointer"
                    >
                      {MOVEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ) : (
                  <input 
                    type="text"
                    name="speed"
                    value={formData.speed}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-xl font-medieval text-gold focus:outline-none"
                  />
                )}
              </div>

              <div className="glass-card p-4 rounded-xl border border-gold/10 flex flex-col gap-2 group hover:border-gold/30 transition-all">
                <div className="flex items-center gap-2 text-gold/60">
                  <Search size={16} />
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Percepção</label>
                </div>
                <NumericStepper
                  value={formData.perception || 0}
                  onChange={(val) => setFormData(prev => ({ ...prev, perception: val }))}
                  min={-10}
                  max={99}
                  size="md"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Resistências</label>
                {editMode === 'simple' ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select 
                        id="add-resistance-type"
                        className="flex-1 bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                        onChange={(e) => {
                          if (e.target.value) {
                            const current = formData.resistances ? formData.resistances.split(',').map(s => s.trim()).filter(s => s) : [];
                            if (!current.some(s => s.startsWith(e.target.value))) {
                              const newValue = [...current, `${e.target.value} 5`].join(', ');
                              setFormData({ ...formData, resistances: newValue });
                            }
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">+ Adicionar Resistência</option>
                        {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.resistances?.split(',').map(s => s.trim()).filter(s => s).map((res, i) => {
                        const [type, val] = res.split(' ');
                        return (
                          <div key={i} className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-3 py-1">
                            <span className="text-[10px] text-gold font-bold">{type}</span>
                            <input 
                              type="number" 
                              value={val || 0}
                              onChange={(e) => {
                                const current = formData.resistances?.split(',').map(s => s.trim()).filter(s => s) || [];
                                current[i] = `${type} ${e.target.value}`;
                                setFormData({ ...formData, resistances: current.join(', ') });
                              }}
                              className="w-8 bg-transparent text-[10px] text-white font-bold focus:outline-none text-center"
                            />
                            <button 
                              onClick={() => {
                                const current = formData.resistances?.split(',').map(s => s.trim()).filter(s => s) || [];
                                current.splice(i, 1);
                                setFormData({ ...formData, resistances: current.join(', ') });
                              }}
                              className="text-gold/40 hover:text-red-400"
                            >
                              <Minus size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <input 
                    type="text"
                    name="resistances"
                    value={formData.resistances}
                    onChange={handleInputChange}
                    placeholder="Ex: Fogo 10"
                    className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                  />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Imunidades</label>
                {editMode === 'simple' ? (
                  <div className="space-y-2">
                    <select 
                      className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                      onChange={(e) => {
                        if (e.target.value) {
                          const current = formData.immunities ? formData.immunities.split(',').map(s => s.trim()).filter(s => s) : [];
                          if (!current.includes(e.target.value)) {
                            const newValue = [...current, e.target.value].join(', ');
                            setFormData({ ...formData, immunities: newValue });
                          }
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">+ Adicionar Imunidade</option>
                      {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {formData.immunities?.split(',').map(s => s.trim()).filter(s => s).map((imm, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-3 py-1">
                          <span className="text-[10px] text-gold font-bold">{imm}</span>
                          <button 
                            onClick={() => {
                              const current = formData.immunities?.split(',').map(s => s.trim()).filter(s => s) || [];
                              current.splice(i, 1);
                              setFormData({ ...formData, immunities: current.join(', ') });
                            }}
                            className="text-gold/40 hover:text-red-400"
                          >
                            <Minus size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <input 
                    type="text"
                    name="immunities"
                    value={formData.immunities}
                    onChange={handleInputChange}
                    placeholder="Ex: Veneno"
                    className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                  />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Vulnerabilidades</label>
                {editMode === 'simple' ? (
                  <div className="space-y-2">
                    <select 
                      className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                      onChange={(e) => {
                        if (e.target.value) {
                          const current = formData.vulnerabilities ? formData.vulnerabilities.split(',').map(s => s.trim()).filter(s => s) : [];
                          if (!current.includes(e.target.value)) {
                            const newValue = [...current, e.target.value].join(', ');
                            setFormData({ ...formData, vulnerabilities: newValue });
                          }
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">+ Adicionar Vulnerabilidade</option>
                      {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {formData.vulnerabilities?.split(',').map(s => s.trim()).filter(s => s).map((vul, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-3 py-1">
                          <span className="text-[10px] text-gold font-bold">{vul}</span>
                          <button 
                            onClick={() => {
                              const current = formData.vulnerabilities?.split(',').map(s => s.trim()).filter(s => s) || [];
                              current.splice(i, 1);
                              setFormData({ ...formData, vulnerabilities: current.join(', ') });
                            }}
                            className="text-gold/40 hover:text-red-400"
                          >
                            <Minus size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <input 
                    type="text"
                    name="vulnerabilities"
                    value={formData.vulnerabilities}
                    onChange={handleInputChange}
                    placeholder="Ex: Gelo"
                    className="w-full bg-black/40 border border-gold/10 rounded-xl p-3 text-gold text-xs focus:outline-none focus:border-gold/40"
                  />
                )}
              </div>
            </div>
          </CollapsibleSection>

          {/* Abilities Section */}
          <CollapsibleSection 
            title="Habilidades Especiais" 
            icon={Zap}
            headerActions={
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={Sparkles} 
                  onClick={generateLibrarySkills}
                  className="text-gold/60 hover:text-gold"
                >
                  Gerar
                </Button>
                <Button variant="ghost" size="sm" icon={Plus} onClick={addAbility}>Adicionar</Button>
              </div>
            }
          >
            <div className="space-y-4">
              {abilities.map((ability, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-6 rounded-xl border border-gold/10 space-y-4 relative group"
                >
                  <button 
                    onClick={() => removeAbility(idx)}
                    className="absolute top-4 right-4 text-gold/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Habilidade Base</label>
                        {editMode === 'simple' ? (
                          <div className="flex gap-2">
                            <select 
                              value={abilityParams[idx]?.baseName || ability.name}
                              onChange={(e) => handleAbilityParamChange(idx, 'baseName', e.target.value)}
                              className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-sm focus:outline-none focus:border-gold/40 appearance-none"
                            >
                              <option value="">Selecione uma habilidade...</option>
                              {ALL_SKILLS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                            </select>
                            {!abilityParams[idx] && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setAbilityParams({ ...abilityParams, [idx]: { baseName: ability.name } })}
                                className="text-[8px] px-2"
                              >
                                Ativar Guia
                              </Button>
                            )}
                          </div>
                        ) : (
                          <input 
                            type="text"
                            value={ability.name}
                            onChange={(e) => handleAbilityChange(idx, 'name', e.target.value)}
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-sm focus:outline-none focus:border-gold/40"
                          />
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Intensidade</label>
                        {editMode === 'simple' ? (
                          <select 
                            value={abilityParams[idx]?.intensity || 'Normal'}
                            onChange={(e) => handleAbilityParamChange(idx, 'intensity', e.target.value)}
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                          >
                            {SKILL_INTENSITIES.map(i => <option key={i} value={i}>{i}</option>)}
                          </select>
                        ) : (
                          <input 
                            type="text"
                            value={ability.type}
                            onChange={(e) => handleAbilityChange(idx, 'type', e.target.value)}
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40"
                          />
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Tema</label>
                        {editMode === 'simple' ? (
                          <select 
                            value={abilityParams[idx]?.theme || 'Nenhum'}
                            onChange={(e) => handleAbilityParamChange(idx, 'theme', e.target.value)}
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                          >
                            {SKILL_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        ) : (
                          <input 
                            type="text"
                            value={ability.cost}
                            onChange={(e) => handleAbilityChange(idx, 'cost', e.target.value)}
                            placeholder="Ex: 2 PM"
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40"
                          />
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Recarga</label>
                        {editMode === 'simple' ? (
                          <select 
                            value={abilityParams[idx]?.recharge || ability.cooldown}
                            onChange={(e) => handleAbilityParamChange(idx, 'recharge', e.target.value)}
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                          >
                            {SKILL_RECHARGES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        ) : (
                          <input 
                            type="text"
                            value={ability.cooldown}
                            onChange={(e) => handleAbilityChange(idx, 'cooldown', e.target.value)}
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40"
                          />
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Alcance</label>
                        {editMode === 'simple' ? (
                          <select 
                            value={abilityParams[idx]?.range || ability.range}
                            onChange={(e) => handleAbilityParamChange(idx, 'range', e.target.value)}
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                          >
                            {SKILL_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        ) : (
                          <input 
                            type="text"
                            value={ability.range}
                            onChange={(e) => handleAbilityChange(idx, 'range', e.target.value)}
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40"
                          />
                        )}
                      </div>
                    </div>

                    {editMode === 'simple' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Duração</label>
                          <select 
                            value={abilityParams[idx]?.duration || 'Instantânea'}
                            onChange={(e) => handleAbilityParamChange(idx, 'duration', e.target.value)}
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                          >
                            {SKILL_DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <div className="p-4 bg-gold/5 rounded-lg border border-gold/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gold/40 mb-1">Preview do Efeito</p>
                          <p className="text-xs text-gold/80 italic">{ability.observations}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Condição de Uso</label>
                          <input 
                            type="text"
                            value={ability.condition}
                            onChange={(e) => handleAbilityChange(idx, 'condition', e.target.value)}
                            placeholder="Ex: Quando sofrer dano"
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Observações</label>
                          <input 
                            type="text"
                            value={ability.observations}
                            onChange={(e) => handleAbilityChange(idx, 'observations', e.target.value)}
                            placeholder="Notas rápidas..."
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">
                        {editMode === 'simple' ? 'Descrição da Habilidade' : 'Descrição Completa'}
                      </label>
                      <textarea 
                        value={ability.description}
                        onChange={(e) => handleAbilityChange(idx, 'description', e.target.value)}
                        readOnly={editMode === 'simple'}
                        className={`w-full bg-black/40 border border-gold/10 rounded-lg p-3 text-gold text-xs focus:outline-none focus:border-gold/40 min-h-[80px] resize-none ${editMode === 'simple' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
              {abilities.length === 0 && (
                <div className="p-8 border-2 border-dashed border-gold/10 rounded-xl text-center">
                  <p className="text-gold/20 font-cinzel italic">Nenhuma habilidade especial registrada.</p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Attacks Section */}
          <CollapsibleSection 
            title="Ataques e Ações" 
            icon={Sword}
            headerActions={
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={Sparkles} 
                  onClick={generateLibraryAttacks}
                  className="text-gold/60 hover:text-gold"
                >
                  Gerar
                </Button>
                <Button variant="ghost" size="sm" icon={Plus} onClick={addAction}>Adicionar</Button>
              </div>
            }
          >
            <div className="space-y-4">
              {actions.map((action, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-6 rounded-xl border border-gold/10 space-y-4 relative group"
                >
                  <button 
                    onClick={() => removeAction(idx)}
                    className="absolute top-4 right-4 text-gold/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Base do Ataque</label>
                      {editMode === 'simple' ? (
                        <div className="flex gap-2">
                          <select 
                            value={actionParams[idx]?.base || action.name}
                            onChange={(e) => handleActionParamChange(idx, 'base', e.target.value)}
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-sm focus:outline-none focus:border-gold/40 appearance-none"
                          >
                            <option value="">Selecione uma base...</option>
                            {ATTACK_BASES.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                          {!actionParams[idx] && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setActionParams({ ...actionParams, [idx]: { base: action.name } })}
                              className="text-[8px] px-2"
                            >
                              Ativar Guia
                            </Button>
                          )}
                        </div>
                      ) : (
                        <input 
                          type="text"
                          value={action.name}
                          onChange={(e) => handleActionChange(idx, 'name', e.target.value)}
                          className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-sm focus:outline-none focus:border-gold/40"
                        />
                      )}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      {editMode === 'simple' ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Estilo</label>
                          <select 
                            value={actionParams[idx]?.style || 'Brutal'}
                            onChange={(e) => handleActionParamChange(idx, 'style', e.target.value)}
                            className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                          >
                            {ATTACK_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      ) : (
                        <NumericStepper
                          label="Bônus"
                          value={action.bonus || 0}
                          onChange={(val) => handleActionChange(idx, 'bonus', val)}
                          min={-10}
                          max={99}
                          size="sm"
                          className="w-full"
                        />
                      )}
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Intensidade</label>
                      {editMode === 'simple' ? (
                        <select 
                          value={actionParams[idx]?.intensity || 'Normal'}
                          onChange={(e) => handleActionParamChange(idx, 'intensity', e.target.value)}
                          className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                        >
                          {ATTACK_INTENSITIES.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      ) : (
                        <input 
                          type="text"
                          value={action.damage}
                          onChange={(e) => handleActionChange(idx, 'damage', e.target.value)}
                          className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-sm focus:outline-none focus:border-gold/40 text-center"
                        />
                      )}
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Crítico</label>
                      {editMode === 'simple' ? (
                        <select 
                          value={actionParams[idx]?.critical || action.critical}
                          onChange={(e) => handleActionParamChange(idx, 'critical', e.target.value)}
                          className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                        >
                          {ATTACK_CRITICALS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <input 
                          type="text"
                          value={action.critical}
                          onChange={(e) => handleActionChange(idx, 'critical', e.target.value)}
                          className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-sm focus:outline-none focus:border-gold/40 text-center"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Categoria</label>
                      {editMode === 'simple' ? (
                        <select 
                          value={actionParams[idx]?.category || action.type}
                          onChange={(e) => handleActionParamChange(idx, 'category', e.target.value)}
                          className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                        >
                          {ATTACK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <select 
                          value={action.type}
                          onChange={(e) => handleActionChange(idx, 'type', e.target.value)}
                          className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                        >
                          <option value="Corpo-a-corpo">Corpo-a-corpo</option>
                          <option value="À Distância">À Distância</option>
                          <option value="Área">Área</option>
                          <option value="Mágico">Mágico</option>
                        </select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Alcance</label>
                      {editMode === 'simple' ? (
                        <select 
                          value={actionParams[idx]?.range || action.range}
                          onChange={(e) => handleActionParamChange(idx, 'range', e.target.value)}
                          className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                        >
                          {ATTACK_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <select 
                          value={action.range}
                          onChange={(e) => handleActionChange(idx, 'range', e.target.value)}
                          className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                        >
                          <option value="Toque">Toque</option>
                          <option value="Curto">Curto</option>
                          <option value="Médio">Médio</option>
                          <option value="Longo">Longo</option>
                          <option value="Ilimitado">Ilimitado</option>
                        </select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Tema</label>
                      {editMode === 'simple' ? (
                        <select 
                          value={actionParams[idx]?.theme || 'Nenhum'}
                          onChange={(e) => handleActionParamChange(idx, 'theme', e.target.value)}
                          className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                        >
                          {ATTACK_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ) : (
                        <select 
                          value={action.damageType}
                          onChange={(e) => handleActionChange(idx, 'damageType', e.target.value)}
                          className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                        >
                          <option value="Corte">Corte</option>
                          <option value="Perfuração">Perfuração</option>
                          <option value="Impacto">Impacto</option>
                          <option value="Fogo">Fogo</option>
                          <option value="Frio">Frio</option>
                          <option value="Eletricidade">Eletricidade</option>
                          <option value="Ácido">Ácido</option>
                          <option value="Trevas">Trevas</option>
                          <option value="Luz">Luz</option>
                          <option value="Essência">Essência</option>
                          <option value="Veneno">Veneno</option>
                          <option value="Mental">Mental</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {editMode === 'simple' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Efeito</label>
                        <select 
                          value={actionParams[idx]?.effect || 'Nenhum'}
                          onChange={(e) => handleActionParamChange(idx, 'effect', e.target.value)}
                          className="w-full bg-black/40 border border-gold/10 rounded-lg p-2 text-gold text-xs focus:outline-none focus:border-gold/40 appearance-none"
                        >
                          {ATTACK_EFFECTS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2 p-4 bg-gold/5 rounded-lg border border-gold/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gold/40 mb-1">Preview do Ataque</p>
                        <div className="flex gap-4 text-xs">
                          <span className="text-gold">Ataque: <strong className="text-white">+{action.bonus}</strong></span>
                          <span className="text-gold">Dano: <strong className="text-white">{action.damage}</strong> ({action.damageType})</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">
                      {editMode === 'simple' ? 'Descrição e Efeitos' : 'Efeitos e Observações'}
                    </label>
                    <textarea 
                      value={action.description}
                      onChange={(e) => handleActionChange(idx, 'description', e.target.value)}
                      readOnly={editMode === 'simple'}
                      className={`w-full bg-black/40 border border-gold/10 rounded-lg p-3 text-gold text-xs focus:outline-none focus:border-gold/40 min-h-[60px] resize-none ${editMode === 'simple' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </motion.div>
              ))}
              {actions.length === 0 && (
                <div className="p-8 border-2 border-dashed border-gold/10 rounded-xl text-center">
                  <p className="text-gold/20 font-cinzel italic">Nenhum ataque registrado. Adicione um para combate.</p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Weaknesses & Advantages */}
          <CollapsibleSection title="Fraquezas e Vantagens" icon={Shield}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-cinzel text-red-400/60 tracking-[0.2em] font-bold uppercase flex items-center gap-3">
                    <Target size={20} /> Fraquezas
                  </h3>
                  <Button variant="ghost" size="sm" icon={Plus} onClick={addWeakness}>Adicionar</Button>
                </div>
                <div className="space-y-3">
                  {weaknesses.map((w, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text"
                        value={w}
                        onChange={(e) => updateWeakness(idx, e.target.value)}
                        className="flex-1 bg-black/40 border border-red-500/20 rounded-lg p-2 text-red-400 text-xs focus:outline-none focus:border-red-500/40"
                      />
                      <button onClick={() => removeWeakness(idx)} className="text-red-500/40 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-cinzel text-green-400/60 tracking-[0.2em] font-bold uppercase flex items-center gap-3">
                    <Shield size={20} /> Vantagens
                  </h3>
                  <Button variant="ghost" size="sm" icon={Plus} onClick={addAdvantage}>Adicionar</Button>
                </div>
                <div className="space-y-3">
                  {advantages.map((a, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text"
                        value={a}
                        onChange={(e) => updateAdvantage(idx, e.target.value)}
                        className="flex-1 bg-black/40 border border-green-500/20 rounded-lg p-2 text-green-400 text-xs focus:outline-none focus:border-green-500/40"
                      />
                      <button onClick={() => removeAdvantage(idx)} className="text-green-500/40 hover:text-green-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Description & Tactics */}
          <CollapsibleSection title="Descrição e Táticas" icon={Info}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Táticas de Combate</label>
                  <textarea 
                    name="tactics"
                    value={formData.tactics || ''}
                    onChange={handleInputChange}
                    placeholder="Como esta criatura se comporta em batalha?"
                    className="w-full bg-black/40 border border-gold/10 rounded-xl p-4 text-gold text-sm focus:outline-none focus:border-gold/40 min-h-[120px] font-cinzel"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Comportamento</label>
                  <textarea 
                    name="behavior"
                    value={formData.behavior || ''}
                    onChange={handleInputChange}
                    placeholder="Hábitos, temperamento e reações..."
                    className="w-full bg-black/40 border border-gold/10 rounded-xl p-4 text-gold text-sm focus:outline-none focus:border-gold/40 min-h-[120px] font-cinzel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Lore / História</label>
                  <textarea 
                    name="lore"
                    value={formData.lore || ''}
                    onChange={handleInputChange}
                    placeholder="A origem e lendas sobre esta criatura..."
                    className="w-full bg-black/40 border border-gold/10 rounded-xl p-4 text-gold text-sm focus:outline-none focus:border-gold/40 min-h-[120px] font-cinzel"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Descrição Geral</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Aparência física e detalhes sensoriais..."
                    className="w-full bg-black/40 border border-gold/10 rounded-xl p-4 text-gold text-sm focus:outline-none focus:border-gold/40 min-h-[120px] font-cinzel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Tesouro</label>
                  <textarea 
                    name="treasure"
                    value={formData.treasure || ''}
                    onChange={handleInputChange}
                    placeholder="O que pode ser saqueado desta criatura?"
                    className="w-full bg-black/40 border border-gold/10 rounded-xl p-4 text-gold text-sm focus:outline-none focus:border-gold/40 min-h-[100px] font-cinzel"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold/40">Notas do Mestre (Privado)</label>
                  <textarea 
                    name="masterNotes"
                    value={formData.masterNotes || ''}
                    onChange={handleInputChange}
                    placeholder="Segredos, ganchos de aventura e observações internas..."
                    className="w-full bg-black/40 border border-gold/10 rounded-xl p-4 text-gold text-sm focus:outline-none focus:border-gold/40 min-h-[100px] font-cinzel italic"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {/* Modal da Biblioteca de Monstros (Firebase Storage monstro/) */}
      <AnimatePresence>
        {isLibraryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-mythos-bg border-2 border-gold/40 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gold/20 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-cinzel font-black text-gold uppercase tracking-wider">
                      Biblioteca de Monstros
                    </h3>
                    <p className="text-xs text-gold/60 font-cinzel">
                      Imagens da pasta <code className="text-amber-300 font-mono">monstro/</code> no Firebase Storage
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLibraryModalOpen(false)}
                  className="p-2 text-gold/60 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="p-4 border-b border-gold/10 bg-black/20 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/40" size={16} />
                  <input
                    type="text"
                    placeholder="Filtrar criaturas pelo nome..."
                    value={libraryFilter}
                    onChange={(e) => setLibraryFilter(e.target.value)}
                    className="w-full bg-black/60 border border-gold/20 rounded-xl pl-10 pr-4 py-2 text-sm text-gold focus:outline-none focus:border-gold font-cinzel placeholder:text-gold/20"
                  />
                </div>
                <span className="text-xs text-gold/40 font-mono shrink-0">
                  {storageMonsters.length} {storageMonsters.length === 1 ? 'criatura' : 'criaturas'}
                </span>
              </div>

              {/* Modal Content / Grid */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {loadingStorage ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                    <RefreshCw className="w-10 h-10 text-gold animate-spin" />
                    <p className="text-gold/60 font-cinzel italic text-sm animate-pulse">
                      Carregando acervo de criaturas do Firebase Storage...
                    </p>
                  </div>
                ) : storageError ? (
                  <div className="py-12 px-4 max-w-lg mx-auto text-center space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow">
                      <ShieldAlert size={24} />
                    </div>
                    <div>
                      <h4 className="text-base font-cinzel font-bold text-amber-300">
                        Erro ao Acessar Biblioteca do Storage
                      </h4>
                      <p className="text-xs text-amber-200/90 mt-1.5 p-2 rounded bg-amber-950/40 border border-amber-500/20 font-mono break-words text-left">
                        {storageError}
                      </p>
                      <p className="text-xs text-gold/60 font-cinzel mt-2">
                        Verifique se o usuário possui permissão de leitura na pasta <code className="text-amber-300 font-mono">monstro/</code> no Firebase Console.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLoadingStorage(true);
                        setStorageError(null);
                        fetchStorageMonsterLibrary(true)
                          .then(setStorageMonsters)
                          .catch((err: any) => {
                            console.error('[MonsterForm] Erro ao recarregar storage:', err);
                            setStorageError(err?.message || 'Erro de permissão no Firebase Storage');
                          })
                          .finally(() => setLoadingStorage(false));
                      }}
                      className="px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/40 text-gold text-xs font-cinzel rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      <RefreshCw size={14} className={loadingStorage ? 'animate-spin' : ''} />
                      Tentar Novamente
                    </button>
                  </div>
                ) : storageMonsters.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <Skull className="w-12 h-12 text-gold/20 mx-auto" />
                    <p className="text-gold/60 font-cinzel font-bold">Nenhum arquivo .png encontrado na pasta monstro/</p>
                    <p className="text-xs text-gold/40 font-cinzel max-w-md mx-auto">
                      Certifique-se de que os arquivos .png foram enviados para a pasta monstro/ no Firebase Storage.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {storageMonsters
                      .filter(m => m.name.toLowerCase().includes(libraryFilter.toLowerCase()) || m.fileName.toLowerCase().includes(libraryFilter.toLowerCase()))
                      .map(monster => (
                        <div
                          key={monster.id}
                          onClick={() => handleSelectFromLibrary(monster)}
                          className="group relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-gold/20 hover:border-gold cursor-pointer transition-all hover:scale-[1.02] shadow-lg bg-black/40"
                        >
                          <img
                            src={monster.url}
                            alt={monster.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 inset-x-0 p-3">
                            <span className="inline-block px-1.5 py-0.5 rounded bg-black/80 border border-gold/30 text-[9px] font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1 shadow-sm">
                              MOSTRO • {(formData.rank || 'NORMAL').toUpperCase()} • {(formData.role || 'SOLO').toUpperCase()}
                            </span>
                            <p className="text-xs font-cinzel font-bold text-gold drop-shadow leading-tight line-clamp-2">
                              {monster.name}
                            </p>
                            <p className="text-[9px] text-gold/40 font-mono truncate mt-0.5">
                              {monster.fileName}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
