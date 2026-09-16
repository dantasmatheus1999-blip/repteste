import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  MapPin, 
  ChevronLeft,
  Save,
  Trash2,
  X,
  Image as ImageIcon,
  ScrollText,
  Globe,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { Location, LocationType } from '../../types/master';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export const LocationForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { campaignId, locationId } = useParams<{ campaignId: string; locationId: string }>();
  const isEditing = !!locationId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Location>>({
    name: '',
    type: 'Cidade',
    description: '',
    history: '',
    isSecret: false,
    imageUrl: '',
  });

  useEffect(() => {
    if (isEditing && user) {
      const fetchLocation = async () => {
        const loc = await MasterService.getLocation(locationId);
        if (loc) {
          setFormData(loc);
        }
        setLoading(false);
      };
      fetchLocation();
    }
  }, [locationId, isEditing, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name) return;

    setSaving(true);
    try {
      if (isEditing) {
        await MasterService.updateLocation(locationId, formData);
      } else {
        await MasterService.createLocation(user.uid, campaignId || '', formData);
      }
      navigate(`/master/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Error saving location:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!locationId || !window.confirm("Tem certeza que deseja excluir este local?")) return;
    
    try {
      await MasterService.deleteLocation(locationId);
      navigate(`/master/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Error deleting location:", error);
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
            {isEditing ? 'Editar Local' : 'Novo Local'}
          </h2>
          <p className="text-gold/40 text-sm italic">
            {isEditing ? 'Ajuste os detalhes deste ponto no mapa.' : 'Registre uma nova localidade em Arton.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card title="Geografia e Identidade" icon={MapPin}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Nome do Local</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Valkaria, Malpetrim..."
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Tipo</label>
                    <input 
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as LocationType })}
                      placeholder="Ex: Cidade, Masmorra, Floresta..."
                      className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Descrição Geral</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Como é este lugar?"
                    className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                  />
                </div>
              </div>
            </Card>

            <Card title="História e Segredos" icon={ScrollText}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Histórico / Lore</label>
                  <textarea 
                    rows={6}
                    value={formData.history}
                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                    placeholder="O que aconteceu aqui no passado?"
                    className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="isSecret"
                    checked={formData.isSecret}
                    onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
                    className="rounded border-gold/20 bg-black/40 text-gold focus:ring-gold/40"
                  />
                  <label htmlFor="isSecret" className="text-xs text-gold/60 uppercase tracking-widest font-bold cursor-pointer">Local Secreto / Oculto</label>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card title="Imagem do Local" icon={ImageIcon}>
              <div className="space-y-4">
                <div className="w-full aspect-video rounded-sm bg-black/40 border border-gold/10 flex items-center justify-center overflow-hidden relative group">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt={formData.name} className="w-full h-full object-cover" />
                  ) : (
                    <Globe className="text-gold/10" size={48} />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">URL da Imagem</label>
                  <input 
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors"
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
                {saving ? 'Registrando...' : isEditing ? 'Salvar Alterações' : 'Criar Local'}
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
                  Excluir Local
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
