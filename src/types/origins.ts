export interface OriginPower {
  name: string;
  description: string;
}

export interface T20OriginDetail {
  id: string;
  slug: string;
  name: string;
  system: string;
  edition: string;
  summary: string;
  startingItems: string[];
  skills: string[];
  availablePowers: string[];
  originPowers: OriginPower[];
  description: string;
  iconName: string;
}
