import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  User, 
  ChevronLeft,
  Save,
  Trash2,
  X,
  Check,
  Heart,
  Image as ImageIcon,
  ScrollText,
  Swords,
  Shield,
  Zap,
  Dices,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { ComfyService } from '../../services/comfyService';
import { StorageService } from '../../services/storageService';
import { NPC, NPCAttitude } from '../../types/master';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { NPC_RACES, NPC_CLASSES, NPC_STYLES, NPC_EQUIPMENTS, FIXED_BASE_PROMPT, FACE_QUALITY_PROMPT } from '../../constants/npcGeneration';

export const NPCForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { campaignId, npcId } = useParams<{ campaignId: string; npcId: string }>();
  const isEditing = !!npcId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [isImageTemporary, setIsImageTemporary] = useState(false);
  const [loras, setLoras] = useState<string[]>([]);
  const [selectedLora, setSelectedLora] = useState<string>('');
  const [loraWeight, setLoraWeight] = useState<number>(1.0);
  
  // Estados para o Gerador de Prompt Estruturado
  const [genRace, setGenRace] = useState(NPC_RACES[0].id);
  const [genClass, setGenClass] = useState(NPC_CLASSES[0].id);
  const [genStyle, setGenStyle] = useState(NPC_STYLES[0].id);
  const [genEquipment, setGenEquipment] = useState(NPC_EQUIPMENTS[0].id);

  const [formData, setFormData] = useState<Partial<NPC>>({
    name: '',
    role: 'Aliado',
    race: 'Humano',
    description: '',
    personality: '',
    ideals: '',
    bonds: '',
    flaws: '',
    attitude: 'neutral',
    isFavorite: false,
    imageUrl: '',
    stats: {
      hp: 0,
      mp: 0,
      ac: 0,
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
    },
    actions: [],
  });

  useEffect(() => {
    if (isEditing && user) {
      const fetchNPC = async () => {
        const npc = await MasterService.getNPC(npcId);
        if (npc) {
          setFormData(npc);
        }
        setLoading(false);
      };
      fetchNPC();
    }
  }, [npcId, isEditing, user]);

  useEffect(() => {
    const fetchLoras = async () => {
      const availableLoras = await ComfyService.getLoras();
      setLoras(availableLoras);
    };
    fetchLoras();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name) return;

    setSaving(true);
    try {
      let finalData = { 
        ...formData,
        imageUrl: formData.imageUrl || null
      };

      // Se a imagem for temporária, fazemos o upload definitivo agora
      if (isImageTemporary && finalData.imageUrl) {
        setGenerationStatus('Salvando imagem permanentemente...');
        const storagePath = `npcs/${user.uid}/${Date.now()}.png`;
        
        try {
          const absoluteUrl = finalData.imageUrl.startsWith('http') 
            ? finalData.imageUrl 
            : window.location.origin + finalData.imageUrl;

          const permanentUrl = await StorageService.uploadNpcImage(absoluteUrl, storagePath);
          finalData.imageUrl = permanentUrl;
          setIsImageTemporary(false);
        } catch (uploadError: any) {
          console.error("[NPCForm] Falha no salvamento permanente durante o submit:", uploadError);
          // Se falhar o upload, podemos decidir se cancelamos o save ou se salvamos com a URL temporária
          // Por segurança, vamos avisar o usuário se for um erro crítico, mas aqui vamos tentar prosseguir
          // ou lançar o erro para o catch principal.
          if (StorageService.isCorsError(uploadError)) {
            throw new Error(StorageService.getCorsErrorMessage());
          }
          throw uploadError;
        }
      }

      if (isEditing) {
        await MasterService.updateNPC(npcId, finalData);
      } else {
        await MasterService.createNPC(user.uid, campaignId || '', finalData);
      }
      navigate(campaignId ? `/master/campaigns/${campaignId}` : '/master/npcs');
    } catch (error: any) {
      console.error("Error saving NPC:", error);
      setImageError(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
      setGenerationStatus('');
    }
  };

  const handleDelete = async () => {
    if (!npcId || !window.confirm("Tem certeza que deseja excluir este NPC?")) return;
    
    try {
      await MasterService.deleteNPC(npcId);
      navigate(campaignId ? `/master/campaigns/${campaignId}` : '/master/npcs');
    } catch (error) {
      console.error("Error deleting NPC:", error);
    }
  };

  const cleanPrompt = (prompt: string) => {
    const parts = prompt.split(',').map(p => p.trim()).filter(Boolean);
    const uniqueParts = Array.from(new Set(parts));
    return uniqueParts.join(', ');
  };

  const handleGenerateImage = async () => {
    if (generatingImage) return;

    setGeneratingImage(true);
    setGenerationStatus('Iniciando...');
    setImageError(null);
    
    try {
      let finalPrompt = formData.visualPrompt;

      if (!finalPrompt || finalPrompt.trim() === '') {
        const raceOpt = NPC_RACES.find(r => r.id === genRace);
        const classOpt = NPC_CLASSES.find(c => c.id === genClass);
        const styleOpt = NPC_STYLES.find(s => s.id === genStyle);
        const equipOpt = NPC_EQUIPMENTS.find(e => e.id === genEquipment);

        if (!raceOpt || !classOpt) {
          throw new Error("Raça e Classe são obrigatórias para gerar a imagem.");
        }

        setGenerationStatus('Gerando prompt...');
        const promptParts = [
          `${raceOpt.nameEn} ${classOpt.nameEn}`,
          raceOpt.features,
          classOpt.clothing,
          equipOpt && equipOpt.id !== 'none' ? equipOpt.prompt : null,
          equipOpt && equipOpt.id !== 'none' ? equipOpt.reinforcement : null,
          FACE_QUALITY_PROMPT,
          classOpt.effects,
          styleOpt?.prompt,
          FIXED_BASE_PROMPT
        ].filter(Boolean);

        const rawPrompt = promptParts.join(', ');
        finalPrompt = cleanPrompt(rawPrompt);
        setFormData(prev => ({ ...prev, visualPrompt: finalPrompt }));
      }
      
      console.log("[NPCForm] Prompt:", finalPrompt);
      
      const generatedImageUrl = await ComfyService.generateImage(
        finalPrompt, 
        selectedLora || undefined, 
        loraWeight,
        (status) => setGenerationStatus(status)
      );
      
      if (!generatedImageUrl) {
        throw new Error("Falha ao obter URL da imagem do ComfyUI");
      }

      console.log("[NPCForm] Image generated (preview only):", generatedImageUrl);
      
      // Apenas atualizamos o estado local com a URL temporária
      setFormData(prev => ({ ...prev, imageUrl: generatedImageUrl }));
      setIsImageTemporary(true);
      setGenerationStatus('Imagem gerada! Clique em salvar para confirmar.');
      
    } catch (error: any) {
      console.error("[NPCForm] Error generating image:", error);
      setImageError(`Falha na geração: ${error.message || 'Erro desconhecido'}`);
      setGenerationStatus('Erro');
    } finally {
      setGeneratingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => campaignId ? navigate(`/master/campaigns/${campaignId}`) : navigate('/master/npcs')}
            className="flex items-center gap-2 text-gold/40 hover:text-gold transition-colors text-xs uppercase tracking-widest font-bold mb-2"
          >
            <ChevronLeft size={14} /> Voltar
          </button>
          <h2 className="text-4xl font-cinzel text-gold-gradient">
            {isEditing ? 'Editar NPC' : 'Novo NPC'}
          </h2>
          <p className="text-gold/40 text-sm italic">
            {isEditing ? 'Ajuste os registros deste habitante de Arton.' : 'Dê vida a um novo personagem na sua história.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            icon={Heart} 
            className={formData.isFavorite ? 'text-red-500 border-red-500/40' : ''}
            onClick={() => setFormData({ ...formData, isFavorite: !formData.isFavorite })}
          >
            {formData.isFavorite ? 'Favorito' : 'Favoritar'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card title="Identidade" icon={User}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-1">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Nome</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Tanna-Toh"
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Atitude</label>
                    <select 
                      value={formData.attitude}
                      onChange={(e) => setFormData({ ...formData, attitude: e.target.value as NPCAttitude })}
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                    >
                      <option value="friendly">Amigável</option>
                      <option value="neutral">Neutro</option>
                      <option value="hostile">Hostil</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Raça</label>
                    <select 
                      value={genRace}
                      onChange={(e) => {
                        setGenRace(e.target.value);
                        const raceLabel = NPC_RACES.find(r => r.id === e.target.value)?.label;
                        if (raceLabel) setFormData({ ...formData, race: raceLabel });
                      }}
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                    >
                      {NPC_RACES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Classe</label>
                    <select 
                      value={genClass}
                      onChange={(e) => {
                        setGenClass(e.target.value);
                        const classLabel = NPC_CLASSES.find(c => c.id === e.target.value)?.label;
                        if (classLabel) setFormData({ ...formData, role: classLabel });
                      }}
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                    >
                      {NPC_CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Estilo</label>
                    <select 
                      value={genStyle}
                      onChange={(e) => setGenStyle(e.target.value)}
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                    >
                      {NPC_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Equipamento</label>
                    <select 
                      value={genEquipment}
                      onChange={(e) => setGenEquipment(e.target.value)}
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                    >
                      {NPC_EQUIPMENTS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gold/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest flex justify-between">
                        <span>LoRA (Opcional)</span>
                        {selectedLora && <button type="button" onClick={() => setSelectedLora('')} className="text-red-500/60 hover:text-red-500 transition-colors">Limpar</button>}
                      </label>
                      <select 
                        value={selectedLora}
                        onChange={(e) => setSelectedLora(e.target.value)}
                        className="w-full bg-black/40 border border-gold/10 rounded-sm py-2 px-3 text-gold text-xs focus:outline-none focus:border-gold/40 transition-colors"
                      >
                        <option value="">Nenhuma LoRA</option>
                        {loras.map(lora => (
                          <option key={lora} value={lora}>{lora}</option>
                        ))}
                      </select>
                    </div>

                    {selectedLora && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Peso da LoRA</label>
                          <span className="text-[10px] font-mono text-gold">{loraWeight.toFixed(1)}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="2" 
                          step="0.1" 
                          value={loraWeight}
                          onChange={(e) => setLoraWeight(parseFloat(e.target.value))}
                          className="w-full accent-gold h-1 bg-gold/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  <Button 
                    type="button" 
                    variant="primary" 
                    fullWidth 
                    icon={generatingImage ? Loader2 : Sparkles}
                    onClick={handleGenerateImage}
                    disabled={generatingImage}
                    className={generatingImage ? 'opacity-50' : ''}
                  >
                    {generatingImage ? (
                      <div className="flex flex-col items-center">
                        <span className="font-cinzel">{generationStatus || 'Gerando...'}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-1">
                        <span className="text-base font-cinzel tracking-wider">Conjurar Retrato</span>
                        <span className="text-[10px] opacity-60 font-sans normal-case tracking-normal">Gerar imagem do NPC</span>
                      </div>
                    )}
                  </Button>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ScrollText size={12} /> Prompt Visual (Editável)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, visualPrompt: '' }))}
                          className="text-[8px] hover:text-gold transition-colors"
                        >
                          Limpar para Regerar
                        </button>
                      </div>
                    </label>
                    <textarea 
                      rows={3}
                      value={formData.visualPrompt || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, visualPrompt: e.target.value }))}
                      placeholder="O prompt será gerado automaticamente ou você pode escrever o seu..."
                      className="w-full bg-black/60 border border-gold/5 rounded-sm py-2 px-3 text-gold/60 text-[10px] font-mono leading-relaxed resize-none focus:outline-none focus:border-gold/40 transition-colors"
                    />
                    <p className="text-[9px] text-gold/30 italic">
                      * Edite o prompt acima para refinar a imagem antes de gerar.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Personalidade e Lore" icon={ScrollText}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Personalidade</label>
                    <textarea 
                      rows={3}
                      value={formData.personality}
                      onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                      placeholder="Traços de comportamento..."
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Ideais</label>
                    <textarea 
                      rows={3}
                      value={formData.ideals}
                      onChange={(e) => setFormData({ ...formData, ideals: e.target.value })}
                      placeholder="No que ele acredita?"
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Vínculos</label>
                    <textarea 
                      rows={3}
                      value={formData.bonds}
                      onChange={(e) => setFormData({ ...formData, bonds: e.target.value })}
                      placeholder="O que o prende ao mundo?"
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Defeitos / Segredos</label>
                    <textarea 
                      rows={3}
                      value={formData.flaws}
                      onChange={(e) => setFormData({ ...formData, flaws: e.target.value })}
                      placeholder="Fraquezas ou segredos ocultos..."
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Atributos e Combate (Opcional)" icon={Swords}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                  {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((attr) => (
                    <div key={attr} className="space-y-1 text-center bg-black/20 p-2 rounded-lg border border-gold/5">
                      <label className="text-[8px] uppercase font-bold text-gold/40 tracking-widest">{attr}</label>
                      <input 
                        type="number"
                        value={formData.stats?.[attr as keyof typeof formData.stats] || 10}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          stats: { 
                            ...formData.stats!, 
                            [attr]: parseInt(e.target.value) 
                          } 
                        })}
                        className="w-full bg-transparent border-none text-center text-gold focus:outline-none transition-colors font-medieval text-lg"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest flex items-center gap-1"><Heart size={10} /> PV</label>
                    <input 
                      type="number"
                      value={formData.stats?.hp || 0}
                      onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats!, hp: parseInt(e.target.value) } })}
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest flex items-center gap-1"><Zap size={10} /> PM</label>
                    <input 
                      type="number"
                      value={formData.stats?.mp || 0}
                      onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats!, mp: parseInt(e.target.value) } })}
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest flex items-center gap-1"><Shield size={10} /> Defesa</label>
                    <input 
                      type="number"
                      value={formData.stats?.ac || 0}
                      onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats!, ac: parseInt(e.target.value) } })}
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <Card title="Imagem" icon={ImageIcon}>
              <div className="space-y-4">
                <div className="w-full aspect-square rounded-sm bg-black/40 border border-gold/10 flex items-center justify-center overflow-hidden relative group">
                  {formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} alt={formData.name} className="w-full h-full object-cover" />
                      {generatingImage && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 backdrop-blur-sm animate-in fade-in duration-300">
                          <Loader2 className="text-gold animate-spin" size={24} />
                          <p className="text-[10px] uppercase font-bold text-gold tracking-widest">
                            {generationStatus}
                          </p>
                        </div>
                      )}
                    </>
                  ) : generatingImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="text-gold animate-spin" size={32} />
                      <p className="text-[10px] uppercase font-bold text-gold/60 tracking-widest animate-pulse">
                        {generationStatus || 'Gerando...'}
                      </p>
                    </div>
                  ) : (
                    <User className="text-gold/10" size={64} />
                  )}
                </div>

                {imageError && (
                  <p className="text-[10px] text-red-500 italic text-center">{imageError}</p>
                )}
              </div>
            </Card>

            <div className="space-y-3">
              <Button 
                type="submit" 
                fullWidth 
                icon={Save} 
                disabled={saving || generatingImage}
              >
                {saving ? 'Consagrando...' : isEditing ? 'Salvar Alterações' : 'Criar NPC'}
              </Button>
              
              {isEditing && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  fullWidth 
                  icon={Trash2}
                  onClick={handleDelete}
                  className="text-red-500/60 hover:text-red-500 hover:border-red-500/40"
                >
                  Excluir NPC
                </Button>
              )}
              
              <Button 
                type="button" 
                variant="secondary" 
                fullWidth 
                icon={X}
                onClick={() => campaignId ? navigate(`/master/campaigns/${campaignId}`) : navigate('/master/npcs')}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
