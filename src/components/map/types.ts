export interface GridSettings {
  enabled: boolean;
  size: number; // in pixels at 100% zoom (e.g. 50px)
  color: string;
  opacity: number;
  thickness?: number; // line stroke width in pixels (e.g. 1 to 5, default 1.2)
  scaleMeters?: number; // scale per grid cell (default 1.5m / 3m)
}

export type FogMode = 'hide' | 'reveal';
export type FogShape = 'rect' | 'freehand';

export interface FogSettings {
  density: number; // 0.15 to 1.0 (default 0.95)
  feather: number; // 4 to 45 px (default 20)
  type: 'dense' | 'dark' | 'spectral';
  mode?: FogMode;
  shape?: FogShape;
}

export interface MapMarker {
  id: string;
  x: number; // percentage 0-100 relative to map image
  y: number; // percentage 0-100 relative to map image
  label: string;
  color: string;
  icon: 'pin' | 'sword' | 'skull' | 'shield' | 'star' | 'chest';
}

export interface MapDrawing {
  id: string;
  points: { x: number; y: number }[]; // native coordinates (1920x1080)
  color: string;
  width: number;
  opacity: number;
}

export type ShapeType = 'rect' | 'circle' | 'line' | 'arrow';

export interface MapShape {
  id: string;
  type: ShapeType;
  start: { x: number; y: number }; // native coords (1920x1080)
  end: { x: number; y: number }; // native coords (1920x1080)
  color: string;
  fillColor?: string;
  strokeWidth: number;
  opacity: number;
  label?: string;
}

export interface SelectedObject {
  id: string;
  type: 'marker' | 'drawing' | 'shape' | 'vision';
}

export interface VisionArea {
  id: string;
  x: number; // native coords (1920x1080)
  y: number; // native coords (1920x1080)
  radiusMeters: number; // 5, 10, or 15 meters
  label?: string;
}

export interface MapFolder {
  id: string;
  userId?: string;
  ownerId?: string;
  name: string;
  description?: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestMap {
  id: string;
  userId?: string;
  ownerId?: string;
  name: string;
  fileName?: string;
  storagePath?: string;
  downloadURL?: string;
  imageUrl: string;
  fileSize?: number;
  fileType?: string;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  grid?: GridSettings;
  fogData?: string; // base64 PNG data URL of fog mask (1920x1080 native)
  fogSettings?: FogSettings;
  markers?: MapMarker[];
  drawings?: MapDrawing[];
  shapes?: MapShape[];
  visionAreas?: VisionArea[];
}

export type SplitLayoutCount = 1 | 2 | 3 | 4;

export interface QuadrantMapState {
  quadrantId: number; // 0, 1, 2, 3
  mapId: string | null;
  zoom: number;
  pan: { x: number; y: number };
  resetViewTrigger?: number;
}

export type ToolType = 
  | 'select'
  | 'pan'
  | 'split'
  | 'measure'
  | 'marker'
  | 'fog'
  | 'fog-paint'
  | 'fog-reveal'
  | 'fog-vision'
  | 'grid'
  | 'draw'
  | 'shape'
  | 'eraser'
  | 'sounds'
  | 'image'
  | 'delete';

export interface TvSyncQuadrantItem {
  mapId: string;
  mapName: string;
  imageUrl: string;
  grid?: GridSettings;
  fogData?: string;
  fogSettings?: FogSettings;
  markers?: MapMarker[];
  drawings?: MapDrawing[];
  shapes?: MapShape[];
  visionAreas?: VisionArea[];
  viewport?: {
    zoom: number;
    panX: number;
    panY: number;
  };
}

export interface TvSyncState {
  mapId: string;
  mapName: string;
  imageUrl: string;
  grid: GridSettings;
  fogData: string;
  fogSettings?: FogSettings;
  markers: MapMarker[];
  drawings?: MapDrawing[];
  shapes?: MapShape[];
  visionAreas?: VisionArea[];
  viewport?: {
    zoom: number;
    panX: number;
    panY: number;
  };
  // Suporte a tela dividida
  splitCount?: SplitLayoutCount;
  quadrants?: TvSyncQuadrantItem[];
  campaignId?: string;
  gameId?: string;
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
