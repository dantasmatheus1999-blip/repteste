export type PerformancePreset = 'ultra' | 'high' | 'balanced' | 'mobile';

export type BenchmarkStageId = 
  | 'no_shadows'
  | 'with_shadows'
  | 'full_lighting'
  | 'pbr_standard'
  | 'pbr_physical'
  | 'pixel_ratio_1x'
  | 'pixel_ratio_1_5x'
  | 'pixel_ratio_2x';

export interface BenchmarkStageConfig {
  id: BenchmarkStageId;
  name: string;
  description: string;
  category: 'shadows' | 'lighting' | 'materials' | 'resolution';
  settings: {
    shadows: boolean;
    shadowMapSize: number;
    fullLighting: boolean;
    usePhysicalMaterials: boolean;
    pixelRatio: number;
  };
}

export interface BenchmarkResult {
  stageId: BenchmarkStageId;
  stageName: string;
  avgFps: number;
  minFps: number;
  maxFps: number;
  avgFrameTimeMs: number;
  triangles: number;
  drawCalls: number;
  geometries: number;
  materialsCount: number;
  pixelRatio: number;
  canvasRealResolution: string;
  shadowMapResolution: string;
  notes: string;
}

export interface ShadowLightInfo {
  name: string;
  type: string;
  mapSize: string;
  bias: number;
  intensity: number;
  castShadow: boolean;
}

export interface SuspectedBottleneck {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  impact: string;
  description: string;
  recommendation: string;
}

export interface SceneBottleneckAudit {
  timestamp: string;
  fps: number;
  frameTimeMs: number;
  triangles: number;
  drawCalls: number;
  geometriesCount: number;
  programsCount: number;
  materialsCount: number;
  pixelRatio: number;
  devicePixelRatioNative: number;
  canvasCssResolution: string;
  canvasRealResolution: string;
  shadowsEnabled: boolean;
  shadowMapType: string;
  shadowCastingLights: ShadowLightInfo[];
  shadowCastersCount: number;
  shadowReceiversCount: number;
  meshPhysicalCount: number;
  meshPhysicalObjects: { meshName: string; materialName: string; hasTransmission: boolean; hasClearcoat: boolean }[];
  transparentMaterialsCount: number;
  transparentObjects: { meshName: string; materialName: string; alphaTest: number; doubleSided: boolean }[];
  antialiasEnabled: boolean;
  toneMapping: string;
  toneMappingExposure: number;
  activeLightsCount: number;
  suspectedBottlenecks: SuspectedBottleneck[];
}

export interface CustomizationAudit3D {
  hairAsset: {
    status: 'loaded' | 'none' | 'error';
    name: string;
    style: string;
    sourceFile: string;
  };
  hairMeshesCount: number;
  hairMaterialsCount: number;
  hairColorTarget: {
    found: boolean;
    targetsCount: number;
    currentColorHex: string;
    materialNames: string[];
  };
  eyeIrisMesh: {
    found: boolean;
    names: string[];
  };
  eyeIrisMaterial: {
    found: boolean;
    names: string[];
    currentColorHex: string;
  };
  eyeColorTarget: {
    found: boolean;
    activeColor: string;
  };
}

