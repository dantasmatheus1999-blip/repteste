// Módulo legado preservado como rascunho para consulta futura.
// Não excluir sem autorização.

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  ChevronLeft,
  Save,
  Trash2,
  X,
  Check,
  Clock,
  MapPin,
  Users,
  Swords,
  Notebook
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { Session } from '../../types/master';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export const SessionForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { campaignId, sessionId } = useParams<{ campaignId: string; sessionId: string }>();
  const isEditing = !!sessionId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Session>>({
    number: 1,
    title: '',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    xpAwarded: 0,
    lootAwarded: '',
    masterNotes: '',
    playerNotes: '',
    npcIds: [],
    locationIds: [],
    encounterIds: [],
  });

  useEffect(() => {
    if (isEditing && user) {
      const fetchSession = async () => {
        const session = await MasterService.getSession(sessionId);
        if (session) {
          setFormData(session);
        }
        setLoading(false);
      };
      fetchSession();
    } else if (campaignId && !isEditing) {
      // Auto-increment session number
      const fetchLastSession = async () => {
        const sessions = await MasterService.getSessions(campaignId);
        if (sessions.length > 0) {
          const lastNumber = Math.max(...sessions.map(s => s.number));
          setFormData(prev => ({ ...prev, number: lastNumber + 1 }));
        }
      };
      fetchLastSession();
    }
  }, [sessionId, isEditing, user, campaignId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !campaignId || !formData.title) return;

    setSaving(true);
    try {
      if (isEditing) {
        await MasterService.updateSession(sessionId, formData);
      } else {
        await MasterService.createSession(campaignId, formData);
      }
      navigate(`/master/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Error saving session:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!sessionId || !window.confirm("Tem certeza que deseja excluir esta sessão?")) return;
    
    try {
      await MasterService.deleteSession(sessionId);
      navigate(`/master/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Error deleting session:", error);
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
    <div className="space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto px-4 pb-20">
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
            {isEditing ? `Editar Sessão ${formData.number}` : 'Nova Sessão'}
          </h2>
          <p className="text-gold/40 text-sm italic">
            {isEditing ? 'Ajuste os registros deste capítulo.' : 'Inicie um novo capítulo na história de Arton.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card title="Informações da Sessão" icon={Calendar}>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-1">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Número</label>
                    <input 
                      type="number"
                      required
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })}
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2 col-span-3">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Título da Sessão</label>
                    <input 
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: O Resgate do Nobre"
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Data</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/20" size={16} />
                      <input 
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 pl-10 pr-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">XP Concedido</label>
                    <input 
                      type="number"
                      value={formData.xpAwarded}
                      onChange={(e) => setFormData({ ...formData, xpAwarded: parseInt(e.target.value) })}
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold focus:outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Resumo da Sessão</label>
                  <textarea 
                    rows={6}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="O que aconteceu nesta sessão?"
                    className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                  />
                </div>
              </div>
            </Card>

            <Card title="Notas do Mestre" icon={Notebook}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Anotações Secretas</label>
                  <textarea 
                    rows={6}
                    value={formData.masterNotes}
                    onChange={(e) => setFormData({ ...formData, masterNotes: e.target.value })}
                    placeholder="Segredos, ganchos para o futuro, etc..."
                    className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Recompensas e Loot</label>
                  <textarea 
                    rows={4}
                    value={formData.lootAwarded}
                    onChange={(e) => setFormData({ ...formData, lootAwarded: e.target.value })}
                    placeholder="Itens mágicos, tesouros, etc..."
                    className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <Card title="Vínculos" icon={Plus}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest flex items-center gap-2">
                    <Users size={12} /> NPCs Presentes
                  </label>
                  <div className="text-center py-4 border border-dashed border-gold/10 rounded-sm">
                    <p className="text-[10px] text-gold/30 uppercase tracking-widest">Em breve</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest flex items-center gap-2">
                    <MapPin size={12} /> Locais Visitados
                  </label>
                  <div className="text-center py-4 border border-dashed border-gold/10 rounded-sm">
                    <p className="text-[10px] text-gold/30 uppercase tracking-widest">Em breve</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest flex items-center gap-2">
                    <Swords size={12} /> Encontros
                  </label>
                  <div className="text-center py-4 border border-dashed border-gold/10 rounded-sm">
                    <p className="text-[10px] text-gold/30 uppercase tracking-widest">Em breve</p>
                  </div>
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
                {saving ? 'Consagrando...' : isEditing ? 'Salvar Alterações' : 'Criar Sessão'}
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
                  Excluir Sessão
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
