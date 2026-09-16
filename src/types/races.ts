export interface RacialAbility {
  name: string;
  description: string;
}

export interface AttributeModifier {
  attribute: string;
  value: number;
}

export interface T20RaceDetail {
  id: string;
  slug: string;
  name: string;
  system: string;
  edition: string;
  summary: string;
  iconName: string;
  attributeModifiers: AttributeModifier[];
  racialAbilities: RacialAbility[];
  playstyle: string[];
  synergies: {
    classes: string[];
    builds: string[];
  };
  description: string;
}
