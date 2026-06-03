import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type LoaderTheme = 'eye' | 'occult' | 'compass' | 'swords';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string | null;
  loaderTheme: LoaderTheme;
  setLoaderTheme: (theme: LoaderTheme) => void;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  // A wrapper to handle loading for any promise with a minimum 600ms duration
  withLoading: <T>(promise: Promise<T> | (() => Promise<T>), message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

const RANDOM_MESSAGES = [
  "Consultando os arquivos proibidos...",
  "Preparando a investigação...",
  "Organizando as evidências...",
  "Desvendando os mistérios...",
  "Convocando os investigadores...",
  "Abrindo os registros de Arkham...",
  "Preparando a jornada...",
  "Traduzindo o Necronomicon...",
  "Desenhando o círculo de transmutação...",
  "Alinhando as estrelas no firmamento...",
  "Escutando os sussurros arcanos...",
  "Exumando relíquias esquecidas..."
];

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeLoaders, setActiveLoaders] = useState(0);
  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const [loaderTheme, setLoaderThemeState] = useState<LoaderTheme>('occult');
  const [displayMessage, setDisplayMessage] = useState(RANDOM_MESSAGES[0]);
  
  // Persist chosen theme in localStorage if available
  useEffect(() => {
    const savedTheme = localStorage.getItem('realmor_loader_theme') as LoaderTheme;
    if (savedTheme && ['eye', 'occult', 'compass', 'swords'].includes(savedTheme)) {
      setLoaderThemeState(savedTheme);
    }
  }, []);

  const setLoaderTheme = useCallback((theme: LoaderTheme) => {
    setLoaderThemeState(theme);
    localStorage.setItem('realmor_loader_theme', theme);
  }, []);

  const isLoading = activeLoaders > 0;

  // Cycle randomized messages every 3 seconds while loading
  useEffect(() => {
    if (!isLoading) return;

    if (customMessage) {
      setDisplayMessage(customMessage);
      return;
    }

    // Set initial random message
    const initialIndex = Math.floor(Math.random() * RANDOM_MESSAGES.length);
    setDisplayMessage(RANDOM_MESSAGES[initialIndex]);

    const intervalId = setInterval(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * RANDOM_MESSAGES.length);
      } while (RANDOM_MESSAGES[nextIndex] === displayMessage && RANDOM_MESSAGES.length > 1);

      setDisplayMessage(RANDOM_MESSAGES[nextIndex]);
    }, 2800);

    return () => clearInterval(intervalId);
  }, [isLoading, customMessage]);

  const loaderOpenTimeRef = useRef<number>(0);

  const showLoader = useCallback((message?: string) => {
    if (message) setCustomMessage(message);
    loaderOpenTimeRef.current = Date.now();
    setActiveLoaders(prev => prev + 1);
  }, []);

  const hideLoader = useCallback(() => {
    setActiveLoaders(prev => {
      const next = Math.max(0, prev - 1);
      if (next === 0) {
        setCustomMessage(null);
      }
      return next;
    });
  }, []);

  // Enforces a minimum 600ms load screen to keep transitions premium
  const withLoading = useCallback(async <T,>(
    promise: Promise<T> | (() => Promise<T>),
    message?: string
  ): Promise<T> => {
    showLoader(message);
    const startTime = Date.now();
    
    try {
      const resolvedPromise = typeof promise === 'function' ? promise() : promise;
      const result = await resolvedPromise;
      
      const elapsed = Date.now() - startTime;
      if (elapsed < 600) {
        await new Promise(resolve => setTimeout(resolve, 600 - elapsed));
      }
      return result;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 600) {
        await new Promise(resolve => setTimeout(resolve, 600 - elapsed));
      }
      throw error;
    } finally {
      hideLoader();
    }
  }, [showLoader, hideLoader]);

  const contextValue = React.useMemo(() => ({
    isLoading,
    loadingMessage: customMessage || displayMessage,
    loaderTheme,
    setLoaderTheme,
    showLoader,
    hideLoader,
    withLoading
  }), [isLoading, customMessage, displayMessage, loaderTheme, setLoaderTheme, showLoader, hideLoader, withLoading]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <ArcaneLoaderComponent theme={loaderTheme} message={customMessage || displayMessage} />
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
};

