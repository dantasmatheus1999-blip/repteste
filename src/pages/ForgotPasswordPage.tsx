import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('Este Selo Arcano não foi encontrado no Grimório.');
      } else {
        setError('Erro ao enviar o ritual de recuperação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mythos-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-gold/5 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card relative p-8 sm:p-10 border-2 border-gold/20 bg-mythos-card/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-gold/30 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-gold/30 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-gold/30 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-gold/30 rounded-br-3xl" />

          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Link to="/auth" className="inline-flex items-center gap-2 text-[10px] text-gold/40 hover:text-gold transition-colors uppercase font-black tracking-[0.3em] group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Codex
              </Link>
              <h2 className="text-3xl font-cinzel text-gold-gradient font-black tracking-widest uppercase">
                Recuperar Palavra de Poder
              </h2>
              <p className="text-gold/40 font-cinzel italic text-sm">
                "O ritual de recuperação será enviado ao seu Selo Arcano"
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-health/10 border border-health/30 flex items-center gap-3 text-health text-sm font-cinzel animate-in shake duration-500">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="p-6 rounded-xl bg-gold/5 border border-gold/20 text-center space-y-6 animate-in zoom-in duration-700">
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto text-gold">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-cinzel text-gold tracking-widest uppercase">Ritual Enviado</h3>
                  <p className="text-gold/40 font-cinzel italic text-sm">
                    Verifique seu Selo Arcano (Email) para redefinir sua Palavra de Poder.
                  </p>
                </div>
                <Link to="/auth" className="block">
                  <Button variant="secondary" className="w-full">
                    Retornar ao Codex
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gold/60 uppercase font-black tracking-[0.3em] ml-1">
                    Selo Arcano (Email)
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/20 group-focus-within:text-gold/60 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-black/40 border-2 border-gold/10 rounded-xl py-4 pl-12 pr-6 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 focus:bg-black/60 transition-all font-cinzel"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 text-lg shadow-2xl shadow-gold/20"
                  icon={loading ? undefined : Send}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Enviando Ritual...</span>
                    </div>
                  ) : (
                    'Enviar Ritual'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
