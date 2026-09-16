import { useState, useCallback } from 'react';
import { DieRoll } from '../types';

export const useDiceRoller = () => {
  const [history, setHistory] = useState<DieRoll[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<DieRoll | null>(null);

  const roll = useCallback(async (formula: string) => {
    // Exemplo simples: "2d20 + 5"
    const match = formula.match(/(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/i);
    
    if (!match) return null;

    setIsRolling(true);
    setLastResult(null);

    // Simular tempo de rolagem
    await new Promise(resolve => setTimeout(resolve, 600));

    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifierSign = match[3] === '-' ? -1 : 1;
    const modifierValue = match[4] ? parseInt(match[4]) : 0;

    let total = 0;
    const rolls: number[] = [];

    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * sides) + 1;
      rolls.push(r);
      total += r;
    }

    const finalResult = total + (modifierSign * modifierValue);
    
    const newRoll: DieRoll = {
      id: crypto.randomUUID(),
      formula,
      result: finalResult,
      details: `(${rolls.join(' + ')}) ${modifierValue ? `${match[3]} ${modifierValue}` : ''}`,
      timestamp: Date.now(),
      userId: 'local-user'
    };

    setHistory(prev => [newRoll, ...prev].slice(0, 20));
    setLastResult(newRoll);
    setIsRolling(false);
    return newRoll;
  }, []);

  return { roll, history, isRolling, lastResult };
};
