// Módulo legado preservado como rascunho para consulta futura.
// Não excluir sem autorização.

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  Swords, 
  ChevronLeft,
  Save,
  Trash2,
  X,
  Skull,
  Shield,
  Zap,
  Dices,
  ScrollText,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { Encounter, EncounterDifficulty, EncounterType } from '../../types/master';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export const EncounterForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { campaignId, encounterId } = useParams<{ campaignId: string; encounterId: string }>();
  const isEditing = !!encounterId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Encounter>>({
    title: '',
    description: '',
    difficulty: 'Média',
    type: 'Combate',
    monsters: [],
    rewards: {
      xp: 0,
      loot: [],
    },
    isSecret: false,
    notes: '',
  });

  useEffect(() => {
    if (isEditing && user) {
      const fetchEncounter = async () => {
        const enc = await MasterService.getEncounter(encounterId);
        if (enc) {
          setFormData(enc);
        }
        setLoading(false);
      };
      fetchEncounter();
    }
  }, [encounterId, isEditing, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title) return;

    setSaving(true);
    try {
      if (isEditing) {
        await MasterService.updateEncounter(encounterId, formData);
      } else {
        await MasterService.createEncounter(user.uid, campaignId || '', formData);
      }
      navigate(`/master/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Error saving encounter:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!encounterId || !window.confirm("Tem certeza que deseja excluir este encontro?")) return;
    
    try {
      await MasterService.deleteEncounter(encounterId);
      navigate(`/master/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Error deleting encounter:", error);
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
            onClick={() => navigate(`/master/campaigns/${campaignId}`)}
            className="flex items-center gap-2 text-gold/40 hover:text-gold transition-colors text-xs uppercase tracking-widest font-bold mb-2"
          >
            <ChevronLeft size={14} /> Voltar para Campanha
          </button>
          <h2 className="text-4xl font-cinzel text-gold-gradient">
            {isEditing ? 'Editar Encontro' : 'Novo Encontro'}
          </h2>
          <p className="text-gold/40 text-sm italic">
            {isEditing ? 'Ajuste os perigos desta cena.' : 'Prepare um novo desafio para seus jogadores.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card title="Cena e Desafio" icon={Swords}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Título do Encontro</label>
                    <input 
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Emboscada na Floresta, O Enigma da Esfinge..."
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Dificuldade</label>
                      <select 
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as EncounterDifficulty })}
                        className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                      >
                        <option value="Fácil">Fácil</option>
                        <option value="Média">Média</option>
                        <option value="Difícil">Difícil</option>
                        <option value="Mortal">Mortal</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Tipo</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as EncounterType })}
                        className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                      >
                        <option value="Combate">Combate</option>
                        <option value="Social">Social</option>
                        <option value="Exploração">Exploração</option>
                        <option value="Puzzle">Puzzle</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Descrição da Cena</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="O que está acontecendo?"
                    className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                  />
                </div>
              </div>
            </Card>

            <Card title="Criaturas e Inimigos" icon={Skull}>
              <div className="space-y-4">
                <p className="text-[10px] text-gold/30 italic">Adicione os nomes das criaturas ou NPCs envolvidos.</p>
                <div className="flex flex-wrap gap-2">
                  {formData.monsters?.map((monster, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-red-500/5 border border-red-500/20 rounded text-xs text-red-500/60">
                      {monster}
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, monsters: formData.monsters?.filter((_, i) => i !== idx) })}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => {
                      const name = prompt("Nome da Criatura:");
                      if (name) setFormData({ ...formData, monsters: [...(formData.monsters || []), name] });
                    }}
                    className="px-3 py-1 border border-dashed border-gold/20 rounded text-xs text-gold/40 hover:border-gold/40 hover:text-gold/60 transition-all flex items-center gap-1"
                  >
                    <Plus size={12} /> Adicionar
                  </button>
                </div>
              </div>
            </Card>

            <Card title="Notas do Mestre" icon={ScrollText}>
              <textarea 
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Estratégias, gatilhos, segredos..."
                className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card title="Recompensas" icon={Zap}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">XP Total</label>
                  <input 
                    type="number"
                    value={formData.rewards?.xp || 0}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      rewards: { ...formData.rewards!, xp: parseInt(e.target.value) } 
                    })}
                    className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Tesouro / Loot</label>
                  <textarea 
                    rows={3}
                    value={formData.rewards?.loot?.join('\n')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      rewards: { ...formData.rewards!, loot: e.target.value.split('\n').filter(l => l.trim()) } 
                    })}
                    placeholder="Um item por linha..."
                    className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none text-xs"
                  />
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Button 
                type="submit" 
                fullWidth 
                icon={Save} 
                disabled={saving}
              >
                {saving ? 'Preparando...' : isEditing ? 'Salvar Alterações' : 'Criar Encontro'}
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
                  Excluir Encontro
                </Button>
              )}
              
              <Button 
                type="button" 
                variant="secondary" 
                fullWidth 
                icon={X}
                onClick={() => navigate(`/master/campaigns/${campaignId}`)}
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
