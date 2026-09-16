import React, { useState } from 'react';
import { X, Sword, Shield, Image as ImageIcon, Users, Scroll, Sparkles } from 'lucide-react';
import { Button } from '../Button';
import { GameService } from '../../services/gameService';
import { CreateGameData } from '../../types/game';

interface CreateGameModalProps {
  campaignId: string;
  masterId: string;
  campaignSystem?: string;
  isOpen: boolean;
  onClose: () => void;
  onGameCreated?: (gameId: string) => void;
}

const PRESET_COVERS = [
  { label: 'Taverna Sombria', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80' },
  { label: 'Masmorra Antiga', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80' },
  { label: 'Floresta Élfica', url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&auto=format&fit=crop&q=80' },
  { label: 'Fortaleza em Chamas', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80' },
];

export const CreateGameModal: React.FC<CreateGameModalProps> = ({
  campaignId,
  masterId,
  campaignSystem = 'Tormenta 20',
  isOpen,
  onClose,
  onGameCreated
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [system, setSystem] = useState(campaignSystem || 'Tormenta 20');
  const [coverUrl, setCoverUrl] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome do jogo.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateGameData = {
        name: name.trim(),
        description: description.trim(),
        system,
        coverUrl: coverUrl.trim(),
        maxPlayers
      };

      const created = await GameService.createGame(campaignId, masterId, payload);
      setName('');
      setDescription('');
      setCoverUrl('');
      setMaxPlayers(5);
      onClose();
      if (onGameCreated) {
        onGameCreated(created.id);
      }
    } catch (err: any) {
      console.error('Erro ao criar jogo:', err);
      setError(err?.message || 'Falha ao forjar a mesa de jogo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-xl border border-amber-800/50 bg-gradient-to-b from-[#1b1510] via-[#14100c] to-[#0c0907] p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(180,120,40,0.15)] text-stone-200 max-h-[92vh] overflow-y-auto"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.25), inset 0 0 25px rgba(0,0,0,0.7), 0 25px 50px -12px rgba(0,0,0,0.95)'
        }}
      >
        {/* Cantoneiras metálicas medievais */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-600/40 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-600/40 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-600/40 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-600/40 pointer-events-none" />

        {/* Header com estilo Dark Fantasy */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-700/50 text-amber-400 shadow-inner">
              <Sword className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-cinzel font-bold text-amber-100 tracking-wide">
                FORJAR NOVO JOGO
              </h2>
              <p className="text-[11px] text-amber-300/60 font-cinzel">
                Prepare uma mesa online imersiva nesta campanha
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-200 hover:bg-amber-950/40 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-serif">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do jogo */}
          <div>
            <label className="block text-xs font-cinzel font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5 flex items-center gap-1.5">
              <Scroll size={13} className="text-amber-400" /> Nome do jogo *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: A Lenda de Valkaria - Ato I"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0907] border border-amber-950/70 focus:border-amber-600 focus:ring-1 focus:ring-amber-500/40 text-stone-100 placeholder-stone-600 text-sm transition-all"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-cinzel font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5">
              Descrição do Jogo
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Descreva o objetivo ou premissa deste jogo na campanha..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0907] border border-amber-950/70 focus:border-amber-600 focus:ring-1 focus:ring-amber-500/40 text-stone-100 placeholder-stone-600 text-sm resize-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sistema */}
            <div>
              <label className="block text-xs font-cinzel font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5 flex items-center gap-1.5">
                <Shield size={13} className="text-amber-400" /> Sistema de Regras
              </label>
              <select
                value={system}
                onChange={e => setSystem(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0907] border border-amber-950/70 focus:border-amber-600 focus:ring-1 focus:ring-amber-500/40 text-stone-100 text-sm transition-all"
              >
                <option value="Tormenta 20">Tormenta 20</option>
                <option value="D&D 5e">D&D 5e</option>
                <option value="Pathfinder 2e">Pathfinder 2e</option>
                <option value="Call of Cthulhu">Call of Cthulhu</option>
                <option value="Ordem Paranormal">Ordem Paranormal</option>
                <option value="Custom">Outro Sistema</option>
              </select>
            </div>

            {/* Máximo de jogadores */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-cinzel font-semibold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
                  <Users size={13} className="text-amber-400" /> Máximo de jogadores: <span className="text-amber-300 font-mono font-bold text-sm">{maxPlayers}</span>
                </label>
                <span className="text-[10px] font-cinzel text-stone-400">Padrão: 5 aventureiros</span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                value={maxPlayers}
                onChange={e => setMaxPlayers(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-1">
                <span>2 min</span>
                <span>5 padrão</span>
                <span>10 máx</span>
              </div>
            </div>
          </div>

          {/* Imagem / Capa */}
          <div>
            <label className="block text-xs font-cinzel font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={13} className="text-amber-400" /> Imagem de Capa (URL)
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={e => setCoverUrl(e.target.value)}
              placeholder="https://... ou escolha um dos temas abaixo"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0c0907] border border-amber-950/70 focus:border-amber-600 focus:ring-1 focus:ring-amber-500/40 text-stone-100 placeholder-stone-600 text-sm transition-all"
            />
            {/* Atalhos de artes pré-definidas */}
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESET_COVERS.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCoverUrl(preset.url)}
                  className={`text-[10px] font-cinzel px-2 py-1 rounded border transition-colors ${
                    coverUrl === preset.url
                      ? 'bg-amber-900/60 border-amber-500 text-amber-200'
                      : 'bg-black/40 border-amber-950/60 text-stone-400 hover:text-amber-300 hover:border-amber-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-900/40">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-amber-900/40 text-stone-400 hover:text-stone-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              icon={Sparkles}
              className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-bold border-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.25)]"
            >
              {isSubmitting ? 'Forjando...' : 'Criar Jogo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
