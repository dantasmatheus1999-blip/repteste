import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { Link, useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onToggle: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { withLoading } = useLoading();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await withLoading(
        login(email, password),
        "Consultando os arquivos proibidos..."
      );
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Selo Arcano ou Palavra de Poder incorretos.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('O provedor de Email/Senha não está habilitado no Firebase Console.');
      } else {
        setError('Erro ao acessar o Codex. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await withLoading(
        loginWithGoogle(),
        "Convocando os investigadores..."
      );
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Erro ao acessar via Google. Tente novamente.');
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

      {/* Formulário de Login */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-2.5">
          {/* Email Input */}
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

          {/* Password Input + Recuperar Senha */}
          <div className="space-y-1">
            <label className="text-[9px] text-gold/50 uppercase font-bold tracking-[0.25em] ml-1">
              Palavra de Poder (Senha)
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
            
            {/* Link de Recuperar Senha abaixo dos campos */}
            <div className="flex justify-end px-1 pt-0.5">
              <Link 
                to="/forgot-password" 
                className="text-[9px] text-gold/45 hover:text-gold transition-colors uppercase font-bold tracking-wider underline underline-offset-2"
              >
                Esqueceu a Palavra?
              </Link>
            </div>
          </div>
        </div>

        {/* Botão Entrar no Codex */}
        <button
          type="submit"
          disabled={loading}
          className="btn-premium btn-premium-gold w-full h-[52px] sm:h-[54px] py-0 text-xs font-black uppercase tracking-[0.2em] cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Canalizando...</span>
            </>
          ) : (
            <>
              <LogIn size={16} />
              <span>Entrar no Codex</span>
            </>
          )}
        </button>
      </form>

      {/* Divisor "OU" */}
      <div className="relative py-1.5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gold/10"></div>
        </div>
        <span className="relative bg-mythos-bg md:bg-mythos-card/95 px-3 text-[9px] uppercase font-bold tracking-[0.35em] text-gold/25">OU</span>
      </div>

      {/* Botão Continuar com Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="btn-premium w-full h-[52px] sm:h-[54px] py-0 text-xs font-black uppercase tracking-[0.2em] group cursor-pointer"
      >
        <div className="relative flex items-center justify-center gap-3">
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" />
          <span>Continuar com Google</span>
        </div>
      </button>

      {/* Switcher para registro "Criar Conta" em tamanho menor */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onToggle}
          className="group relative inline-flex items-center gap-1.5 text-[10px] text-gold/50 hover:text-gold transition-colors uppercase font-bold tracking-wide cursor-pointer"
        >
          <span>Não possui registro?</span>
          <span className="text-gold font-extrabold underline underline-offset-4 group-hover:text-white transition-colors">
            Criar Conta
          </span>
        </button>
      </div>
    </div>
  );
};
