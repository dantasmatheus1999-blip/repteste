import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Map as MapIcon, 
  Trash2, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  Sparkles,
  ShieldCheck,
  Compass,
  FileImage
} from 'lucide-react';
import { CampaignMapService, CampaignMapData } from '../../services/campaignMapService';
import { StorageService } from '../../services/storageService';
import { auth } from '../../firebase/auth';

interface MasterCampaignMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignName?: string;
}

export const MasterCampaignMapModal: React.FC<MasterCampaignMapModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  campaignName = 'Campanha'
}) => {
  const [currentMap, setCurrentMap] = useState<CampaignMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Assinatura em tempo real do mapa da campanha
  useEffect(() => {
    if (!isOpen || !campaignId) return;

    setLoading(true);
    setError(null);

    const unsubscribe = CampaignMapService.subscribeToCampaignMap(campaignId, (mapData) => {
      setCurrentMap(mapData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, campaignId]);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAndUploadMap(file);
    // Limpa o input para permitir selecionar o mesmo arquivo novamente se desejar
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processAndUploadMap(file);
    } else {
      setError('Por favor, envie um arquivo de imagem válido (JPG, PNG, WebP).');
    }
  };

  const processAndUploadMap = async (file: File) => {
    if (!campaignId) {
      setError('ID da campanha não encontrado.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('O arquivo selecionado deve ser uma imagem (JPG, PNG, WEBP).');
      return;
    }

    // Limite máximo de 50 MB (52.428.800 bytes) para mapas de alta definição
    const MAX_MAP_FILE_SIZE = 50 * 1024 * 1024; // 52.428.800 bytes
    if (file.size > MAX_MAP_FILE_SIZE) {
      setError('O arquivo é muito grande. O limite máximo para o mapa é de 50 MB.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    setUploadProgress('Lendo dimensões da imagem...');

    try {
      // 1. Extrair dimensões originais da imagem para renderização perfeita
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
          URL.revokeObjectURL(objectUrl);
        };
        img.onerror = () => {
          resolve({ width: 1920, height: 1080 });
          URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
      });

      setUploadProgress('Enviando mapa para os servidores...');

      // 2. Fazer upload da imagem via StorageService com contingência de servidor
      const uploadedFile = await StorageService.uploadFile(file, {
        category: 'map',
        folder: `campaign_maps/${campaignId}`,
        name: file.name
      });

      if (!uploadedFile.url) {
        throw new Error('Não foi possível obter a URL do mapa após o upload.');
      }

      setUploadProgress('Salvando e vinculando à campanha...');

      // 3. Salvar mapa vinculado à campanha no Firestore
      await CampaignMapService.saveCampaignMap(campaignId, {
        imageUrl: uploadedFile.url,
        name: file.name.replace(/\.[^/.]+$/, ''),
        uploadedBy: auth.currentUser?.uid,
        originalWidth: dimensions.width,
        originalHeight: dimensions.height
      });

      setSuccessMessage('Mapa da campanha salvo e disponibilizado para todos os jogadores!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('[MasterCampaignMapModal] Erro ao enviar mapa:', err);
      setError(err.message || 'Falha ao fazer upload do mapa. Tente novamente.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleDeleteMap = async () => {
    if (!campaignId) return;
    setIsUploading(true);
    try {
      await CampaignMapService.deleteCampaignMap(campaignId);
      setCurrentMap(null);
      setIsConfirmingDelete(false);
      setSuccessMessage('Mapa da campanha removido.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover mapa.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl rounded-2xl border border-amber-700/60 bg-gradient-to-b from-[#18130e] via-[#120e0a] to-[#0c0907] p-5 sm:p-6 shadow-[0_25px_65px_rgba(0,0,0,0.95)] relative flex flex-col max-h-[90vh] overflow-hidden"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(212,175,55,0.25), inset 0 0 40px rgba(0,0,0,0.8), 0 25px 60px rgba(0,0,0,0.95)'
        }}
      >
        {/* Cantoneiras metálicas medievais */}
        <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500/50 pointer-events-none" />
        <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500/50 pointer-events-none" />
        <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/50 pointer-events-none" />
        <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500/50 pointer-events-none" />

        {/* Botão Fechar Modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-amber-200 p-1.5 rounded-lg hover:bg-amber-950/40 transition-colors z-20 cursor-pointer"
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Cabeçalho */}
        <div className="text-center space-y-1 pb-3 border-b border-amber-900/40 shrink-0 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1e1711] border border-amber-800/40 text-amber-300 text-[11px] font-cinzel font-bold tracking-widest uppercase">
            <Compass size={13} className="text-amber-400" />
            <span>MESA DO MESTRE • MAPA DE ARTON</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-amber-100 tracking-wide flex items-center justify-center gap-2">
            <MapIcon size={20} className="text-amber-400" />
            <span>Mapa da Campanha</span>
          </h2>
          <p className="text-xs text-stone-400 font-serif max-w-lg mx-auto">
            Envie o mapa oficial do mundo ou da região desta campanha. Os jogadores poderão consultá-lo em tela cheia e fazer suas próprias anotações pessoais durante o jogo.
          </p>
        </div>

        {/* Input Oculto de Arquivo */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/png, image/jpeg, image/webp" 
          onChange={handleFileSelect} 
          className="hidden" 
        />

        {/* Mensagens de Sucesso ou Erro */}
        {successMessage && (
          <div className="my-2 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
            <Check size={15} className="text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="my-2 p-2.5 rounded-xl bg-red-950/70 border border-red-800/60 text-red-300 text-xs flex items-center gap-2 shrink-0 animate-in fade-in">
            <AlertCircle size={15} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Conteúdo Principal com Rolagem */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 py-3 space-y-4">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-cinzel text-amber-200/70">Carregando mapa da campanha...</p>
            </div>
          ) : currentMap?.imageUrl ? (
            /* =============================================================== */
            /* MAPA EXISTENTE: Exibe preview, status e opções de substituição */
            /* =============================================================== */
            <div className="space-y-4">
              {/* Moldura do Mapa Ativo */}
              <div className="rounded-xl border border-amber-800/60 bg-black/60 p-2 overflow-hidden shadow-2xl relative group">
                <div className="relative max-h-[38vh] w-full rounded-lg overflow-hidden flex items-center justify-center bg-stone-950">
                  <img 
                    src={currentMap.imageUrl} 
                    alt={currentMap.name || 'Mapa da Campanha'} 
                    className="max-h-[38vh] w-auto max-w-full object-contain rounded"
                  />
                  
                  {/* Badge de Ativo */}
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm border border-emerald-500/70 text-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-cinzel font-bold flex items-center gap-1.5 shadow-md">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span>MAPA ATIVO PARA OS JOGADORES</span>
                  </div>

                  {currentMap.originalWidth && currentMap.originalHeight && (
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm border border-amber-900/60 text-stone-400 px-2 py-0.5 rounded text-[10px] font-mono">
                      {currentMap.originalWidth} × {currentMap.originalHeight} px
                    </div>
                  )}
                </div>
              </div>

              {/* Informações e Detalhes */}
              <div className="p-3 rounded-xl bg-[#0f0c08] border border-amber-900/40 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-cinzel font-bold text-amber-200">
                    {currentMap.name || 'Mapa da Campanha'}
                  </p>
                  <p className="text-[11px] text-stone-400 font-serif">
                    Atualizado em {new Date(currentMap.updatedAt).toLocaleDateString('pt-BR')} às {new Date(currentMap.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-right text-[11px] text-amber-400/90 font-cinzel">
                  Disponível na ficha do jogador
                </div>
              </div>

              {/* Ações: Substituir ou Remover */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-2 bg-red-950/80 border border-red-800 p-1.5 rounded-xl">
                    <span className="text-xs text-red-200 font-serif px-2">Remover mapa?</span>
                    <button
                      type="button"
                      onClick={handleDeleteMap}
                      disabled={isUploading}
                      className="px-2.5 py-1 rounded-lg bg-red-800 hover:bg-red-700 text-stone-100 text-xs font-cinzel font-bold cursor-pointer"
                    >
                      Sim, remover
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-cinzel cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-400 hover:text-red-400 hover:bg-red-950/30 text-xs font-cinzel transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Remover Mapa</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-200 hover:text-amber-100 text-xs font-cinzel font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow transition-all ml-auto"
                >
                  <RefreshCw size={14} className={isUploading ? 'animate-spin' : ''} />
                  <span>Substituir Imagem do Mapa</span>
                </button>
              </div>
            </div>
          ) : (
            /* =============================================================== */
            /* SEM MAPA: Dropzone para envio do primeiro mapa                  */
            /* =============================================================== */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-700/50 hover:border-amber-400 rounded-2xl p-8 sm:p-10 text-center bg-[#0d0906]/80 hover:bg-[#140e09] transition-all cursor-pointer space-y-3 group shadow-inner"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-600/50 flex items-center justify-center mx-auto text-amber-400 group-hover:scale-105 transition-transform shadow-lg">
                <Upload size={28} />
              </div>

              <div className="space-y-1">
                <h3 className="font-cinzel font-bold text-base text-amber-200">
                  Clique ou arraste a imagem do Mapa aqui
                </h3>
                <p className="text-xs text-stone-400 font-serif max-w-sm mx-auto">
                  Formatos aceitos: JPG, PNG ou WebP em alta resolução (limite máximo de 50 MB). O mapa será sincronizado automaticamente com os jogadores.
                </p>
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-stone-950 font-cinzel font-bold text-xs uppercase tracking-wider shadow">
                  <FileImage size={14} />
                  <span>Selecionar Arquivo do Computador</span>
                </span>
              </div>
            </div>
          )}

          {/* Progresso de Upload */}
          {isUploading && (
            <div className="p-3.5 rounded-xl bg-[#090705] border border-amber-600/50 flex items-center gap-3 animate-in fade-in">
              <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
              <div className="text-xs font-cinzel text-amber-200">
                {uploadProgress || 'Processando envio do mapa...'}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="pt-3 border-t border-amber-900/40 flex items-center justify-between text-xs text-stone-400 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-serif">
            <Sparkles size={12} className="text-amber-400 shrink-0" />
            <span>As anotações feitas por cada jogador ficam em camadas pessoais separadas.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 font-cinzel text-xs uppercase tracking-wider cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
