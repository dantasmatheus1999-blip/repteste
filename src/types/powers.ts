export type PowerCategory = 'combate' | 'destino' | 'magia' | 'concedidos' | 'tormenta';

export interface T20Power {
  id: string;
  slug: string;
  name: string;
  category: PowerCategory;
  prerequisites?: string;
  description: string;
  source: string;
  tags: string[];
  deityIds?: string[]; // Multiple deities can grant the same power
  deityNames?: string[];
  tormentaEffect?: string; // Specific for Tormenta powers
}
