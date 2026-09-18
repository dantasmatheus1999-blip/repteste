import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Search, 
  Upload, 
  BookOpen, 
  Check, 
  RefreshCw, 
  Sparkles, 
  X, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { 
  MONSTER_LIBRARY_CATEGORIES, 
  MONSTER_IMAGE_LIBRARY, 
  MonsterLibraryCategory, 
  DEFAULT_NEUTRAL_MONSTER_IMAGE,
  getImagesByCategory,
  MonsterLibraryImage
} from './monsterImageLibrary';
import { StorageService } from '../../../services/storageService';

interface MonsterImagePickerProps {
  selectedImageUrl: string;
  onSelectImage: (imageUrl: string) => void;
  creatureName?: string;
  creatureType?: string;
  compact?: boolean;
}

type PickerTab = 'library' | 'search' | 'upload';

export const MonsterImagePicker: React.FC<MonsterImagePickerProps> = ({
  selectedImageUrl,
  onSelectImage,
  creatureName = 'Criatura',
  creatureType,
  compact = false
}) => {
  const [activeTab, setActiveTab] = useState<PickerTab>('library');
  const [selectedCategory, setSelectedCategory] = useState<MonsterLibraryCategory>('monstro');
  
  // Internet Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; thumbUrl: string; fullUrl: string; source: string }>>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Upload & Remote Copy State
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza categoria inicial com o tipo da criatura quando fornecido
  useEffect(() => {
    if (!creatureType) return;
    const normalized = creatureType.toLowerCase();
    const match = MONSTER_LIBRARY_CATEGORIES.find(c => 
      normalized.includes(c.id) || 
      (c.id === 'morto-vivo' && (normalized.includes('morto') || normalized.includes('zumbi') || normalized.includes('esqueleto'))) ||
      (c.id === 'demônio' && (normalized.includes('dem') || normalized.includes('diabo'))) ||
      (c.id === 'dragão' && normalized.includes('drag'))
    );
    if (match) {
      setSelectedCategory(match.id);
    }
  }, [creatureType]);

  // Busca na Internet através do endpoint do servidor
  const handleInternetSearch = async (e?: React.FormEvent, customTerm?: string) => {
    if (e) e.preventDefault();
    const queryTerm = (customTerm !== undefined ? customTerm : searchQuery).trim();
    if (!queryTerm) return;

    setIsSearching(true);
    setSearchError(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/search-monster-images?q=${encodeURIComponent(queryTerm)}`);
      if (!res.ok) throw new Error('Não foi possível realizar a busca na internet.');
      const data = await res.json();
      const results = data.results || [];
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('Nenhuma imagem encontrada para este termo. Tente palavras como "dragão", "lich", "lobo", "esqueleto" ou "monstro".');
      }
    } catch (err: any) {
      console.error('Erro na busca de imagens:', err);
      setSearchError('Erro ao conectar com o serviço de busca na internet.');
    } finally {
      setIsSearching(false);
    }
  };

  // Seleciona e copia imagem externa da internet para o Firebase Storage
  const handleSelectInternetImage = async (item: { title: string; fullUrl: string; thumbUrl: string }) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('Copiando e salvando imagem permanentemente no Firebase Storage...');

    try {
      // Reutiliza o StorageService existente para upload definitivo e gravação no Firestore user_files
      const targetUrl = item.fullUrl || item.thumbUrl;
      const metadata = await StorageService.uploadFromUrl(targetUrl, {
        category: 'monster',
        name: `${creatureName.replace(/\s+/g, '_')}_${item.title.substring(0, 20)}`
      });

      onSelectImage(metadata.url);
      setStatusMessage('Imagem salva permanentemente no Firebase Storage!');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      console.error('Erro ao transferir imagem para o storage:', err);
      // Fallback seguro: usa o link original caso ocorra problema
      onSelectImage(item.fullUrl || item.thumbUrl);
      setErrorMessage('Aviso: Utilizando link direto temporário pois houve lentidão na transferência.');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload manual de arquivo do computador
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('Salvando arquivo permanentemente no Firebase Storage...');

    try {
      // Reutiliza StorageService.uploadFile
      const metadata = await StorageService.uploadFile(file, {
        category: 'monster',
        name: file.name.replace(/\.[^/.]+$/, '')
      });

      onSelectImage(metadata.url);
      setStatusMessage('Upload concluído com sucesso!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      console.error('Erro no upload de arquivo:', err);
      setErrorMessage('Falha ao enviar imagem. Verifique a conexão e tente novamente.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const libraryImages = getImagesByCategory(selectedCategory);

  return (
    <div id="monster-image-picker" className="bg-stone-900/90 border border-amber-900/40 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-sm space-y-4">
      {/* Top Header: Current Image Status & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-900/30">
        <div className="flex items-center gap-3">
          {/* Active Thumbnail Preview */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 border-amber-500/60 bg-stone-950 overflow-hidden shrink-0 shadow-[0_0_15px_rgba(217,119,6,0.3)]">
            <img 
              src={selectedImageUrl || DEFAULT_NEUTRAL_MONSTER_IMAGE} 
              alt={creatureName} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/30 rounded-lg pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm">🖼️</span>
              <h3 className="text-xs sm:text-sm font-cinzel font-black uppercase tracking-wider text-amber-300">
                Aparência da Criatura
              </h3>
            </div>
            <p className="text-[11px] text-stone-400 font-cinzel mt-0.5">
              Defina a imagem antes de salvar no Bestiário
            </p>
          </div>
        </div>

        {/* Action: Reset to neutral default */}
        {selectedImageUrl !== DEFAULT_NEUTRAL_MONSTER_IMAGE && (
          <button
            type="button"
            onClick={() => onSelectImage(DEFAULT_NEUTRAL_MONSTER_IMAGE)}
            className="self-start sm:self-center px-2.5 py-1 text-[10px] font-cinzel font-bold text-stone-400 hover:text-amber-300 bg-stone-950/60 hover:bg-stone-800 border border-stone-800 hover:border-amber-700/50 rounded transition-colors flex items-center gap-1.5"
            title="Restaurar para imagem neutra padrão"
          >
            <RefreshCw size={11} />
            <span>Usar Imagem Padrão</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation (1. Biblioteca, 2. Internet, 3. Upload) */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-950/80 rounded-lg border border-stone-800">
        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`px-3 py-2 rounded-md text-[11px] font-cinzel font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'library'
              ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-100 shadow-md border border-amber-500/50'
              : 'text-stone-400 hover:text-amber-200 hover:bg-stone-900/60'
          }`}
        >
          <BookOpen size={13} className="shrink-0" />
          <span className="truncate">📚 Biblioteca</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`px-3 py-2 rounded-md text-[11px] font-cinzel font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'search'
              ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-100 shadow-md border border-amber-500/50'
              : 'text-stone-400 hover:text-amber-200 hover:bg-stone-900/60'
          }`}
        >
          <Search size={13} className="shrink-0" />
          <span className="truncate">🌐 Internet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-3 py-2 rounded-md text-[11px] font-cinzel font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'upload'
              ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-100 shadow-md border border-amber-500/50'
              : 'text-stone-400 hover:text-amber-200 hover:bg-stone-900/60'
          }`}
        >
          <Upload size={13} className="shrink-0" />
          <span className="truncate">📤 Upload</span>
        </button>
      </div>

      {/* Dynamic Feedback Banner */}
      {statusMessage && (
        <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-cinzel flex items-center gap-2 animate-in fade-in duration-200">
          <Sparkles size={14} className="text-amber-400 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-cinzel flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: 📚 BIBLIOTECA DE MONSTROS */}
      {activeTab === 'library' && (
        <div className="space-y-3.5">
          {/* Categories Selector Chips */}
          <div className="flex flex-wrap gap-1.5">
            {MONSTER_LIBRARY_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded text-[11px] font-cinzel tracking-wider uppercase transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-amber-600/30 text-amber-200 border-amber-500 font-black shadow-[0_0_10px_rgba(217,119,6,0.3)]'
                      : 'bg-stone-950/70 text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <span className="text-xs">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Grid of Images for Current Category */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 sm:max-h-72 overflow-y-auto p-1 custom-scrollbar">
            {libraryImages.map((item: MonsterLibraryImage) => {
              const isSelected = selectedImageUrl === item.url;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectImage(item.url)}
                  className={`group relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-[4/5] bg-stone-950 ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[0.98]'
                      : 'border-stone-800 hover:border-amber-600/60 hover:scale-[1.02]'
                  }`}
                >
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                  {/* Active Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-lg">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}

                  {/* Creature Name on Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-2">
                    <p className="text-[10px] font-cinzel font-bold text-amber-200 leading-tight drop-shadow truncate">
                      {item.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 🌐 BUSCAR NA INTERNET */}
      {activeTab === 'search' && (
        <div className="space-y-3.5">
          {/* Search Form */}
          <form onSubmit={(e) => handleInternetSearch(e)} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: dragão, lich, vampiro, golem, orc, lobo..."
                className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-amber-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/70"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            </div>

            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-amber-950 font-cinzel font-black text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              {isSearching ? <RefreshCw size={13} className="animate-spin" /> : <Search size={13} />}
              <span>Buscar</span>
            </button>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-cinzel text-stone-400">
            <span className="text-amber-400/80 mr-1">Sugestões:</span>
            {['Dragão Vermelho', 'Lich Negro', 'Demônio de Fogo', 'Golem de Pedra', 'Lobo Atroz', 'Basilisco'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setSearchQuery(term);
                  handleInternetSearch(undefined, term);
                }}
                className="px-2 py-0.5 rounded bg-stone-950 border border-stone-800 hover:border-amber-600 text-stone-300 hover:text-amber-200 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Search Results Grid */}
          {searchError && (
            <div className="p-4 rounded-lg bg-stone-950/60 border border-dashed border-stone-800 text-center text-xs text-stone-400 font-cinzel">
              {searchError}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-cinzel text-amber-400/80 px-1">
                <span>Resultados Encontrados ({searchResults.length}):</span>
                <span className="text-[10px] text-stone-500">Clique para salvar permanentemente no Firebase</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 sm:max-h-72 overflow-y-auto p-1 custom-scrollbar">
                {searchResults.map((item) => {
                  const isSelected = selectedImageUrl === item.fullUrl || selectedImageUrl === item.thumbUrl;
                  return (
                    <div
                      key={item.id}
                      onClick={() => !isProcessing && handleSelectInternetImage(item)}
                      className={`group relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-[4/5] bg-stone-950 ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[0.98]'
                          : 'border-stone-800 hover:border-amber-600/60 hover:scale-[1.02]'
                      }`}
                    >
                      <img 
                        src={item.thumbUrl || item.fullUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-lg">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}

                      <div className="absolute bottom-0 inset-x-0 p-2">
                        <p className="text-[10px] font-cinzel font-bold text-amber-200 leading-tight drop-shadow truncate">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-[10px] text-stone-500 italic font-cinzel pt-1">
            * As imagens selecionadas da internet são automaticamente baixadas e salvas permanentemente no Firebase Storage via StorageService.
          </p>
        </div>
      )}

      {/* TAB 3: 📤 FAZER UPLOAD */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isProcessing 
                ? 'border-amber-500/50 bg-amber-500/5 pointer-events-none'
                : 'border-amber-900/40 hover:border-amber-500/70 bg-stone-950/60 hover:bg-stone-950'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {isProcessing ? (
                <RefreshCw size={24} className="animate-spin text-amber-400" />
              ) : (
                <Upload size={24} />
              )}
            </div>

            <div>
              <p className="text-xs font-cinzel font-bold text-amber-200 uppercase tracking-wider">
                {isProcessing ? 'Enviando para o Firebase Storage...' : 'Clique para selecionar imagem do seu dispositivo'}
              </p>
              <p className="text-[11px] text-stone-400 mt-1 font-cinzel">
                Suporta PNG, JPG, WEBP e GIF (gravação permanente vinculada à criatura)
              </p>
            </div>

            {!isProcessing && (
              <button
                type="button"
                className="mt-1 px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-100 font-cinzel font-black text-xs uppercase tracking-wider rounded border border-amber-500/40 shadow-md"
              >
                Selecionar Arquivo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
