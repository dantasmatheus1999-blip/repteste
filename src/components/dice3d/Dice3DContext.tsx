import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { DiceType, DiceSkin, DiceRollRequest, DiceRollResult } from './types';

interface Dice3DContextType {
  activeDiceType: DiceType;
  setActiveDiceType: (type: DiceType) => void;
  activeSkin: DiceSkin;
  setActiveSkin: (skin: DiceSkin) => void;
  isRolling: boolean;
  lastResult: DiceRollResult | null;
  roll3DDice: (request?: DiceRollRequest) => Promise<DiceRollResult>;
  isOptionsOpen: boolean;
  setIsOptionsOpen: (open: boolean) => void;
  pendingRollRequest: DiceRollRequest | null;
  clearResult: () => void;
}

const Dice3DContext = createContext<Dice3DContextType | undefined>(undefined);

export const Dice3DProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDiceType, setActiveDiceType] = useState<DiceType>('d20');
  const [activeSkin, setActiveSkin] = useState<DiceSkin>('black_obsidian');
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [pendingRollRequest, setPendingRollRequest] = useState<DiceRollRequest | null>(null);

  const resolveRef = useRef<((result: DiceRollResult) => void) | null>(null);

  const roll3DDice = useCallback((request?: DiceRollRequest): Promise<DiceRollResult> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      const req: DiceRollRequest = {
        diceType: request?.diceType || activeDiceType,
        skin: request?.skin || activeSkin,
        modifier: request?.modifier || 0,
        label: request?.label || 'Rolagem de D20',
        formula: request?.formula || `1${request?.diceType || activeDiceType}`,
        forcedValue: request?.forcedValue,
        onComplete: (res) => {
          setIsRolling(false);
          setLastResult(res);
          request?.onComplete?.(res);
          if (resolveRef.current) {
            resolveRef.current(res);
            resolveRef.current = null;
          }
        }
      };

      setIsRolling(true);
      setPendingRollRequest(req);
    });
  }, [activeDiceType, activeSkin]);

  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return (
    <Dice3DContext.Provider
      value={{
        activeDiceType,
        setActiveDiceType,
        activeSkin,
        setActiveSkin,
        isRolling,
        lastResult,
        roll3DDice,
        isOptionsOpen,
        setIsOptionsOpen,
        pendingRollRequest,
        clearResult
      }}
    >
      {children}
    </Dice3DContext.Provider>
  );
};

export const useDice3D = () => {
  const context = useContext(Dice3DContext);
  if (!context) {
    throw new Error('useDice3D must be used within a Dice3DProvider');
  }
  return context;
};
