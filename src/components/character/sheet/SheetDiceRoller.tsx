import React, { useEffect } from 'react';
import { useDice3D } from '../../dice3d/Dice3DContext';
import { Floating3DDice } from '../../dice3d/Floating3DDice';
import { DiceType } from '../../dice3d/types';

interface SheetDiceRollerProps {
  externalRoll?: { formula: string; label?: string; timestamp: number } | null;
}

export const SheetDiceRoller: React.FC<SheetDiceRollerProps> = ({ externalRoll }) => {
  const { roll3DDice } = useDice3D();

  // Reage a cliques em perícias, ataques, atributos ou magias na ficha
  useEffect(() => {
    if (!externalRoll) return;

    const { formula, label } = externalRoll;
    const clean = formula.replace(/\s+/g, '');
    const match = clean.match(/^(\d*)d(\d+)([+-]\d+)?$/i);

    let diceType: DiceType = 'd20';
    let modifier = 0;

    if (match) {
      const sides = parseInt(match[2], 10);
      if (sides === 4) diceType = 'd4';
      else if (sides === 6) diceType = 'd6';
      else if (sides === 8) diceType = 'd8';
      else if (sides === 10) diceType = 'd10';
      else if (sides === 12) diceType = 'd12';
      else if (sides === 100) diceType = 'd100';
      else diceType = 'd20';

      modifier = match[3] ? parseInt(match[3], 10) : 0;
    } else {
      const numOnly = parseInt(clean, 10);
      if (!isNaN(numOnly)) {
        modifier = numOnly;
      }
    }

    roll3DDice({
      diceType,
      modifier,
      label: label || 'Rolagem da Ficha',
      formula
    });
  }, [externalRoll, roll3DDice]);

  return <Floating3DDice />;
};
