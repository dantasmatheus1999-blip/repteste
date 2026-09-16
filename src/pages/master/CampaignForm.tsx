import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  Castle, 
  ChevronLeft,
  Save,
  Trash2,
  X,
  Image as ImageIcon,
  Check,
  ChevronRight,
  BookOpen,
  Scroll,
  Shield,
  Users,
  Palette,
  Tag,
  Globe,
  Flame,
  Sword,
  Skull,
  Crown,
  Map as MapIcon,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { Campaign, NarrativeTone, CampaignStatus, CampaignVisibility } from '../../types/master';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { cn } from '../../lib/utils';

type Step = 'identity' | 'narrative' | 'organization' | 'settings';

export const CampaignForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [currentStep, setCurrentStep] = useState<Step>('identity');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Campaign>>({
    identity: {
      name: '',
      subtitle: '',
      shortDescription: '',
      fullDescription: '',
      system: 'Tormenta 20',
      setting: '',
      narrativeTone: 'heroico',
      coverUrl: '',
      bannerUrl: '',
    },
    status: {
      state: 'active',
      visibility: 'private',
      isFavorite: false,
      createdAt: null,
      updatedAt: null,
    },
    settings: {
      acceptsPlayers: false,
      playerLimit: 5,
      quickSessionMode: true,
      allowCharacterLinking: true,
      showAutomaticSummary: true,
    },
    narrative: {
      premise: '',
      mainObjective: '',
      centralConflicts: [],
      themes: [],
      factions: [],
      relevantDeities: [],
      importantRegions: [],
      centralDangers: [],
      narrativeNotes: '',
    },
    organization: {
      tags: [],
      themeColor: '#D4AF37',
      icon: 'scroll',
    }
  });

  useEffect(() => {
    if (isEditing && user) {
      const fetchCampaign = async () => {
        const campaign = await MasterService.getCampaign(id);
        if (campaign) {
          setFormData(campaign);
        }
        setLoading(false);
      };
      fetchCampaign();
    }
  }, [id, isEditing, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.identity?.name) return;

    setSaving(true);
    try {
      if (isEditing) {
        await MasterService.updateCampaign(id, formData);
      } else {
        await MasterService.createCampaign(user.uid, formData);
      }
      navigate('/master/campaigns');
    } catch (error) {
      console.error("Error saving campaign:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Tem certeza que deseja excluir esta campanha permanentemente?')) return;
    
    setDeleting(true);
    try {
      await MasterService.deleteCampaign(id);
      navigate('/master/campaigns');
    } catch (error) {
      console.error("Error deleting campaign:", error);
    } finally {
      setDeleting(false);
    }
  };

  const updateNestedField = (section: keyof Campaign, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const toggleArrayItem = (section: 'narrative' | 'organization', field: string, item: string) => {
    const currentArray = (formData[section] as any)[field] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateNestedField(section, field, newArray);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold shadow-glow"></div>
        <p className="text-gold/40 font-cinzel animate-pulse">Consultando os registros...</p>
      </div>
    );
  }

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: 'identity', label: 'Identidade', icon: BookOpen },
    { id: 'narrative', label: 'Narrativa', icon: Scroll },
    { id: 'organization', label: 'Organização', icon: Palette },
    { id: 'settings', label: 'Configurações', icon: Shield },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto px-4 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/master/campaigns')}
            className="group flex items-center gap-2 text-gold/40 hover:text-gold transition-colors text-[10px] uppercase tracking-[0.2em] font-bold mb-2"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar para Lista
          </button>
          <h2 className="text-4xl font-cinzel text-gold-gradient leading-none">
            {isEditing ? 'Ajustar Registros' : 'Novo Capítulo'}
          </h2>
          <p className="text-gold/40 text-sm italic mt-1">
            {isEditing ? 'Refine a essência da sua jornada épica.' : 'Inicie um novo tomo de aventuras no Mythos.'}
          </p>
        </div>

        {isEditing && (
          <Button 
            variant="secondary" 
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-500 hover:text-red-400 border-red-500/20 hover:border-red-500/40"
            icon={Trash2}
          >
            {deleting ? 'Excluindo...' : 'Excluir Campanha'}
          </Button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex bg-black/40 p-1.5 sm:p-2 rounded-2xl border border-gold/10 backdrop-blur-sm overflow-x-auto no-scrollbar">
        {steps.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(s.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all min-w-[130px] sm:min-w-[160px]",
              currentStep === s.id 
                ? "bg-gold/20 text-gold border border-gold/20 shadow-inner shadow-gold/5" 
                : "text-gold/20 hover:text-gold/40"
            )}
          >
            <s.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
            <div className="text-left">
              <p className="text-[7px] sm:text-[8px] uppercase tracking-widest font-bold opacity-50">Passo {idx + 1}</p>
              <p className="text-[10px] sm:text-xs font-cinzel font-bold truncate max-w-[80px] sm:max-w-none">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Identity */}
        {currentStep === 'identity' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
            <div className="md:col-span-2 space-y-6">
              <Card title="Essência da Campanha" icon={BookOpen}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Nome da Campanha</label>
                      <input 
                        type="text"
                        required
                        value={formData.identity?.name}
                        onChange={(e) => updateNestedField('identity', 'name', e.target.value)}
                        placeholder="Ex: O Despertar de Kallyadranoch"
                        className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Subtítulo (Opcional)</label>
                      <input 
                        type="text"
                        value={formData.identity?.subtitle}
                        onChange={(e) => updateNestedField('identity', 'subtitle', e.target.value)}
                        placeholder="Ex: Uma jornada por Arton"
                        className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Resumo Rápido</label>
                    <input 
                      type="text"
                      value={formData.identity?.shortDescription}
                      onChange={(e) => updateNestedField('identity', 'shortDescription', e.target.value)}
                      placeholder="Uma frase que define a campanha..."
                      className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Descrição Completa</label>
                    <textarea 
                      rows={6}
                      value={formData.identity?.fullDescription}
                      onChange={(e) => updateNestedField('identity', 'fullDescription', e.target.value)}
                      placeholder="Detalhe o mundo, a premissa e o que os jogadores podem esperar..."
                      className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all resize-none"
                    />
                  </div>
                </div>
              </Card>

              <Card title="Cenário e Sistema" icon={Globe}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Sistema de Jogo</label>
                    <input 
                      type="text"
                      value={formData.identity?.system}
                      onChange={(e) => updateNestedField('identity', 'system', e.target.value)}
                      placeholder="Ex: Tormenta 20, D&D 5e..."
                      className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Cenário / Mundo</label>
                    <input 
                      type="text"
                      value={formData.identity?.setting}
                      onChange={(e) => updateNestedField('identity', 'setting', e.target.value)}
                      placeholder="Ex: Arton, Forgotten Realms..."
                      className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all"
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Tom Narrativo" icon={Flame}>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                  {(['heroico', 'sombrio', 'político', 'épico', 'exploração', 'investigação', 'sobrevivência', 'guerra', 'humor', 'mistério'] as NarrativeTone[]).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => updateNestedField('identity', 'narrativeTone', tone)}
                      className={cn(
                        "flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-all text-left",
                        formData.identity?.narrativeTone === tone 
                          ? "bg-gold/20 border-gold text-gold shadow-inner shadow-gold/10" 
                          : "bg-black/20 border-gold/10 text-gold/40 hover:border-gold/30 hover:text-gold/60"
                      )}
                    >
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold capitalize truncate">{tone}</span>
                      {formData.identity?.narrativeTone === tone && <Check size={14} className="shrink-0" />}
                    </button>
                  ))}
                </div>
              </Card>

              <Card title="Visual" icon={ImageIcon}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">URL da Capa</label>
                    <input 
                      type="text"
                      value={formData.identity?.coverUrl}
                      onChange={(e) => updateNestedField('identity', 'coverUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">URL do Banner</label>
                    <input 
                      type="text"
                      value={formData.identity?.bannerUrl}
                      onChange={(e) => updateNestedField('identity', 'bannerUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all text-sm"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Narrative */}
        {currentStep === 'narrative' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
            <div className="md:col-span-2 space-y-6">
              <Card title="Premissa e Objetivos" icon={Scroll}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Premissa Central</label>
                    <textarea 
                      rows={4}
                      value={formData.narrative?.premise}
                      onChange={(e) => updateNestedField('narrative', 'premise', e.target.value)}
                      placeholder="O 'gancho' inicial da aventura..."
                      className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Objetivo Principal</label>
                    <textarea 
                      rows={3}
                      value={formData.narrative?.mainObjective}
                      onChange={(e) => updateNestedField('narrative', 'mainObjective', e.target.value)}
                      placeholder="O que os heróis buscam alcançar ao final?"
                      className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all resize-none"
                    />
                  </div>
                </div>
              </Card>

              <Card title="Notas de Narrativa" icon={Zap}>
                <textarea 
                  rows={10}
                  value={formData.narrative?.narrativeNotes}
                  onChange={(e) => updateNestedField('narrative', 'narrativeNotes', e.target.value)}
                  placeholder="Anotações livres sobre a trama, reviravoltas planejadas, etc..."
                  className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all resize-none"
                />
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Elementos da Trama" icon={Sword}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Conflitos Centrais</label>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text"
                        placeholder="Adicionar conflito..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              toggleArrayItem('narrative', 'centralConflicts', val);
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                        className="flex-1 bg-black/40 border border-gold/10 rounded-lg py-2 px-3 text-xs text-gold focus:outline-none focus:border-gold/40"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.narrative?.centralConflicts?.map(c => (
                        <span key={c} className="px-2 py-1 bg-gold/5 border border-gold/10 rounded text-[10px] text-gold/60 flex items-center gap-1">
                          {c} <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => toggleArrayItem('narrative', 'centralConflicts', c)} />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Temas</label>
                    <div className="flex flex-wrap gap-2">
                      {['Redenção', 'Sacrifício', 'Corrupção', 'Vingança', 'Esperança', 'Destino', 'Traição', 'Amizade'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleArrayItem('narrative', 'themes', t)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] border transition-all",
                            formData.narrative?.themes?.includes(t)
                              ? "bg-gold/20 border-gold text-gold"
                              : "bg-black/20 border-gold/10 text-gold/40 hover:border-gold/30"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Perigos Centrais</label>
                    <div className="flex flex-wrap gap-2">
                      {['Dragões', 'Mortos-Vivos', 'Demônios', 'Deuses', 'Fome', 'Guerra Civil', 'Praga', 'Magia Selvagem'].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleArrayItem('narrative', 'centralDangers', d)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] border transition-all",
                            formData.narrative?.centralDangers?.includes(d)
                              ? "bg-red-500/20 border-red-500 text-red-500"
                              : "bg-black/20 border-gold/10 text-gold/40 hover:border-gold/30"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gold/5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Facções e Grupos</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Adicionar facção..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                toggleArrayItem('narrative', 'factions', val);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                          className="flex-1 bg-black/40 border border-gold/10 rounded-lg py-2 px-3 text-xs text-gold focus:outline-none focus:border-gold/40"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.narrative?.factions?.map(f => (
                          <span key={f} className="px-2 py-1 bg-gold/5 border border-gold/10 rounded text-[10px] text-gold/60 flex items-center gap-1">
                            {f} <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => toggleArrayItem('narrative', 'factions', f)} />
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Divindades Relevantes</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Adicionar divindade..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                toggleArrayItem('narrative', 'relevantDeities', val);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                          className="flex-1 bg-black/40 border border-gold/10 rounded-lg py-2 px-3 text-xs text-gold focus:outline-none focus:border-gold/40"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.narrative?.relevantDeities?.map(d => (
                          <span key={d} className="px-2 py-1 bg-gold/5 border border-gold/10 rounded text-[10px] text-gold/60 flex items-center gap-1">
                            {d} <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => toggleArrayItem('narrative', 'relevantDeities', d)} />
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Regiões Importantes</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Adicionar região..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                toggleArrayItem('narrative', 'importantRegions', val);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                          className="flex-1 bg-black/40 border border-gold/10 rounded-lg py-2 px-3 text-xs text-gold focus:outline-none focus:border-gold/40"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.narrative?.importantRegions?.map(r => (
                          <span key={r} className="px-2 py-1 bg-gold/5 border border-gold/10 rounded text-[10px] text-gold/60 flex items-center gap-1">
                            {r} <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => toggleArrayItem('narrative', 'importantRegions', r)} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Organization */}
        {currentStep === 'organization' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
            <div className="md:col-span-2 space-y-6">
              <Card title="Tags e Categorização" icon={Tag}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Tags da Campanha</label>
                    <input 
                      type="text"
                      placeholder="Pressione Enter para adicionar tags..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            toggleArrayItem('organization', 'tags', val);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                      className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-all"
                    />
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.organization?.tags?.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-xs text-gold flex items-center gap-2">
                          #{tag}
                          <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => toggleArrayItem('organization', 'tags', tag)} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Personalização Visual" icon={Palette}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Cor Temática</label>
                    <div className="grid grid-cols-5 gap-3">
                      {['#D4AF37', '#EA4335', '#34A853', '#4285F4', '#9333EA', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#6B7280'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateNestedField('organization', 'themeColor', color)}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110",
                            formData.organization?.themeColor === color ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Ícone Representativo</label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { id: 'scroll', icon: Scroll },
                        { id: 'castle', icon: Castle },
                        { id: 'sword', icon: Sword },
                        { id: 'skull', icon: Skull },
                        { id: 'crown', icon: Crown },
                        { id: 'map', icon: MapIcon },
                        { id: 'zap', icon: Zap },
                        { id: 'shield', icon: Shield },
                      ].map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateNestedField('organization', 'icon', item.id)}
                          className={cn(
                            "w-12 h-12 rounded-lg border flex items-center justify-center transition-all",
                            formData.organization?.icon === item.id 
                              ? "bg-gold/20 border-gold text-gold" 
                              : "bg-black/20 border-gold/10 text-gold/20 hover:text-gold/40"
                          )}
                        >
                          <item.icon size={20} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-6 border border-gold/10 bg-gold/5 space-y-4">
                <h5 className="text-sm font-cinzel text-gold">Prévia do Card</h5>
                <div className="bg-black/40 border border-gold/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center text-gold">
                      {formData.organization?.icon === 'scroll' && <Scroll size={16} />}
                      {formData.organization?.icon === 'castle' && <Castle size={16} />}
                      {formData.organization?.icon === 'sword' && <Sword size={16} />}
                      {formData.organization?.icon === 'skull' && <Skull size={16} />}
                      {formData.organization?.icon === 'crown' && <Crown size={16} />}
                      {formData.organization?.icon === 'map' && <MapIcon size={16} />}
                      {formData.organization?.icon === 'zap' && <Zap size={16} />}
                      {formData.organization?.icon === 'shield' && <Shield size={16} />}
                    </div>
                    <div className="h-2 w-24 bg-gold/20 rounded" />
                  </div>
                  <div className="h-4 w-full bg-gold/10 rounded" />
                  <div className="h-2 w-2/3 bg-gold/5 rounded" />
                  <div className="pt-2 flex gap-2">
                    <div className="h-1 flex-1 rounded" style={{ backgroundColor: formData.organization?.themeColor }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Settings */}
        {currentStep === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
            <div className="md:col-span-2 space-y-6">
              <Card title="Privacidade e Visibilidade" icon={Shield}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => updateNestedField('status', 'visibility', 'private')}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                      formData.status?.visibility === 'private'
                        ? "bg-gold/20 border-gold text-gold shadow-inner shadow-gold/10"
                        : "bg-black/20 border-gold/10 text-gold/40 hover:border-gold/30"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center">
                      <EyeOff size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest">Privada</p>
                      <p className="text-[10px] opacity-60">Apenas você pode ver este tomo.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateNestedField('status', 'visibility', 'shared')}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                      formData.status?.visibility === 'shared'
                        ? "bg-gold/20 border-gold text-gold shadow-inner shadow-gold/10"
                        : "bg-black/20 border-gold/10 text-gold/40 hover:border-gold/30"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center">
                      <Eye size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest">Compartilhada</p>
                      <p className="text-[10px] opacity-60">Jogadores convidados podem ver.</p>
                    </div>
                  </button>
                </div>
              </Card>

              <Card title="Gerenciamento de Mesa" icon={Users}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-gold/10">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-gold">Aceitar Jogadores</p>
                      <p className="text-[10px] text-gold/40">Permitir que novos jogadores se vinculem à campanha.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateNestedField('settings', 'acceptsPlayers', !formData.settings?.acceptsPlayers)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        formData.settings?.acceptsPlayers ? "bg-emerald-500" : "bg-stone-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                        formData.settings?.acceptsPlayers ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>

                  {formData.settings?.acceptsPlayers && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Limite de Jogadores</label>
                      <input 
                        type="number"
                        min={1}
                        max={20}
                        value={formData.settings?.playerLimit}
                        onChange={(e) => updateNestedField('settings', 'playerLimit', parseInt(e.target.value))}
                        className="w-full bg-black/40 border border-gold/10 rounded-lg py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-all"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-gold/10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gold/60">Sessão Rápida</p>
                        <p className="text-[8px] text-gold/30">Habilitar criação ágil de sessões.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateNestedField('settings', 'quickSessionMode', !formData.settings?.quickSessionMode)}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative",
                          formData.settings?.quickSessionMode ? "bg-gold/60" : "bg-stone-800"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                          formData.settings?.quickSessionMode ? "left-5.5" : "left-0.5"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-gold/10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gold/60">Vincular Personagens</p>
                        <p className="text-[8px] text-gold/30">Permitir vincular fichas de jogadores.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateNestedField('settings', 'allowCharacterLinking', !formData.settings?.allowCharacterLinking)}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative",
                          formData.settings?.allowCharacterLinking ? "bg-gold/60" : "bg-stone-800"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                          formData.settings?.allowCharacterLinking ? "left-5.5" : "left-0.5"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-gold/10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gold/60">Resumo Automático</p>
                        <p className="text-[8px] text-gold/30">Gerar resumos automáticos com IA.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateNestedField('settings', 'showAutomaticSummary', !formData.settings?.showAutomaticSummary)}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative",
                          formData.settings?.showAutomaticSummary ? "bg-gold/60" : "bg-stone-800"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                          formData.settings?.showAutomaticSummary ? "left-5.5" : "left-0.5"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Status da Campanha" icon={Zap}>
                <div className="grid grid-cols-1 gap-2">
                  {(['active', 'paused', 'finished'] as CampaignStatus[]).map((state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => updateNestedField('status', 'state', state)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-left",
                        formData.status?.state === state 
                          ? "bg-gold/20 border-gold text-gold shadow-inner shadow-gold/10" 
                          : "bg-black/20 border-gold/10 text-gold/40 hover:border-gold/30 hover:text-gold/60"
                      )}
                    >
                      <span className="text-[10px] uppercase tracking-widest font-bold">
                        {state === 'active' ? 'Ativa' : state === 'paused' ? 'Pausada' : 'Finalizada'}
                      </span>
                      {formData.status?.state === state && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-stone-950/80 backdrop-blur-xl border-t border-gold/10 p-4 z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
            <div className="flex gap-2">
              {currentStep !== 'identity' && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    const idx = steps.findIndex(s => s.id === currentStep);
                    setCurrentStep(steps[idx - 1].id);
                  }}
                  icon={ChevronLeft}
                >
                  Anterior
                </Button>
              )}
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate('/master/campaigns')}
                className="hidden md:flex"
              >
                Cancelar
              </Button>
            </div>

            <div className="flex gap-2 flex-1 md:flex-none">
              {currentStep !== 'settings' ? (
                <Button 
                  type="button" 
                  fullWidth
                  onClick={() => {
                    const idx = steps.findIndex(s => s.id === currentStep);
                    setCurrentStep(steps[idx + 1].id);
                  }}
                  className="md:w-48"
                >
                  Próximo <ChevronRight size={18} className="ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  fullWidth
                  icon={Save} 
                  disabled={saving}
                  className="md:w-64 shadow-lg shadow-gold/20"
                >
                  {saving ? 'Consagrando...' : isEditing ? 'Salvar Alterações' : 'Criar Campanha'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