// Render the fully-featured, immersive, magical occult animations
const ArcaneLoaderComponent: React.FC<{ theme: LoaderTheme; message: string }> = ({ theme, message }) => {
  // Generate random drifting particles in viewport
  const [particles] = useState(() => 
    Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100 + 100, // start below and rise
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2
    }))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md select-none touch-none overflow-hidden"
    >
      {/* Mystical Moving Fog Background Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -inset-[50%] bg-gradient-to-tr from-stone-900 via-transparent to-amber-950/20 mix-blend-color-dodge animate-pulse duration-[8000ms]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px] animate-mist" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-magic-light/5 blur-[150px] animate-mist [animation-delay:4s]" />
      </div>

      {/* Floating Sparkles (Partículas Discretas) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: `${p.x}vw`, y: '110vh' }}
            animate={{ 
              opacity: [0, 0.7, 0.7, 0], 
              y: '-10vh',
              x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`]
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity, 
              delay: p.delay,
              ease: "easeOut"
            }}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: theme === 'compass' || theme === 'occult' ? '#e5c158' : '#70b3ff',
              boxShadow: theme === 'compass' || theme === 'occult' 
                ? '0 0 10px #e5c158, 0 0 20px rgba(229,193,88,0.5)'
                : '0 0 10px #70b3ff, 0 0 20px rgba(112,179,255,0.5)'
            }}
          />
        ))}
      </div>

      {/* Central Visual Block */}
      <div className="relative flex flex-col items-center justify-center max-w-xs text-center z-10 px-4">
        {/* Subtle background golden aura */}
        <div className={`absolute w-44 h-44 rounded-full blur-[40px] opacity-20 transition-all duration-1000 ${
          theme === 'compass' || theme === 'occult' ? 'bg-amber-400' : 'bg-magic'
        }`} />

        {/* Rotating Circular Arcane Seal */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          {/* Outer Ring - slow clockwise rotation */}
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 32, ease: "linear", repeat: Infinity }}
            className={`absolute w-full h-full opacity-60 ${
              theme === 'compass' || theme === 'occult' ? 'text-gold' : 'text-magic'
            }`}
            viewBox="0 0 100 100"
          >
            {/* Circle borders */}
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 4 10 4" />
            <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
            
            {/* Arcane letters/marks around outer edge */}
            <defs>
              <path id="textPath" d="M 50,50 m -45,0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0" />
            </defs>
            <text className="font-mono text-[4px] fill-current tracking-[0.25em]">
              <textPath href="#textPath" startOffset="0%">
                * MYTHOS * ARKHAM * RITUALIS * SANCTUM * OCCULT * PORTAL * LIBRIS
              </textPath>
            </text>
          </motion.svg>

          {/* Inner Ring - slower counter-clockwise rotation */}
          <motion.svg
            animate={{ rotate: -360 }}
            transition={{ duration: 45, ease: "linear", repeat: Infinity }}
            className={`absolute w-[82%] h-[82%] opacity-40 ${
              theme === 'compass' || theme === 'occult' ? 'text-gold-light' : 'text-magic-light'
            }`}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="20 15 5 15" />
            <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 10 3 8" />
            <path d="M 50,5 L 50,8 M 50,92 L 50,95 M 5,50 L 8,50 M 92,50 L 95,50" stroke="currentColor" strokeWidth="0.75" />
          </motion.svg>

          {/* Central Pulsing Icon */}
          <motion.div
            animate={{ 
              scale: [0.94, 1.06, 0.94],
              filter: [
                'drop-shadow(0 0 12px rgba(212,175,55,0.3))',
                'drop-shadow(0 0 25px rgba(212,175,55,0.75))',
                'drop-shadow(0 0 12px rgba(212,175,55,0.3))'
              ]
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute w-[45%] h-[45%] flex items-center justify-center ${
              theme === 'compass' || theme === 'occult' ? 'text-gold' : 'text-magic-light'
            }`}
            style={{
              filter: theme === 'compass' || theme === 'occult'
                ? undefined
                : 'drop-shadow(0 0 12px rgba(112,179,255,0.5))'
            }}
          >
            {renderCentralSymbol(theme)}
          </motion.div>
        </div>

        {/* Ornate Separator Line */}
        <div className="relative w-28 h-4 my-6 flex items-center justify-center">
          <div className={`h-[1px] w-full bg-gradient-to-r from-transparent via-current to-transparent ${
            theme === 'compass' || theme === 'occult' ? 'text-gold/40' : 'text-magic/40'
          }`} />
          <div className={`absolute w-2 h-2 rotate-45 border border-current bg-black ${
            theme === 'compass' || theme === 'occult' ? 'text-gold/60' : 'text-magic/60'
          }`} />
        </div>

        {/* Dynamic Occult Text (Texto Dinâmico) with smooth fade transitions */}
        <div className="h-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.85, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="text-stone-300 font-cinzel text-xs uppercase tracking-[0.2em] leading-relaxed drop-shadow-md text-center max-w-sm"
            >
              {message}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// Custom SVG symbols for themes: Eye, Occult Sigil, Compass Rose, Crossed Swords
const renderCentralSymbol = (theme: LoaderTheme) => {
  switch (theme) {
    case 'eye':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="1.75">
          {/* Eye outline */}
          <path d="M 12,50 C 30,22 70,22 88,50 C 70,78 30,78 12,50 Z" />
          {/* Iris */}
          <circle cx="50" cy="50" r="16" />
          {/* Pupil */}
          <circle cx="50" cy="50" r="7" className="fill-current" />
          {/* Eyelash beams / rays radiating outwardly */}
          <line x1="50" y1="18" x2="50" y2="10" />
          <line x1="50" y1="82" x2="50" y2="90" />
          <line x1="18" y1="32" x2="13" y2="27" />
          <line x1="82" y1="32" x2="87" y2="27" />
          <line x1="18" y1="68" x2="13" y2="73" />
          <line x1="82" y1="68" x2="87" y2="73" />
          {/* Occult star details */}
          <polygon points="50,26 53,35 62,35 55,41 57,50 50,44 43,50 45,41 38,35 47,35" className="fill-current opacity-30 stroke-none" />
        </svg>
      );
    case 'compass':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="1.5">
          {/* Outer Dial */}
          <circle cx="50" cy="50" r="32" />
          <circle cx="50" cy="50" r="34" strokeDasharray="1 3" />
          <circle cx="50" cy="50" r="28" strokeDasharray="3 6" />
          
          {/* Compass Points */}
          {/* N/S/E/W main heavy points */}
          <polygon points="50,14 54,42 50,45" className="fill-current" />
          <polygon points="50,14 46,42 50,45" />
          
          <polygon points="50,86 46,58 50,55" className="fill-current" />
          <polygon points="50,86 54,58 50,55" />
          
          <polygon points="86,50 58,46 55,50" className="fill-current" />
          <polygon points="86,50 58,54 55,50" />
          
          <polygon points="14,50 42,54 45,50" className="fill-current" />
          <polygon points="14,50 42,46 45,50" />

          {/* Sub-cardinal points */}
          <polygon points="24,24 45,45 42,48" className="opacity-70 fill-current" />
          <polygon points="76,24 55,45 58,48" className="opacity-70 fill-current" />
          <polygon points="24,76 45,55 42,52" className="opacity-70 fill-current" />
          <polygon points="76,76 55,55 58,52" className="opacity-70 fill-current" />

          {/* Center spindle */}
          <circle cx="50" cy="50" r="2.5" className="fill-black" />
          <circle cx="50" cy="50" r="1.5" className="fill-current" />
        </svg>
      );
    case 'swords':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Ornate back crest */}
          <circle cx="50" cy="50" r="26" strokeDasharray="4 8" className="opacity-50" />
          
          {/* Sword 1 (slanted top-left to bottom-right) */}
          <g transform="rotate(45 50 50)">
            {/* Blade */}
            <path d="M 50,8 L 47,42 L 50,78 L 53,42 Z" fill="rgba(255,255,255,0.05)" />
            <line x1="50" y1="12" x2="50" y2="78" />
            {/* Guard */}
            <path d="M 38,78 L 62,78" strokeWidth="2.5" />
            <circle cx="38" cy="78" r="1.5" className="fill-current" />
            <circle cx="62" cy="78" r="1.5" className="fill-current" />
            {/* Grip */}
            <line x1="50" y1="78" x2="50" y2="88" strokeWidth="2.5" />
            {/* Pommel */}
            <circle cx="50" cy="90" r="3.5" className="fill-current" />
            {/* Ancient rune marks */}
            <line x1="50" y1="36" x2="48" y2="38" />
            <line x1="50" y1="46" x2="52" y2="48" />
          </g>

          {/* Sword 2 (slanted top-right to bottom-left) */}
          <g transform="rotate(-45 50 50)">
            {/* Blade */}
            <path d="M 50,8 L 47,42 L 50,78 L 53,42 Z" fill="rgba(255,255,255,0.05)" />
            <line x1="50" y1="12" x2="50" y2="78" />
            {/* Guard */}
            <path d="M 38,78 L 62,78" strokeWidth="2.5" />
            <circle cx="38" cy="78" r="1.5" className="fill-current" />
            <circle cx="62" cy="78" r="1.5" className="fill-current" />
            {/* Grip */}
            <line x1="50" y1="78" x2="50" y2="88" strokeWidth="2.5" />
            {/* Pommel */}
            <circle cx="50" cy="90" r="3.5" className="fill-current" />
            {/* Ancient rune marks */}
            <line x1="50" y1="36" x2="52" y2="38" />
            <line x1="50" y1="46" x2="48" y2="48" />
          </g>
        </svg>
      );
    case 'occult':
    default:
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="1.5">
          {/* Classic horror cosmic sigil / Star of Azathoth / Elder Sign */}
          {/* Concentric rings */}
          <circle cx="50" cy="50" r="18" strokeDasharray="2 4" />
          <circle cx="50" cy="50" r="30" />
          
          {/* Outer star triangles */}
          <polygon points="50,10 55,26 71,15 62,31 82,31 66,41 85,55 66,54 75,72 58,62 58,82 50,68 42,82 42,62 25,72 34,54 15,55 34,41 18,31 38,31 29,15 45,26" />
          
          {/* Central Eye / Flame */}
          <path d="M 36,50 Q 50,34 64,50 Q 50,66 36,50 Z" className="fill-current fill-opacity-[0.05]" />
          <circle cx="50" cy="50" r="5" className="fill-current" />
          
          {/* Rays matching the points */}
          <line x1="50" y1="50" x2="50" y2="26" strokeWidth="0.75" />
          <line x1="50" y1="50" x2="68" y2="40" strokeWidth="0.75" />
          <line x1="50" y1="50" x2="60" y2="60" strokeWidth="0.75" />
          <line x1="50" y1="50" x2="40" y2="60" strokeWidth="0.75" />
          <line x1="50" y1="50" x2="32" y2="40" strokeWidth="0.75" />
        </svg>
      );
  }
};
