export interface GrantedPower {
  name: string;
  description: string;
}

export interface T20DeityDetail {
  id: string;
  slug: string;
  name: string;
  system: string;
  edition: string;
  summary: string;
  beliefsAndGoals: string;
  sacredSymbol: string;
  channelDivinity: string;
  favoredWeapon: string;
  devotees: string;
  obligationsAndRestrictions: string[];
  grantedPowerIds: string[];
  description: string;
  iconName: string;
}
