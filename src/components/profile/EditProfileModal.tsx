import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Check, 
  Loader2, 
  Sparkles, 
  Camera, 
  Image as ImageIcon, 
  User, 
  AlertCircle,
  Sword,
  Shield,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfileService, PRESET_AVATARS, PRESET_COVERS, PlayerProfileData } from '../../services/userProfileService';
import { CharacterService } from '../../services/characterService';
import { T20Character } from '../../types/t20';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: PlayerProfileData | null;
  onProfileUpdated: (updated: Partial<PlayerProfileData>) => void;
  userId: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
  userId
}) => {
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [mainCharacterId, setMainCharacterId] = useState('');

  // Character list for main character selection
  const [userCharacters, setUserCharacters] = useState<(T20Character & { id: string })[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(false);

  // File upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  // Validation and submit states
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // References to hidden file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Active tab for asset selection: 'presets' | 'upload'
  const [activeAvatarTab, setActiveAvatarTab] = useState<'presets' | 'upload'>('presets');
  const [activeCoverTab, setActiveCoverTab] = useState<'presets' | 'upload'>('presets');

  useEffect(() => {
    if (isOpen && currentProfile) {
      setDisplayName(currentProfile.displayName || currentProfile.name || '');
      setUsername(currentProfile.username ? currentProfile.username.replace(/^@/, '') : '');
      setBio(currentProfile.bio || '');
      setAvatarUrl(currentProfile.avatarUrl || currentProfile.photoURL || '');
      setCoverUrl(currentProfile.coverUrl || '');
      setMainCharacterId(currentProfile.mainCharacterId || '');
      setAvatarPreview(currentProfile.avatarUrl || currentProfile.photoURL || '');
      setCoverPreview(currentProfile.coverUrl || '');
      setAvatarFile(null);
      setCoverFile(null);
      setErrorMessage(null);
      setUsernameAvailable(null);

      // Load user characters for selection
      setLoadingCharacters(true);
      CharacterService.getUserCharacters(userId)
        .then((chars) => {
          if (chars) setUserCharacters(chars);
        })
        .catch((e) => console.error('Erro ao carregar personagens:', e))
        .finally(() => setLoadingCharacters(false));
    }
  }, [isOpen, currentProfile, userId]);

  if (!isOpen) return null;

  // Handle avatar file selection
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('A imagem de avatar deve ter menos de 5MB.');
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setAvatarUrl(''); // Clears preset url since file is selected
    setErrorMessage(null);
  };

  // Handle cover file selection
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('A imagem de capa deve ter menos de 10MB.');
      return;
    }

    setCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
    setCoverUrl(''); // Clears preset url since file is selected
    setErrorMessage(null);
  };

  // Check username on blur or debounced
  const handleUsernameBlur = async () => {
    if (!username.trim()) {
      setUsernameAvailable(null);
      return;
    }
    setUsernameChecking(true);
    const result = await UserProfileService.checkUsernameAvailability(username, userId);
    setUsernameChecking(false);
    setUsernameAvailable(result.available);
    if (!result.available && result.reason) {
      setErrorMessage(result.reason);
    } else {
      setErrorMessage(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!displayName.trim()) {
      setErrorMessage('O Nome de Exibição não pode ficar vazio.');
      return;
    }

    setIsSaving(true);

    try {
      // 1. Process and upload avatar if a new file was chosen
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        setUploadingAvatar(true);
        finalAvatarUrl = await UserProfileService.uploadAvatar(avatarFile, userId);
        setUploadingAvatar(false);
      }

      // 2. Process and upload cover if a new file was chosen
      let finalCoverUrl = coverUrl;
      if (coverFile) {
        setUploadingCover(true);
        finalCoverUrl = await UserProfileService.uploadCover(coverFile, userId);
        setUploadingCover(false);
      }

      // 3. Validate username uniqueness if provided
      let cleanUsername = '';
      if (username.trim()) {
        const check = await UserProfileService.checkUsernameAvailability(username, userId);
        if (!check.available) {
          setErrorMessage(check.reason || 'Nome de usuário indisponível.');
          setIsSaving(false);
          return;
        }
        cleanUsername = check.cleanUsername;
      }

      // 4. Resolve main character snapshot details for quick display
      let selectedCharDetails: Partial<PlayerProfileData> = {};
      if (mainCharacterId) {
        const selectedChar = userCharacters.find(c => c.id === mainCharacterId);
        if (selectedChar) {
          selectedCharDetails = {
            mainCharacterId: selectedChar.id,
            mainCharacterName: selectedChar.name,
            mainCharacterClass: selectedChar.classId || 'Aventureiro',
            mainCharacterRace: selectedChar.raceId || 'Artoniano',
            mainCharacterLevel: selectedChar.level || 1,
            mainCharacterAvatar: selectedChar.imageUrl || ''
          };
        }
      } else {
        selectedCharDetails = {
          mainCharacterId: '',
          mainCharacterName: '',
          mainCharacterClass: '',
          mainCharacterRace: '',
          mainCharacterLevel: 1,
          mainCharacterAvatar: ''
        };
      }

      // 5. Assemble update payload
      const updatedData: Partial<PlayerProfileData> = {
        displayName: displayName.trim(),
        name: displayName.trim(),
        username: cleanUsername,
        bio: bio.trim(),
        photoURL: finalAvatarUrl || avatarPreview || currentProfile?.photoURL || '',
        avatarUrl: finalAvatarUrl || avatarPreview || currentProfile?.photoURL || '',
        coverUrl: finalCoverUrl || coverPreview || currentProfile?.coverUrl || '',
        ...selectedCharDetails
      };

      await UserProfileService.updateUserProfile(userId, updatedData);
      onProfileUpdated(updatedData);
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar alterações no perfil:', err);
      setErrorMessage(err.message || 'Erro ao salvar alterações no perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
      setUploadingAvatar(false);
      setUploadingCover(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-[#0d0e12] border border-amber-600/50 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Gold Corner Accents */}
          <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400 z-20 pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400 z-20 pointer-events-none" />
          <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400 z-20 pointer-events-none" />
          <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400 z-20 pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-amber-900/40 bg-[#12141a]/90 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rotate-45 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <h2 className="text-base sm:text-lg font-cinzel font-black uppercase text-amber-200 tracking-wider">
                Editar Perfil do Jogador
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-amber-200 hover:border-amber-600/40 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Body Form */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-600/50 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SEÇÃO: CAPA DO PERFIL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-amber-400" />
                  Capa do Perfil
                </label>
                <div className="flex items-center gap-1 text-[11px] font-cinzel">
                  <button
                    type="button"
                    onClick={() => setActiveCoverTab('presets')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      activeCoverTab === 'presets' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Galeria Artón
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCoverTab('upload')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      activeCoverTab === 'upload' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Enviar Imagem
                  </button>
                </div>
              </div>

              {/* Cover Preview */}
              <div className="relative w-full h-28 sm:h-32 rounded-lg border border-amber-600/30 overflow-hidden bg-stone-950 group">
                {coverPreview ? (
                  <img src={coverPreview} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 text-xs">
                    <ImageIcon size={24} className="mb-1 opacity-50" />
                    <span>Nenhuma capa selecionada</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute bottom-2 right-2 py-1 px-2.5 rounded-md bg-stone-900/90 hover:bg-stone-800 border border-amber-500/50 text-amber-200 text-[10px] font-cinzel font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Camera size={12} />
                  <span>Trocar Capa</span>
                </button>
              </div>

              <input 
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="hidden"
              />

              {activeCoverTab === 'presets' && (
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {PRESET_COVERS.map(cov => (
                    <button
                      key={cov.id}
                      type="button"
                      onClick={() => {
                        setCoverUrl(cov.url);
                        setCoverPreview(cov.url);
                        setCoverFile(null);
                      }}
                      className={`relative h-12 rounded-md overflow-hidden border transition-all cursor-pointer group ${
                        coverPreview === cov.url ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105 z-10' : 'border-stone-800 hover:border-amber-600/50'
                      }`}
                    >
                      <img src={cov.url} alt={cov.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent" />
                      {coverPreview === cov.url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-amber-300">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SEÇÃO: AVATAR DO JOGADOR */}
            <div className="space-y-2 pt-2 border-t border-stone-800/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-amber-400" />
                  Avatar do Jogador
                </label>
                <div className="flex items-center gap-1 text-[11px] font-cinzel">
                  <button
                    type="button"
                    onClick={() => setActiveAvatarTab('presets')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      activeAvatarTab === 'presets' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Heróis de Artón
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAvatarTab('upload')}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      activeAvatarTab === 'upload' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Foto Própria
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Avatar Preview Tile */}
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl border-2 border-amber-500/70 overflow-hidden bg-stone-900 shadow-lg shrink-0 group">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-400 font-cinzel font-bold text-xl">
                      {displayName?.[0]?.toUpperCase() || 'A'}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-amber-200 cursor-pointer"
                  >
                    <Camera size={14} />
                    <span className="text-[8px] font-cinzel uppercase mt-0.5">Alterar</span>
                  </button>
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-xs text-stone-300 font-medium">
                    Escolha um retrato de herói ou envie sua própria imagem de aventureiro.
                  </p>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="py-1 px-2.5 rounded-md bg-[#13141a] hover:bg-stone-800 border border-amber-600/40 text-amber-300 text-[11px] font-cinzel font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload size={12} />
                    <span>Upload do Dispositivo</span>
                  </button>
                </div>
              </div>

              <input 
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />

              {activeAvatarTab === 'presets' && (
                <div className="grid grid-cols-6 gap-2 pt-1">
                  {PRESET_AVATARS.map(av => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(av.url);
                        setAvatarPreview(av.url);
                        setAvatarFile(null);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer group ${
                        avatarPreview === av.url ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 z-10' : 'border-stone-800 hover:border-amber-600/40'
                      }`}
                      title={av.name}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                      {avatarPreview === av.url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-amber-300">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SEÇÃO: IDENTIDADE DO JOGADOR */}
            <div className="space-y-3.5 pt-2 border-t border-stone-800/60">
              {/* Nome de Exibição */}
              <div>
                <label className="block text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1">
                  Nome de Exibição <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: Draynor Poteffar"
                  maxLength={60}
                  className="w-full bg-[#13141a] border border-amber-600/40 focus:border-amber-400 rounded-lg px-3 py-2 text-stone-100 text-xs sm:text-sm font-sans outline-none transition-colors shadow-inner"
                  required
                />
              </div>

              {/* Username Único @username */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider">
                    Nome de Usuário Único (@username)
                  </label>
                  {usernameChecking ? (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-sans">
                      <Loader2 size={10} className="animate-spin" /> Verificando...
                    </span>
                  ) : usernameAvailable === true ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans font-bold">
                      <Check size={10} /> Disponível
                    </span>
                  ) : null}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-amber-500 font-cinzel font-bold text-sm pointer-events-none">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setUsername(clean);
                      setUsernameAvailable(null);
                    }}
                    onBlur={handleUsernameBlur}
                    placeholder="draynor"
                    maxLength={30}
                    className="w-full bg-[#13141a] border border-amber-600/40 focus:border-amber-400 rounded-lg pl-7 pr-3 py-2 text-stone-100 text-xs sm:text-sm font-mono outline-none transition-colors shadow-inner"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1 font-sans">
                  Seus amigos podem encontrar seu perfil através do seu @username.
                </p>
              </div>

              {/* Frase / Status / Bio */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider">
                    Frase / Status do Jogador
                  </label>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {bio.length}/200
                  </span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="“Um clérigo em busca dos segredos esquecidos de Artón.”"
                  maxLength={200}
                  rows={2}
                  className="w-full bg-[#13141a] border border-amber-600/40 focus:border-amber-400 rounded-lg px-3 py-2 text-stone-100 text-xs sm:text-sm font-sans outline-none transition-colors shadow-inner resize-none"
                />
              </div>

              {/* SEÇÃO: PERSONAGEM PRINCIPAL */}
              <div>
                <label className="block text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sword size={14} className="text-amber-400" />
                  Personagem Principal de Destaque
                </label>
                
                {loadingCharacters ? (
                  <div className="py-2 text-xs text-stone-400 font-sans flex items-center gap-2">
                    <Loader2 size={13} className="animate-spin text-amber-400" /> Carregando seus heróis...
                  </div>
                ) : userCharacters.length === 0 ? (
                  <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800 text-stone-400 text-xs font-sans">
                    Você ainda não criou nenhum personagem. Crie um na aba <strong className="text-amber-300">Personagens</strong> para exibi-lo aqui.
                  </div>
                ) : (
                  <select
                    value={mainCharacterId}
                    onChange={(e) => setMainCharacterId(e.target.value)}
                    className="w-full bg-[#13141a] border border-amber-600/40 focus:border-amber-400 rounded-lg px-3 py-2 text-stone-100 text-xs sm:text-sm font-cinzel outline-none transition-colors shadow-inner cursor-pointer"
                  >
                    <option value="">Nenhum personagem em destaque</option>
                    {userCharacters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name} ({char.raceId || 'Raça'} • {char.classId || 'Classe'} Nv. {char.level || 1})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[10px] text-stone-400 mt-1 font-sans">
                  O personagem principal ganha destaque no topo do seu perfil de RPG.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-amber-900/40 flex items-center justify-end gap-2.5 sticky bottom-0 bg-[#0d0e12] py-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="py-2 px-4 rounded-lg border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200 font-cinzel text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving || uploadingAvatar || uploadingCover}
                className="relative group py-2 px-5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-cinzel text-xs font-black uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} strokeWidth={3} />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
