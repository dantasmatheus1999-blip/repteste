import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ScrollText, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { useNavigate } from 'react-router-dom';
import { AvatarUploader } from './AvatarUploader';

interface RegisterFormProps {
  onSuccess?: () => void;
  onToggle?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onToggle }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { withLoading } = useLoading();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As Palavras de Poder não coincidem.');
      return;
    }

    if (!terms) {
      setError('Aceite os termos do Grimório para continuar.');
      return;
    }

    setLoading(true);

    try {
      await withLoading(
        register(name, email, password, avatar || undefined),
        "Inscrevendo sua alma no Codex..."
      );
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/select-profile');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este Selo Arcano já está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('A Palavra de Poder é muito fraca.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('O provedor de Email/Senha não está habilitado no Firebase Console.');
      } else {
        setError('Erro ao registrar no Grimório. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-health/10 border border-health/20 flex items-center gap-2 text-health text-[10px] sm:text-xs font-sans py-2 animate-in shake duration-500">
          <AlertCircle size={14} className="shrink-0" />
          <span className="tracking-wide leading-tight">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Compact Avatar Uploader */}
        <div className="flex justify-center scale-90 -my-2">
          <AvatarUploader onFileSelect={setAvatar} />
        </div>

        <div className="space-y-2.5">
          {/* Nome do Aventureiro */}
          <div className="space-y-1">
            <label className="text-[9px] text-gold/50 uppercase font-bold tracking-[0.25em] ml-1">
              Nome do Aventureiro
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/20 group-focus-within:text-gold/50 transition-colors duration-500">
                <UserIcon size={16} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Galen de Valkaria"
                className="mythos-input w-full pl-11 pr-5 h-[52px] py-0 text-sm font-sans text-gold/90"
              />
            </div>
          </div>

          {/* Selo Arcano (Email) */}
          <div className="space-y-1">
            <label className="text-[9px] text-gold/50 uppercase font-bold tracking-[0.25em] ml-1">
              Selo Arcano (Email)
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/20 group-focus-within:text-gold/50 transition-colors duration-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mythos-input w-full pl-11 pr-5 h-[52px] py-0 text-sm font-sans text-gold/90"
              />
            </div>
          </div>

          {/* Senha e Confirmação de Senha Lado a Lado (Compacto) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] text-gold/50 uppercase font-bold tracking-[0.2em] ml-1">
                Palavra de Poder
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/20 group-focus-within:text-gold/50 transition-colors duration-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mythos-input w-full pl-11 pr-5 h-[52px] py-0 text-sm font-sans text-gold/90"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-gold/50 uppercase font-bold tracking-[0.2em] ml-1">
                Confirmar Senha
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/20 group-focus-within:text-gold/50 transition-colors duration-500">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mythos-input w-full pl-11 pr-5 h-[52px] py-0 text-sm font-sans text-gold/90"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Checkbox Termos de Uso (Mais compacto) */}
        <div className="flex items-center gap-2.5 px-1 py-0.5">
          <input
            type="checkbox"
            id="terms"
            required
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="w-4.5 h-4.5 rounded border-gold/20 bg-black/40 text-gold focus:ring-gold/40 transition-all cursor-pointer shrink-0"
          />
          <label htmlFor="terms" className="text-[9px] text-gold/45 uppercase font-bold tracking-wider cursor-pointer hover:text-gold transition-colors leading-tight">
            Aceito as leis sagradas de Valkaria
          </label>
        </div>

        {/* Botão Registrar no Grimório */}
        <button
          type="submit"
          disabled={loading}
          className="btn-premium btn-premium-gold w-full h-[52px] sm:h-[54px] py-0 text-xs font-black uppercase tracking-[0.2em] cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Inscrevendo...</span>
            </>
          ) : (
            <>
              <ScrollText size={16} />
              <span>Registrar no Grimório</span>
            </>
          )}
        </button>
      </form>

      {/* Switcher para retornar ao Login */}
      {onToggle && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onToggle}
            className="group relative inline-flex items-center gap-1.5 text-[10px] text-gold/50 hover:text-gold transition-colors uppercase font-bold tracking-wide cursor-pointer"
          >
            <span>Já possui registro?</span>
            <span className="text-gold font-extrabold underline underline-offset-4 group-hover:text-white transition-colors">
              Acessar o Codex
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
