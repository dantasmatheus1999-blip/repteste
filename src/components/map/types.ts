export interface GridSettings {
  enabled: boolean;
  size: number; // in pixels at 100% zoom (e.g. 50px)
  color: string;
  opacity: number;
}

export interface FogSettings {
  density: number; // 0.6 to 1.0 (default 0.95)
  feather: number; // 5 to 40 px (default 20)
  type: 'dense' | 'dark' | 'spectral';
}

export interface MapMarker {
  id: string;
  x: number; // percentage 0-100 relative to map image
  y: number; // percentage 0-100 relative to map image
  label: string;
  color: string;
  icon: 'pin' | 'sword' | 'skull' | 'shield' | 'star' | 'chest';
}

export interface TestMap {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  grid?: GridSettings;
  fogData?: string; // base64 PNG data URL of fog mask (1920x1080 native)
  fogSettings?: FogSettings;
  markers?: MapMarker[];
}

export type ToolType = 
  | 'select'
  | 'pan'
  | 'zoom-in'
  | 'zoom-out'
  | 'grid'
  | 'fog-paint'
  | 'fog-reveal'
  | 'marker'
  | 'image'
  | 'delete';

export interface TvSyncState {
  mapId: string;
  mapName: string;
  imageUrl: string;
  grid: GridSettings;
  fogData: string;
  fogSettings?: FogSettings;
  markers: MapMarker[];
  viewport: {
    zoom: number;
    panX: number;
    panY: number;
  };
  updatedAt: string;
  tvLastSeen?: string;
}

export interface TestPlayer {
  id: string;
  name: string;
  characterClass: string;
  status: 'online' | 'away' | 'offline';
  hp: { current: number; max: number };
  pm: { current: number; max: number };
  icon?: string;
}
