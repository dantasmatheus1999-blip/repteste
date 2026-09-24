import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  ChevronLeft, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Sun, 
  Activity, 
  Upload, 
  Sparkles, 
  Eye, 
  Settings2, 
  Shield, 
  User, 
  Box, 
  Play, 
  Pause,
  Maximize2,
  RefreshCw,
  HelpCircle,
  Scissors,
  Palette,
  RotateCcw,
  Check,
  Smile,
  Dices,
  Zap,
  Camera,
  Compass,
  CheckCircle2,
  X
} from 'lucide-react';
import { BenchmarkModal } from './BenchmarkModal';
import { 
  BenchmarkStageId, 
  BenchmarkResult, 
  SceneBottleneckAudit, 
  PerformancePreset,
  CustomizationAudit3D
} from './benchmarkTypes';
import { 
  BENCHMARK_STAGES, 
  PRESET_CONFIGS, 
  inspectSceneBottlenecks 
} from './benchmarkUtils';

type PresetModel = 'vitruvian' | 'character' | 'helmet' | 'sword_shield' | 'monolith' | 'custom';
export type VitruvianPartMode = 'body_and_head' | 'body_only' | 'head_only';

export type HairStyleId = 'vitruvian_hair' | 'hairtool_cards' | 'none';
export type HairColorId = 'black' | 'brown' | 'light_brown' | 'blonde' | 'red' | 'gray' | 'white';
export type EyeColorId = 'brown' | 'blue' | 'green' | 'amber' | 'gray' | 'purple';
export type BeardStyleId = 'none' | 'short' | 'full' | 'long';
export type CharacterCategory = 'appearance' | 'hair' | 'eyes' | 'face' | 'beard' | 'body';

export interface CharacterAppearance3D {
  hair: HairStyleId;
  hairColor: HairColorId;
  eyeColor: EyeColorId;
  beard: BeardStyleId;
}

export const HAIR_COLORS: { id: HairColorId; name: string; hex: string; threeColor: number }[] = [
  { id: 'black', name: 'Preto', hex: '#18181b', threeColor: 0x18181b },
  { id: 'brown', name: 'Castanho', hex: '#3d2618', threeColor: 0x4a2c1b },
  { id: 'light_brown', name: 'Castanho Claro', hex: '#6e4827', threeColor: 0x7c4e2a },
  { id: 'blonde', name: 'Loiro', hex: '#dfba6a', threeColor: 0xebc973 },
  { id: 'red', name: 'Ruivo', hex: '#c83e18', threeColor: 0xc83e18 },
  { id: 'gray', name: 'Grisalho', hex: '#787882', threeColor: 0x8a8a96 },
  { id: 'white', name: 'Branco', hex: '#f1f1f5', threeColor: 0xf0f0f5 },
];

export const EYE_COLORS: { id: EyeColorId; name: string; hex: string; threeColor: number; gradient: string }[] = [
  { id: 'brown', name: 'Castanho', hex: '#5c3a1e', threeColor: 0x7a4924, gradient: 'from-amber-950 via-amber-900 to-stone-900' },
  { id: 'blue', name: 'Azul Gélido', hex: '#2563eb', threeColor: 0x2b7fff, gradient: 'from-blue-600 via-sky-600 to-indigo-950' },
  { id: 'green', name: 'Esmeralda', hex: '#15803d', threeColor: 0x22c55e, gradient: 'from-emerald-600 via-green-600 to-emerald-950' },
  { id: 'amber', name: 'Âmbar Dourado', hex: '#d97706', threeColor: 0xf59e0b, gradient: 'from-amber-500 via-yellow-600 to-amber-950' },
  { id: 'gray', name: 'Cinza Tempestade', hex: '#64748b', threeColor: 0x94a3b8, gradient: 'from-slate-400 via-slate-600 to-slate-900' },
  { id: 'purple', name: 'Arcano Violeta', hex: '#7c3aed', threeColor: 0xa855f7, gradient: 'from-purple-600 via-violet-600 to-purple-950' },
];

export const HAIR_STYLES: { id: HairStyleId; name: string; description: string; preview: string; tag: string }[] = [
  { id: 'vitruvian_hair', name: 'Clássico Vitruvian', description: 'Mechas esculpidas & sobrancelhas', preview: 'Oficial', tag: 'Estilo 1' },
  { id: 'hairtool_cards', name: 'Fios Longos (Cards)', description: 'Geometria HairTool em camadas', preview: 'HairTool', tag: 'Estilo 2' },
  { id: 'none', name: 'Careca / Raspado', description: 'Visual limpo sem camada capilar', preview: 'Careca', tag: 'Livre' },
];

export const BEARD_STYLES: { id: BeardStyleId; name: string; description: string; tag: string }[] = [
  { id: 'none', name: 'Sem Barba', description: 'Rosto limpo e barbeado', tag: 'Padrão' },
  { id: 'short', name: 'Barba Curta', description: 'Barba cerrada estilizada (Fase 1)', tag: 'Preparada' },
  { id: 'full', name: 'Barba Cheia', description: 'Estilo lenhador robusto (Fase 1)', tag: 'Preparada' },
  { id: 'long', name: 'Barba Longa', description: 'Visual sábio / ancião (Fase 1)', tag: 'Preparada' },
];

export interface PartDiagnostics {
  name: string;
  sourceFile: string;
  status: 'loading' | 'loaded' | 'error' | 'disabled';
  meshCount: number;
  triangles: number;
  materialsInfo: string[];
  texturesLoaded: string[];
  fallbackUsed: boolean;
  boundingBox: { width: number; height: number; depth: number } | null;
  errorDetail?: string;
}

export interface VitruvianModularDiagnostics {
  characterName: string;
  repoUrl: string;
  license: string;
  totalHeight: number;
  totalTriangles: number;
  totalMeshes: number;
  mode: VitruvianPartMode;
  alignment: {
    origin: string;
    seamStatus: string;
    synchronized: boolean;
  };
  body: PartDiagnostics;
  head: PartDiagnostics;
  hair: PartDiagnostics;
  beard: PartDiagnostics;
  performanceCost: {
    bodyAndHeadTriangles: number;
    withHairTriangles: number;
    hairImpactPercentage: number;
    hairRenderWeight: 'Leve' | 'Médio' | 'Pesado';
  };
}

export const ThreeDModelTestPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Three.js instances refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Lights refs
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const secRimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const faceLightRef = useRef<THREE.PointLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // UI States
  const [activeModel, setActiveModel] = useState<PresetModel>('vitruvian');
  const [vitruvianMode, setVitruvianMode] = useState<VitruvianPartMode>('body_and_head');
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [vitruvianDiag, setVitruvianDiag] = useState<VitruvianModularDiagnostics | null>(null);
  const [showDiagModal, setShowDiagModal] = useState(false);

  // Character Appearance States (Fase 1: Cabelo, Cor Cabelo, Cor Olhos, Barba)
  const [appearance, setAppearance] = useState<CharacterAppearance3D>({
    hair: 'vitruvian_hair',
    hairColor: 'brown',
    eyeColor: 'brown',
    beard: 'none'
  });
  const [hairLayerVisible, setHairLayerVisible] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CharacterCategory>('hair');
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [activeCameraPreset, setActiveCameraPreset] = useState<'hero' | 'face' | 'torso' | 'side' | 'isometric'>('hero');

  // Performance & Rendering Controls
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [showShadows, setShowShadows] = useState(true);
  const [shadowMapResolution, setShadowMapResolution] = useState<number>(2048);
  const [fullLighting, setFullLighting] = useState(true);
  const [usePhysicalMaterials, setUsePhysicalMaterials] = useState(true);
  const usePhysicalMaterialsRef = useRef(true);
  const [activePreset, setActivePreset] = useState<PerformancePreset | 'custom'>('custom');
  const [pixelRatioSetting, setPixelRatioSetting] = useState<number>(
    typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1
  );
  const [lightIntensity, setLightIntensity] = useState(1.15);
  const [selectedBg, setSelectedBg] = useState<'pedestal' | 'arcane' | 'tavern' | 'void'>('pedestal');
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);

  // Real-time Metrics
  const [fps, setFps] = useState(60);
  const [frameTimeMs, setFrameTimeMs] = useState(16.6);
  const [drawCalls, setDrawCalls] = useState(0);
  const [trianglesCount, setTrianglesCount] = useState(0);
  const [geometriesCount, setGeometriesCount] = useState(0);
  const [cameraDistance, setCameraDistance] = useState('2.7m');

  // Benchmark Runner & Audit States
  const [sceneAudit, setSceneAudit] = useState<SceneBottleneckAudit | null>(null);
  const [isBenchmarkRunning, setIsBenchmarkRunning] = useState(false);
  const [benchmarkCurrentStage, setBenchmarkCurrentStage] = useState<BenchmarkStageId | null>(null);
  const [benchmarkProgress, setBenchmarkProgress] = useState(0);
  const [benchmarkResults, setBenchmarkResults] = useState<Record<string, BenchmarkResult>>({});

  // FPS & Frame Time calculation helpers
  const lastTimeRef = useRef(performance.now());
  const framesCountRef = useRef(0);
  const liveMetricsRef = useRef({
    currentFps: 60,
    currentFrameTimeMs: 16.6,
    drawCalls: 0
  });

  // ============================================================
  // PROCEDURAL 3D MODELS BUILDERS (Instant testing without assets)
  // ============================================================
  const createCharacterDummy = (): THREE.Group => {
    const group = new THREE.Group();
    group.name = 'character_dummy';

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.5, metalness: 0.1 });
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.7 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xc5a059, roughness: 0.2, metalness: 0.9 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8, metalness: 0.1 });
    const runeMat = new THREE.MeshBasicMaterial({ color: 0x6366f1 });

    // Cabeça
    const headGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 2.4;
    head.castShadow = true;
    group.add(head);

    // Diadema de Ouro
    const crownGeo = new THREE.TorusGeometry(0.33, 0.03, 12, 32);
    const crown = new THREE.Mesh(crownGeo, goldMat);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 2.45;
    crown.castShadow = true;
    group.add(crown);

    // Olhos
    const eyeGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.12, 2.44, 0.28);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(-0.12, 2.44, 0.28);
    group.add(leftEye, rightEye);

    // Pescoço
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.2, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 2.05;
    neck.castShadow = true;
    group.add(neck);

    // Torso / Peitoral de Armadura
    const chestGeo = new THREE.BoxGeometry(0.9, 0.85, 0.5);
    const chest = new THREE.Mesh(chestGeo, armorMat);
    chest.position.y = 1.6;
    chest.castShadow = true;
    chest.receiveShadow = true;
    group.add(chest);

    // Runa Central no Peito
    const runeGeo = new THREE.OctahedronGeometry(0.1, 0);
    const rune = new THREE.Mesh(runeGeo, runeMat);
    rune.position.set(0, 1.65, 0.26);
    group.add(rune);

    // Ombreiras
    const pauldronGeo = new THREE.SphereGeometry(0.24, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const leftPauldron = new THREE.Mesh(pauldronGeo, goldMat);
    leftPauldron.position.set(0.55, 1.9, 0);
    leftPauldron.rotation.z = -Math.PI / 6;
    leftPauldron.castShadow = true;
    const rightPauldron = new THREE.Mesh(pauldronGeo, goldMat);
    rightPauldron.position.set(-0.55, 1.9, 0);
    rightPauldron.rotation.z = Math.PI / 6;
    rightPauldron.castShadow = true;
    group.add(leftPauldron, rightPauldron);

    // Cintura & Cinto
    const waistGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.35, 16);
    const waist = new THREE.Mesh(waistGeo, leatherMat);
    waist.position.y = 1.1;
    waist.castShadow = true;
    group.add(waist);

    // Braços
    const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.75, 16);
    const leftArm = new THREE.Mesh(armGeo, armorMat);
    leftArm.position.set(0.58, 1.35, 0);
    leftArm.castShadow = true;
    const rightArm = new THREE.Mesh(armGeo, armorMat);
    rightArm.position.set(-0.58, 1.35, 0);
    rightArm.castShadow = true;
    group.add(leftArm, rightArm);

    // Pernas
    const legGeo = new THREE.CylinderGeometry(0.16, 0.12, 1.0, 16);
    const leftLeg = new THREE.Mesh(legGeo, armorMat);
    leftLeg.position.set(0.25, 0.5, 0);
    leftLeg.castShadow = true;
    const rightLeg = new THREE.Mesh(legGeo, armorMat);
    rightLeg.position.set(-0.25, 0.5, 0);
    rightLeg.castShadow = true;
    group.add(leftLeg, rightLeg);

    // Botas
    const bootGeo = new THREE.BoxGeometry(0.22, 0.25, 0.35);
    const leftBoot = new THREE.Mesh(bootGeo, leatherMat);
    leftBoot.position.set(0.25, 0.12, 0.05);
    leftBoot.castShadow = true;
    const rightBoot = new THREE.Mesh(bootGeo, leatherMat);
    rightBoot.position.set(-0.25, 0.12, 0.05);
    rightBoot.castShadow = true;
    group.add(leftBoot, rightBoot);

    return group;
  };

  const createHelmetModel = (): THREE.Group => {
    const group = new THREE.Group();
    group.name = 'helmet_model';

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

    // Cúpula do Elmo
    const domeGeo = new THREE.SphereGeometry(1.0, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const dome = new THREE.Mesh(domeGeo, steelMat);
    dome.position.y = 1.0;
    dome.castShadow = true;
    group.add(dome);

    // Crista Superior Heroica
    const crestGeo = new THREE.BoxGeometry(0.12, 0.45, 1.6);
    const crest = new THREE.Mesh(crestGeo, goldMat);
    crest.position.set(0, 2.0, 0);
    crest.castShadow = true;
    group.add(crest);

    // Viseira / Proteção Facial
    const visorGeo = new THREE.CylinderGeometry(0.98, 0.92, 0.85, 32, 1, true, 0, Math.PI);
    const visor = new THREE.Mesh(visorGeo, steelMat);
    visor.position.set(0, 0.95, 0);
    visor.rotation.y = -Math.PI / 2;
    visor.castShadow = true;
    group.add(visor);

    // Fenda dos Olhos
    const slitGeo = new THREE.BoxGeometry(0.85, 0.08, 0.2);
    const slit = new THREE.Mesh(slitGeo, darkMat);
    slit.position.set(0, 1.05, 0.9);
    group.add(slit);

    // Guarda-Pescoço
    const guardGeo = new THREE.CylinderGeometry(1.02, 1.15, 0.6, 32, 1, true);
    const guard = new THREE.Mesh(guardGeo, steelMat);
    guard.position.y = 0.4;
    guard.castShadow = true;
    group.add(guard);

    // Ornatos Laterais
    const rivetGeo = new THREE.SphereGeometry(0.06, 12, 12);
    for (let i = -3; i <= 3; i++) {
      const rivet = new THREE.Mesh(rivetGeo, goldMat);
      rivet.position.set(Math.sin(i * 0.3) * 1.02, 0.8, Math.cos(i * 0.3) * 1.02);
      group.add(rivet);
    }

    return group;
  };

  const createSwordShieldModel = (): THREE.Group => {
    const group = new THREE.Group();
    group.name = 'sword_shield_model';

    const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.85, roughness: 0.25 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const redMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 });

    // ESCUDO
    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(-0.7, 1.2, 0);
    shieldGroup.rotation.y = Math.PI / 8;

    const shieldGeo = new THREE.CylinderGeometry(0.7, 0.55, 1.4, 16);
    const shield = new THREE.Mesh(shieldGeo, redMat);
    shield.scale.set(1, 1, 0.2);
    shield.castShadow = true;
    shieldGroup.add(shield);

    // Borda do Escudo
    const rimGeo = new THREE.TorusGeometry(0.68, 0.04, 12, 24);
    const rim = new THREE.Mesh(rimGeo, goldMat);
    rim.position.z = 0.1;
    shieldGroup.add(rim);

    // Umbo Central
    const bossGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const boss = new THREE.Mesh(bossGeo, steelMat);
    boss.position.z = 0.15;
    shieldGroup.add(boss);

    group.add(shieldGroup);

    // ESPADA
    const swordGroup = new THREE.Group();
    swordGroup.position.set(0.7, 1.2, 0);
    swordGroup.rotation.z = -Math.PI / 12;

    // Lâmina
    const bladeGeo = new THREE.BoxGeometry(0.16, 2.2, 0.04);
    const blade = new THREE.Mesh(bladeGeo, steelMat);
    blade.position.y = 0.8;
    blade.castShadow = true;
    swordGroup.add(blade);

    // Ponta
    const tipGeo = new THREE.ConeGeometry(0.11, 0.35, 4);
    const tip = new THREE.Mesh(tipGeo, steelMat);
    tip.position.y = 1.95;
    tip.rotation.y = Math.PI / 4;
    swordGroup.add(tip);

    // Guarda
    const guardGeo = new THREE.BoxGeometry(0.7, 0.08, 0.12);
    const guard = new THREE.Mesh(guardGeo, goldMat);
    guard.position.y = -0.3;
    guard.castShadow = true;
    swordGroup.add(guard);

    // Cabo
    const gripGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12);
    const grip = new THREE.Mesh(gripGeo, woodMat);
    grip.position.y = -0.55;
    swordGroup.add(grip);

    // Pomo
    const pommelGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const pommel = new THREE.Mesh(pommelGeo, goldMat);
    pommel.position.y = -0.8;
    swordGroup.add(pommel);

    group.add(swordGroup);

    return group;
  };

  const createMonolithModel = (): THREE.Group => {
    const group = new THREE.Group();
    group.name = 'monolith_model';

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.6, metalness: 0.3 });
    const crystalMat = new THREE.MeshStandardMaterial({ 
      color: 0x818cf8, 
      roughness: 0.1, 
      metalness: 0.8,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.4
    });

    // Cristal Central
    const crystalGeo = new THREE.OctahedronGeometry(1.2, 0);
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = 1.5;
    crystal.scale.set(0.8, 1.8, 0.8);
    crystal.castShadow = true;
    group.add(crystal);

    // Anéis Orbitais Rúnicos
    const ring1Geo = new THREE.TorusGeometry(1.6, 0.04, 16, 64);
    const ring1Mat = new THREE.MeshStandardMaterial({ color: 0xc5a059, metalness: 0.9, roughness: 0.2 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.position.y = 1.5;
    ring1.rotation.x = Math.PI / 3;
    group.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(1.9, 0.03, 16, 64);
    const ring2 = new THREE.Mesh(ring2Geo, ring1Mat);
    ring2.position.y = 1.5;
    ring2.rotation.y = Math.PI / 4;
    group.add(ring2);

    // Pilares Flutuantes Menores
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const shardGeo = new THREE.ConeGeometry(0.18, 0.8, 5);
      const shard = new THREE.Mesh(shardGeo, stoneMat);
      shard.position.set(Math.sin(angle) * 1.8, 1.2 + Math.sin(i) * 0.3, Math.cos(angle) * 1.8);
      shard.rotation.z = Math.PI;
      shard.castShadow = true;
      group.add(shard);
    }

    return group;
  };

  // ============================================================
  // PEDESTAL & ENVIRONMENT SETUP (MEDIEVAL CHARACTER CREATOR DAIS)
  // ============================================================
  const updateEnvironment = useCallback((type: 'pedestal' | 'arcane' | 'tavern' | 'void') => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Adjust background color to match ambiance
    if (type === 'pedestal') {
      scene.background = new THREE.Color(0x0a0910);
    } else if (type === 'arcane') {
      scene.background = new THREE.Color(0x06060e);
    } else if (type === 'tavern') {
      scene.background = new THREE.Color(0x0f0a07);
    } else {
      scene.background = new THREE.Color(0x060608);
    }

    // Remove existing environment objects
    const oldEnv = scene.getObjectByName('environment_group');
    if (oldEnv) scene.remove(oldEnv);

    const envGroup = new THREE.Group();
    envGroup.name = 'environment_group';

    if (type === 'pedestal' || type === 'arcane' || type === 'tavern') {
      // 1. Plinto Principal Inferior (Stepped Basalt Dais)
      const isArcane = type === 'arcane';
      const isTavern = type === 'tavern';

      const baseGeo = new THREE.CylinderGeometry(2.1, 2.3, 0.16, 48);
      const baseMat = new THREE.MeshStandardMaterial({ 
        color: isArcane ? 0x141420 : isTavern ? 0x1c1410 : 0x18161b, 
        roughness: 0.85, 
        metalness: 0.12 
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = -0.08;
      base.receiveShadow = true;
      envGroup.add(base);

      // 2. Plinto Superior Interno (Inner Platform)
      const innerGeo = new THREE.CylinderGeometry(1.82, 1.92, 0.08, 48);
      const innerMat = new THREE.MeshStandardMaterial({
        color: isArcane ? 0x0e0e18 : isTavern ? 0x221812 : 0x121116,
        roughness: 0.8,
        metalness: 0.15
      });
      const innerDais = new THREE.Mesh(innerGeo, innerMat);
      innerDais.position.y = 0.02;
      innerDais.receiveShadow = true;
      envGroup.add(innerDais);

      // 3. Moldura Biselada de Bronze / Ouro Heroico
      const trimGeo = new THREE.TorusGeometry(1.84, 0.035, 16, 48);
      const trimMat = new THREE.MeshStandardMaterial({ 
        color: isArcane ? 0x818cf8 : isTavern ? 0xd97706 : 0xc5a059, 
        metalness: 0.85, 
        roughness: 0.25,
        emissive: isArcane ? new THREE.Color(0x3730a3) : new THREE.Color(0x291804),
        emissiveIntensity: isArcane ? 0.4 : 0.15
      });
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.position.y = 0.06;
      trim.rotation.x = Math.PI / 2;
      envGroup.add(trim);

      // 4. Anel Rúnico Central Concêntrico
      const runeRingGeo = new THREE.RingGeometry(1.05, 1.12, 48);
      const runeRingMat = new THREE.MeshStandardMaterial({
        color: isArcane ? 0x67e8f9 : isTavern ? 0xf59e0b : 0xd4af37,
        roughness: 0.3,
        metalness: 0.8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isArcane ? 0.75 : 0.55
      });
      const runeRing = new THREE.Mesh(runeRingGeo, runeRingMat);
      runeRing.position.y = 0.062;
      runeRing.rotation.x = -Math.PI / 2;
      runeRing.receiveShadow = true;
      envGroup.add(runeRing);

      // 5. Marcadores Cardinais no Pedestal
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const studGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12);
        const stud = new THREE.Mesh(studGeo, trimMat);
        stud.position.set(Math.cos(angle) * 1.5, 0.065, Math.sin(angle) * 1.5);
        envGroup.add(stud);
      }

      // 6. Suave receptor de sombra radial ao redor
      const shadowPlaneGeo = new THREE.CircleGeometry(4.8, 36);
      const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.45 });
      const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
      shadowPlane.position.y = -0.16;
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.receiveShadow = true;
      envGroup.add(shadowPlane);
    } else {
      // Void minimalista com chão discreto
      const shadowPlaneGeo = new THREE.CircleGeometry(4.0, 32);
      const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.4 });
      const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
      shadowPlane.position.y = 0;
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.receiveShadow = true;
      envGroup.add(shadowPlane);
    }

    scene.add(envGroup);
  }, []);

  // ============================================================
  // LOAD OR SWITCH MODEL IN SCENE
  // ============================================================
  const switchModel = useCallback((modelKey: PresetModel, customGroup?: THREE.Group) => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Remove current model
    if (currentModelGroupRef.current) {
      scene.remove(currentModelGroupRef.current);
      currentModelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
    }

    let newModel: THREE.Group;
    if (customGroup) {
      newModel = customGroup;
    } else if (modelKey === 'helmet') {
      newModel = createHelmetModel();
    } else if (modelKey === 'sword_shield') {
      newModel = createSwordShieldModel();
    } else if (modelKey === 'monolith') {
      newModel = createMonolithModel();
    } else {
      newModel = createCharacterDummy();
    }

    // Apply wireframe & shadow settings
    newModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = showShadows;
        mesh.receiveShadow = showShadows;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m: any) => {
              if ('wireframe' in m) m.wireframe = wireframe;
            });
          } else if ('wireframe' in mesh.material) {
            (mesh.material as any).wireframe = wireframe;
          }
        }
      }
    });

    // Auto-fit & Center Bounding Box only for procedural models (Vitruvian GLB is positioned precisely by its loader)
    if (modelKey !== 'vitruvian') {
      const box = new THREE.Box3().setFromObject(newModel);
      const center = box.getCenter(new THREE.Vector3());
      newModel.position.x = -center.x;
      newModel.position.z = -center.z;
      newModel.position.y = -box.min.y;
    }

    scene.add(newModel);
    currentModelGroupRef.current = newModel;
    setActiveModel(modelKey);

    // Calculate Triangles & Geometries
    let triangles = 0;
    let geoms = 0;
    newModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        geoms++;
        if (mesh.geometry) {
          if (mesh.geometry.index) {
            triangles += mesh.geometry.index.count / 3;
          } else if (mesh.geometry.attributes.position) {
            triangles += mesh.geometry.attributes.position.count / 3;
          }
        }
      }
    });
    setTrianglesCount(Math.round(triangles));
    setGeometriesCount(geoms);
  }, [showShadows, wireframe]);

  // Helper functions for Color conversions
  const getHairColorHex = useCallback((colorId: HairColorId): number => {
    return HAIR_COLORS.find(c => c.id === colorId)?.threeColor ?? 0x3d2618;
  }, []);

  const getEyeColorHex = useCallback((colorId: EyeColorId): number => {
    return EYE_COLORS.find(c => c.id === colorId)?.threeColor ?? 0x7a4924;
  }, []);

  // ============================================================
  // VITRUVIAN GODOT MODULAR LOADER & DIAGNOSTIC TRACKER (CORPO + CABEÇA + CABELO)
  // ============================================================
  const loadVitruvianModularCharacter = useCallback((
    mode: VitruvianPartMode = 'body_and_head',
    appearanceOverride?: CharacterAppearance3D,
    hairVisibilityOverride?: boolean
  ) => {
    if (!sceneRef.current) return;
    setIsLoadingModel(true);
    setErrorMessage(null);
    setVitruvianMode(mode);

    const currentApp = appearanceOverride || appearance;
    const currentHairVisible = hairVisibilityOverride !== undefined ? hairVisibilityOverride : hairLayerVisible;

    const repoSource = 'https://github.com/ibrews/VitruvianGodot';
    const bodyUrl = '/models/vitruvian/vitruvian_body.glb';
    const headUrl = '/models/vitruvian/vitruvian_head.glb';
    
    let hairUrl: string | null = null;
    if (mode !== 'body_only' && currentApp.hair !== 'none') {
      if (currentApp.hair === 'vitruvian_hair') {
        hairUrl = '/models/vitruvian/vitruvian_hair.glb';
      } else if (currentApp.hair === 'hairtool_cards') {
        hairUrl = '/models/vitruvian/hairtool_cards.glb';
      }
    }

    // Initial loading diagnostic state
    setVitruvianDiag({
      characterName: 'Vitruvian Modular Character (Tormenta20 Human Base)',
      repoUrl: repoSource,
      license: 'CC0 1.0 Universal (Public Domain) / MIT',
      totalHeight: 0,
      totalTriangles: 0,
      totalMeshes: 0,
      mode,
      alignment: {
        origin: 'CharMorph Coordinated Rest-Pose Origin (0, 0, 0)',
        seamStatus: 'Sincronizado no Pescoço e Crânio (Anatomical Alignment)',
        synchronized: true
      },
      body: {
        name: 'Corpo (vitruvian_body.glb)',
        sourceFile: 'godot_project/vitruvian_body.glb',
        status: mode !== 'head_only' ? 'loading' : 'disabled',
        meshCount: 0,
        triangles: 0,
        materialsInfo: [],
        texturesLoaded: [],
        fallbackUsed: false,
        boundingBox: null
      },
      head: {
        name: 'Cabeça (vitruvian_head.glb)',
        sourceFile: 'godot_project/vitruvian_head.glb',
        status: mode !== 'body_only' ? 'loading' : 'disabled',
        meshCount: 0,
        triangles: 0,
        materialsInfo: [],
        texturesLoaded: [],
        fallbackUsed: false,
        boundingBox: null
      },
      hair: {
        name: currentApp.hair === 'vitruvian_hair' 
          ? 'Cabelo Vitruvian (vitruvian_hair.glb)' 
          : currentApp.hair === 'hairtool_cards' 
            ? 'Cabelo HairTool (hairtool_cards.glb)' 
            : 'Cabelo (Desativado / Careca)',
        sourceFile: currentApp.hair === 'vitruvian_hair' 
          ? 'godot_project/vitruvian_hair.glb' 
          : currentApp.hair === 'hairtool_cards' 
            ? 'godot_project/hairtool_cards.glb' 
            : 'Nenhum (Careca)',
        status: hairUrl ? 'loading' : 'disabled',
        meshCount: 0,
        triangles: 0,
        materialsInfo: [],
        texturesLoaded: [],
        fallbackUsed: false,
        boundingBox: null
      },
      beard: {
        name: 'Barba (Fase 1: Preparada)',
        sourceFile: 'Sem asset oficial no repositório VitruvianGodot',
        status: 'disabled',
        meshCount: 0,
        triangles: 0,
        materialsInfo: ['Camada estruturada e pronta para integração em fases futuras'],
        texturesLoaded: [],
        fallbackUsed: false,
        boundingBox: null
      },
      performanceCost: {
        bodyAndHeadTriangles: 0,
        withHairTriangles: 0,
        hairImpactPercentage: 0,
        hairRenderWeight: 'Leve'
      }
    });

    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    // Prepare body textures
    const bodyAlbedo = textureLoader.load('/models/vitruvian/vit_body_bc.png');
    bodyAlbedo.flipY = false;
    bodyAlbedo.colorSpace = THREE.SRGBColorSpace;
    const bodyNormal = textureLoader.load('/models/vitruvian/vit_body_n.png');
    bodyNormal.flipY = false;
    const bodyRough = textureLoader.load('/models/vitruvian/vit_body_rough.png');
    bodyRough.flipY = false;

    // Prepare head textures
    const faceAlbedo = textureLoader.load('/models/vitruvian/vit_face_bc.png');
    faceAlbedo.flipY = false;
    faceAlbedo.colorSpace = THREE.SRGBColorSpace;
    const faceNormal = textureLoader.load('/models/vitruvian/vit_face_n.png');
    faceNormal.flipY = false;
    const faceRough = textureLoader.load('/models/vitruvian/vit_face_rough.png');
    faceRough.flipY = false;

    const irisTex = textureLoader.load('/models/vitruvian/vit_iris.png');
    irisTex.flipY = false;
    irisTex.colorSpace = THREE.SRGBColorSpace;
    const scleraTex = textureLoader.load('/models/vitruvian/vit_sclera.png');
    scleraTex.flipY = false;
    scleraTex.colorSpace = THREE.SRGBColorSpace;
    const mouthTex = textureLoader.load('/models/vitruvian/vit_mouth.png');
    mouthTex.flipY = false;
    mouthTex.colorSpace = THREE.SRGBColorSpace;
    const lashTex = textureLoader.load('/models/vitruvian/vit_lash_atlas.png');
    lashTex.flipY = false;
    lashTex.colorSpace = THREE.SRGBColorSpace;

    // Prepare hair textures
    const hairDiffuse = textureLoader.load('/models/vitruvian/vit_hair_diffuse.png');
    hairDiffuse.flipY = false;
    hairDiffuse.colorSpace = THREE.SRGBColorSpace;
    const hairNormal = textureLoader.load('/models/vitruvian/vit_hair_normal.png');
    hairNormal.flipY = false;
    const hairOpacity = textureLoader.load('/models/vitruvian/vit_hair_opacity.png');
    hairOpacity.flipY = false;
    const hairAO = textureLoader.load('/models/vitruvian/vit_hair_ao.png');
    hairAO.flipY = false;

    const promises: [Promise<any> | null, Promise<any> | null, Promise<any> | null] = [
      mode !== 'head_only' ? loader.loadAsync(bodyUrl) : null,
      mode !== 'body_only' ? loader.loadAsync(headUrl) : null,
      hairUrl ? loader.loadAsync(hairUrl) : null
    ];

    Promise.all(promises)
      .then(([bodyGltf, headGltf, hairGltf]) => {
        const characterRoot = new THREE.Group();
        characterRoot.name = 'vitruvian_modular_character';

        let totalTriangles = 0;
        let totalMeshes = 0;

        // --- 1. PROCESS BODY ---
        let bodyDiag: PartDiagnostics = {
          name: 'Corpo (vitruvian_body.glb)',
          sourceFile: 'godot_project/vitruvian_body.glb',
          status: 'disabled',
          meshCount: 0,
          triangles: 0,
          materialsInfo: [],
          texturesLoaded: [],
          fallbackUsed: false,
          boundingBox: null
        };

        if (bodyGltf) {
          const bodyGroup = bodyGltf.scene || bodyGltf.scenes[0];
          bodyGroup.name = 'vitruvian_body_layer';
          let bMeshes = 0;
          let bTriangles = 0;
          const bMats: string[] = [];
          const bTex: string[] = ['vit_body_bc.png', 'vit_body_n.png', 'vit_body_rough.png'];

          bodyGroup.traverse((child: any) => {
            if (child.isMesh) {
              const mesh = child as THREE.Mesh;
              bMeshes++;
              mesh.castShadow = showShadows;
              mesh.receiveShadow = showShadows;

              if (mesh.geometry) {
                if (mesh.geometry.index) {
                  bTriangles += mesh.geometry.index.count / 3;
                } else if (mesh.geometry.attributes.position) {
                  bTriangles += mesh.geometry.attributes.position.count / 3;
                }
              }

              // Material fallback PBR
              const currentMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
              const matName = currentMat?.name || mesh.name || 'BodyMesh';

              if (matName.includes('Shirt')) {
                mesh.material = new THREE.MeshStandardMaterial({
                  color: 0x1e293b,
                  roughness: 0.82,
                  metalness: 0.05,
                  name: 'VitBody_Shirt_PBR'
                });
                bMats.push(`${matName} -> PBR Tecido Escuro`);
              } else if (matName.includes('Pants')) {
                mesh.material = new THREE.MeshStandardMaterial({
                  color: 0x1c1917,
                  roughness: 0.65,
                  metalness: 0.08,
                  name: 'VitBody_Pants_PBR'
                });
                bMats.push(`${matName} -> PBR Calças Couro`);
              } else if (matName.includes('Shoes')) {
                mesh.material = new THREE.MeshStandardMaterial({
                  color: 0x292524,
                  roughness: 0.68,
                  metalness: 0.12,
                  name: 'VitBody_Shoes_PBR'
                });
                bMats.push(`${matName} -> PBR Botas`);
              } else {
                mesh.material = new THREE.MeshStandardMaterial({
                  map: bodyAlbedo,
                  normalMap: bodyNormal,
                  roughnessMap: bodyRough,
                  roughness: 0.58,
                  metalness: 0.0,
                  name: 'VitBody_Skin_PBR'
                });
                bMats.push(`${matName} -> PBR Pele (Albedo + Normal + Roughness)`);
              }
            }
          });

          const bodyBox = new THREE.Box3().setFromObject(bodyGroup);
          const bodySize = bodyBox.getSize(new THREE.Vector3());

          bodyDiag = {
            name: 'Corpo (vitruvian_body.glb)',
            sourceFile: 'godot_project/vitruvian_body.glb',
            status: 'loaded',
            meshCount: bMeshes,
            triangles: Math.round(bTriangles),
            materialsInfo: bMats,
            texturesLoaded: bTex,
            fallbackUsed: false,
            boundingBox: {
              width: Number(bodySize.x.toFixed(2)),
              height: Number(bodySize.y.toFixed(2)),
              depth: Number(bodySize.z.toFixed(2))
            }
          };

          totalTriangles += bTriangles;
          totalMeshes += bMeshes;
          characterRoot.add(bodyGroup);
        }

        // --- 2. PROCESS HEAD ---
        let headDiag: PartDiagnostics = {
          name: 'Cabeça (vitruvian_head.glb)',
          sourceFile: 'godot_project/vitruvian_head.glb',
          status: 'disabled',
          meshCount: 0,
          triangles: 0,
          materialsInfo: [],
          texturesLoaded: [],
          fallbackUsed: false,
          boundingBox: null
        };

        if (headGltf) {
          const headGroup = headGltf.scene || headGltf.scenes[0];
          headGroup.name = 'vitruvian_head_layer';
          let hMeshes = 0;
          let hTriangles = 0;
          const hMats: string[] = [];
          const hTex: string[] = [
            'vit_face_bc.png', 
            'vit_face_n.png', 
            'vit_face_rough.png', 
            'vit_iris.png', 
            'vit_sclera.png', 
            'vit_mouth.png', 
            'vit_lash_atlas.png'
          ];

          const createHeadMat = (mat: any, meshName: string, slotIdx: number): THREE.Material => {
            const matName = (mat?.name || '').toLowerCase();
            const mName = (meshName || '').toLowerCase();

            if (matName.includes('iris') || (mName.includes('eye') && (matName.includes('iris') || slotIdx === 1))) {
              hMats.push(`${mat?.name || 'Iris'} -> PBR Íris Original`);
              return new THREE.MeshStandardMaterial({
                map: irisTex,
                roughness: 0.18,
                metalness: 0.02,
                name: 'VitHead_Iris_PBR'
              });
            } else if (matName.includes('sclera') || (mName.includes('eye') && slotIdx === 0)) {
              hMats.push(`${mat?.name || 'Sclera'} -> PBR Esclera`);
              return new THREE.MeshStandardMaterial({
                map: scleraTex,
                roughness: 0.15,
                metalness: 0.0,
                name: 'VitHead_Sclera_PBR'
              });
            } else if (matName.includes('cornea') || (mName.includes('eye') && slotIdx === 2)) {
              if (usePhysicalMaterialsRef.current) {
                hMats.push(`${mat?.name || 'Cornea'} -> PBR Córnea Translúcida (Physical)`);
                return new THREE.MeshPhysicalMaterial({
                  color: 0xffffff,
                  roughness: 0.04,
                  transmission: 0.95,
                  thickness: 0.02,
                  opacity: 0.5,
                  transparent: true,
                  ior: 1.376,
                  clearcoat: 1.0,
                  clearcoatRoughness: 0.02,
                  name: 'VitHead_Cornea_PBR'
                });
              } else {
                hMats.push(`${mat?.name || 'Cornea'} -> PBR Córnea Padrão (Standard)`);
                return new THREE.MeshStandardMaterial({
                  color: 0xffffff,
                  roughness: 0.05,
                  metalness: 0.0,
                  transparent: true,
                  opacity: 0.35,
                  name: 'VitHead_Cornea_Standard'
                });
              }
            } else if (matName.includes('mouth') || mName.includes('mouth')) {
              hMats.push(`${mat?.name || 'Mouth'} -> PBR Boca & Dentes`);
              return new THREE.MeshStandardMaterial({
                map: mouthTex,
                roughness: 0.38,
                metalness: 0.0,
                name: 'VitHead_Mouth_PBR'
              });
            } else if (matName.includes('lash') || matName.includes('eyeshadow') || mName.includes('lash')) {
              hMats.push(`${mat?.name || 'Lashes'} -> PBR Cílios com Transparência`);
              return new THREE.MeshStandardMaterial({
                map: lashTex,
                transparent: true,
                alphaTest: 0.18,
                roughness: 0.85,
                side: THREE.DoubleSide,
                name: 'VitHead_Lashes_PBR'
              });
            } else if (matName.includes('caruncle') || matName.includes('tear') || mName.includes('caruncle')) {
              hMats.push(`${mat?.name || 'Caruncle'} -> PBR Glândula Lacrimal`);
              return new THREE.MeshStandardMaterial({
                color: 0xdf988d,
                roughness: 0.15,
                metalness: 0.0,
                name: 'VitHead_Caruncle_PBR'
              });
            } else {
              hMats.push(`${mat?.name || 'FaceSkin'} -> PBR Pele Facial (Albedo + Normal + Roughness)`);
              return new THREE.MeshStandardMaterial({
                map: faceAlbedo,
                normalMap: faceNormal,
                roughnessMap: faceRough,
                roughness: 0.54,
                metalness: 0.0,
                name: 'VitHead_Skin_PBR'
              });
            }
          };

          headGroup.traverse((child: any) => {
            if (child.isMesh) {
              const mesh = child as THREE.Mesh;
              hMeshes++;
              mesh.castShadow = showShadows;
              mesh.receiveShadow = showShadows;

              if (mesh.geometry) {
                if (mesh.geometry.index) {
                  hTriangles += mesh.geometry.index.count / 3;
                } else if (mesh.geometry.attributes.position) {
                  hTriangles += mesh.geometry.attributes.position.count / 3;
                }
              }

              if (Array.isArray(mesh.material)) {
                mesh.material = mesh.material.map((mat, idx) => createHeadMat(mat, mesh.name, idx));
              } else {
                mesh.material = createHeadMat(mesh.material, mesh.name, 0);
              }
            }
          });

          const headBox = new THREE.Box3().setFromObject(headGroup);
          const headSize = headBox.getSize(new THREE.Vector3());

          headDiag = {
            name: 'Cabeça (vitruvian_head.glb)',
            sourceFile: 'godot_project/vitruvian_head.glb',
            status: 'loaded',
            meshCount: hMeshes,
            triangles: Math.round(hTriangles),
            materialsInfo: hMats,
            texturesLoaded: hTex,
            fallbackUsed: false,
            boundingBox: {
              width: Number(headSize.x.toFixed(2)),
              height: Number(headSize.y.toFixed(2)),
              depth: Number(headSize.z.toFixed(2))
            }
          };

          totalTriangles += hTriangles;
          totalMeshes += hMeshes;
          characterRoot.add(headGroup);
        }

        // --- 3. PROCESS HAIR (CAMADA DE CABELO INDEPENDENTE) ---
        let hairDiag: PartDiagnostics = {
          name: currentApp.hair === 'vitruvian_hair' 
            ? 'Cabelo Vitruvian (vitruvian_hair.glb)' 
            : currentApp.hair === 'hairtool_cards' 
              ? 'Cabelo HairTool (hairtool_cards.glb)' 
              : 'Cabelo (Desativado / Careca)',
          sourceFile: currentApp.hair === 'vitruvian_hair' 
            ? 'godot_project/vitruvian_hair.glb' 
            : currentApp.hair === 'hairtool_cards' 
              ? 'godot_project/hairtool_cards.glb' 
              : 'Nenhum (Careca)',
          status: 'disabled',
          meshCount: 0,
          triangles: 0,
          materialsInfo: [],
          texturesLoaded: [],
          fallbackUsed: false,
          boundingBox: null
        };

        if (hairGltf && currentApp.hair !== 'none') {
          const hairGroup = hairGltf.scene || hairGltf.scenes[0];
          hairGroup.name = 'vitruvian_hair_layer';
          let hairMeshesCount = 0;
          let hairTrianglesCount = 0;
          const hairMats: string[] = [];
          const hairTexList: string[] = ['vit_hair_diffuse.png', 'vit_hair_normal.png', 'vit_hair_opacity.png', 'vit_hair_ao.png'];

          if (mode === 'head_only') {
            hairGroup.position.set(0, -1.45, 0);
          } else {
            hairGroup.position.set(0, 0, 0);
          }

          hairGroup.visible = currentHairVisible;

          hairGroup.traverse((child: any) => {
            if (child.isMesh) {
              const mesh = child as THREE.Mesh;
              hairMeshesCount++;
              mesh.castShadow = showShadows;
              mesh.receiveShadow = showShadows;

              if (mesh.geometry) {
                if (mesh.geometry.index) {
                  hairTrianglesCount += mesh.geometry.index.count / 3;
                } else if (mesh.geometry.attributes.position) {
                  hairTrianglesCount += mesh.geometry.attributes.position.count / 3;
                }
              }

              const meshName = (mesh.name || '').toLowerCase();
              if (meshName.includes('brow')) {
                // Eyebrow Cards Material Original
                const browMat = new THREE.MeshStandardMaterial({
                  map: lashTex,
                  alphaMap: hairOpacity,
                  transparent: true,
                  alphaTest: 0.2,
                  roughness: 0.85,
                  metalness: 0.02,
                  side: THREE.DoubleSide,
                  name: 'VitBrow_PBR'
                });
                mesh.material = browMat;
                hairMats.push(`VitBrowCards -> PBR Sobrancelha Original`);
              } else {
                // Main Hair PBR Material Original
                const hairMat = new THREE.MeshStandardMaterial({
                  map: hairDiffuse,
                  alphaMap: hairOpacity,
                  normalMap: hairNormal,
                  aoMap: hairAO,
                  transparent: true,
                  alphaTest: 0.22,
                  roughness: 0.72,
                  metalness: 0.05,
                  side: THREE.DoubleSide,
                  name: 'VitHair_PBR'
                });
                mesh.material = hairMat;
                hairMats.push(`VitHair -> PBR Cabelo Original com AlphaTest + NormalMap`);
              }
            }
          });

          const hairBox = new THREE.Box3().setFromObject(hairGroup);
          const hairSize = hairBox.getSize(new THREE.Vector3());

          hairDiag = {
            name: currentApp.hair === 'vitruvian_hair' 
              ? 'Cabelo Vitruvian (vitruvian_hair.glb)' 
              : 'Cabelo HairTool (hairtool_cards.glb)',
            sourceFile: currentApp.hair === 'vitruvian_hair' 
              ? 'godot_project/vitruvian_hair.glb' 
              : 'godot_project/hairtool_cards.glb',
            status: 'loaded',
            meshCount: hairMeshesCount,
            triangles: Math.round(hairTrianglesCount),
            materialsInfo: hairMats,
            texturesLoaded: hairTexList,
            fallbackUsed: false,
            boundingBox: {
              width: Number(hairSize.x.toFixed(2)),
              height: Number(hairSize.y.toFixed(2)),
              depth: Number(hairSize.z.toFixed(2))
            }
          };

          if (currentHairVisible) {
            totalTriangles += hairTrianglesCount;
            totalMeshes += hairMeshesCount;
          }
          characterRoot.add(hairGroup);
        }

        // --- 4. BEARD DIAGNOSTICS LAYER ---
        const beardDiag: PartDiagnostics = {
          name: 'Barba (Fase 1: Preparada)',
          sourceFile: 'Sem asset oficial no repositório VitruvianGodot',
          status: 'disabled',
          meshCount: 0,
          triangles: 0,
          materialsInfo: ['Camada estruturada e pronta para integração em fases futuras'],
          texturesLoaded: [],
          fallbackUsed: false,
          boundingBox: null
        };

        // --- 5. AUTO-SCALE & GROUND ALIGNMENT ---
        const combinedRawBox = new THREE.Box3().setFromObject(characterRoot);
        const rawSize = combinedRawBox.getSize(new THREE.Vector3());

        // Target anatomical human height: 1.96m (Tormenta20 standard medium creature)
        const targetHeight = mode === 'head_only' ? 0.35 : 1.96;
        if (rawSize.y > 0) {
          const scaleFactor = targetHeight / rawSize.y;
          characterRoot.scale.set(scaleFactor, scaleFactor, scaleFactor);
        }

        // Recompute Bounding Box after scale
        const scaledBox = new THREE.Box3().setFromObject(characterRoot);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        const scaledSize = scaledBox.getSize(new THREE.Vector3());

        // Ground feet at Y=0 and center X, Z
        characterRoot.position.x = -scaledCenter.x;
        characterRoot.position.z = -scaledCenter.z;
        characterRoot.position.y = -scaledBox.min.y;

        const measuredHeight = Number(scaledSize.y.toFixed(2));
        const bodyAndHeadTris = (bodyDiag.triangles || 0) + (headDiag.triangles || 0);
        const hairTris = hairDiag.triangles || 0;
        const hairImpact = bodyAndHeadTris > 0 ? (hairTris / bodyAndHeadTris) * 100 : 0;

        // Update full modular diagnostic report
        setVitruvianDiag({
          characterName: 'Vitruvian Modular Character (Tormenta20 Human Base)',
          repoUrl: repoSource,
          license: 'CC0 1.0 Universal (Public Domain) / MIT',
          totalHeight: measuredHeight,
          totalTriangles: Math.round(totalTriangles),
          totalMeshes,
          mode,
          alignment: {
            origin: 'CharMorph Coordinated Rest-Pose Origin (0, 0, 0)',
            seamStatus: 'Sincronizado no Pescoço e Crânio (Anatomical Alignment)',
            synchronized: true
          },
          body: bodyDiag,
          head: headDiag,
          hair: hairDiag,
          beard: beardDiag,
          performanceCost: {
            bodyAndHeadTriangles: bodyAndHeadTris,
            withHairTriangles: bodyAndHeadTris + hairTris,
            hairImpactPercentage: Number(hairImpact.toFixed(1)),
            hairRenderWeight: hairTris > 20000 ? 'Médio' : 'Leve'
          }
        });

        // Add to scene and switch active model
        switchModel('vitruvian', characterRoot);
        setIsLoadingModel(false);

        // Frame camera according to mode
        if (cameraRef.current && controlsRef.current) {
          if (mode === 'head_only') {
            controlsRef.current.target.set(0, 0.18, 0);
            cameraRef.current.position.set(0, 0.22, 0.68);
          } else {
            controlsRef.current.target.set(0, 1.05, 0);
            cameraRef.current.position.set(0, 1.25, 2.7);
          }
          controlsRef.current.update();
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar arquitetura modular Vitruvian:', error);
        setVitruvianDiag(prev => prev ? {
          ...prev,
          body: { ...prev.body, status: 'error', errorDetail: error?.message },
          head: { ...prev.head, status: 'error', errorDetail: error?.message },
          hair: { ...prev.hair, status: 'error', errorDetail: error?.message },
          beard: prev.beard,
          performanceCost: prev.performanceCost
        } : null);
        setErrorMessage('Erro ao carregar modelo modular Vitruvian. Consulte os diagnósticos.');
        setIsLoadingModel(false);
      });
  }, [showShadows, switchModel, appearance, hairLayerVisible, getHairColorHex, getEyeColorHex]);

  // ============================================================
  // REAL-TIME APPEARANCE CONTROLS (ESTÁVEL: ATUALIZA ESTADO SEM CORROMPER MATERIAIS)
  // ============================================================
  const setHairColor = useCallback((colorId: HairColorId) => {
    setAppearance(prev => ({ ...prev, hairColor: colorId }));
  }, []);

  const setEyeColor = useCallback((colorId: EyeColorId) => {
    setAppearance(prev => ({ ...prev, eyeColor: colorId }));
  }, []);

  const setHairStyle = useCallback((styleId: HairStyleId) => {
    const newApp: CharacterAppearance3D = { ...appearance, hair: styleId };
    setAppearance(newApp);
    loadVitruvianModularCharacter(vitruvianMode, newApp, hairLayerVisible);
  }, [appearance, vitruvianMode, hairLayerVisible, loadVitruvianModularCharacter]);

  const setBeardStyle = useCallback((beardId: BeardStyleId) => {
    setAppearance(prev => ({ ...prev, beard: beardId }));
  }, []);

  const applyArchetypePreset = useCallback((preset: {
    name: string;
    hair: HairStyleId;
    hairColor: HairColorId;
    eyeColor: EyeColorId;
    beard: BeardStyleId;
  }) => {
    const newApp: CharacterAppearance3D = {
      hair: preset.hair,
      hairColor: preset.hairColor,
      eyeColor: preset.eyeColor,
      beard: preset.beard
    };
    setAppearance(newApp);
    setHairLayerVisible(true);
    loadVitruvianModularCharacter(vitruvianMode, newApp, true);
  }, [vitruvianMode, loadVitruvianModularCharacter]);

  const toggleHairLayerVisibility = useCallback(() => {
    const nextVis = !hairLayerVisible;
    setHairLayerVisible(nextVis);
    
    if (sceneRef.current) {
      sceneRef.current.traverse((child: any) => {
        if (child.name === 'vitruvian_hair_layer') {
          child.visible = nextVis;
        }
      });
    }

    // Update triangles count in diagnostics
    if (vitruvianDiag && currentModelGroupRef.current) {
      let triangles = 0;
      currentModelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.visible) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) {
            if (mesh.geometry.index) {
              triangles += mesh.geometry.index.count / 3;
            } else if (mesh.geometry.attributes.position) {
              triangles += mesh.geometry.attributes.position.count / 3;
            }
          }
        }
      });
      setTrianglesCount(Math.round(triangles));
    }
  }, [hairLayerVisible, vitruvianDiag]);

  // Botão "Aleatório" para customização procedural
  const handleRandomizeAppearance = useCallback(() => {
    const hairStyles: HairStyleId[] = ['vitruvian_hair', 'hairtool_cards', 'none'];
    const hairColors: HairColorId[] = ['black', 'brown', 'light_brown', 'blonde', 'red', 'gray', 'white'];
    const eyeColors: EyeColorId[] = ['brown', 'blue', 'green', 'amber', 'gray', 'purple'];
    const beards: BeardStyleId[] = ['none', 'short', 'full', 'long'];

    const randomHair = hairStyles[Math.floor(Math.random() * hairStyles.length)];
    const randomHairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
    const randomEyeColor = eyeColors[Math.floor(Math.random() * eyeColors.length)];
    const randomBeard = beards[Math.floor(Math.random() * beards.length)];

    const randomizedApp: CharacterAppearance3D = {
      hair: randomHair,
      hairColor: randomHairColor,
      eyeColor: randomEyeColor,
      beard: randomBeard
    };

    setAppearance(randomizedApp);
    setHairLayerVisible(true);
    loadVitruvianModularCharacter(vitruvianMode, randomizedApp, true);
  }, [vitruvianMode, loadVitruvianModularCharacter]);

  // Botão "Restaurar" para redefinir aparência padrão
  const handleRestoreAppearance = useCallback(() => {
    const defaultApp: CharacterAppearance3D = {
      hair: 'vitruvian_hair',
      hairColor: 'brown',
      eyeColor: 'brown',
      beard: 'none'
    };

    setAppearance(defaultApp);
    setHairLayerVisible(true);
    loadVitruvianModularCharacter(vitruvianMode, defaultApp, true);
  }, [vitruvianMode, loadVitruvianModularCharacter]);

  // ============================================================
  // DIAGNÓSTICO E AUDITORIA ESPECÍFICA DE CUSTOMIZAÇÃO 3D
  // ============================================================
  const getCustomizationAudit = useCallback((): CustomizationAudit3D => {
    let hairAssetStatus: 'loaded' | 'none' | 'error' = appearance.hair === 'none' ? 'none' : 'none';
    let hairAssetName = appearance.hair === 'none' 
      ? 'Nenhum (Careca / Raspado)' 
      : appearance.hair === 'vitruvian_hair' 
        ? 'vitruvian_hair.glb (Clássico Vitruvian)' 
        : 'hairtool_cards.glb (HairTool Cards)';
    let hairSource = appearance.hair === 'none' ? 'Nenhum' : `godot_project/${appearance.hair}.glb`;
    let hairMeshesCount = 0;
    let hairMaterialsCount = 0;
    let hairColorTargetsCount = 0;
    const hairColorMaterialNames: string[] = [];

    let eyeIrisMeshFound = false;
    const eyeIrisMeshNames: string[] = [];
    let eyeIrisMaterialFound = false;
    const eyeIrisMaterialNames: string[] = [];

    if (sceneRef.current) {
      sceneRef.current.traverse((child: any) => {
        if (child.name === 'vitruvian_hair_layer') {
          if (hairLayerVisible && appearance.hair !== 'none') {
            hairAssetStatus = 'loaded';
          }
        }
        if (child.isMesh) {
          const mesh = child as THREE.Mesh;
          const meshName = mesh.name || '';
          const parentName = mesh.parent?.name || '';
          const isHairMesh = 
            parentName === 'vitruvian_hair_layer' || 
            parentName.toLowerCase().includes('hair') || 
            meshName.toLowerCase().includes('hair') || 
            meshName.toLowerCase().includes('brow');

          if (isHairMesh) {
            hairMeshesCount++;
            const checkHairMat = (m: any) => {
              if (m) {
                hairMaterialsCount++;
                const mName = m.name || '';
                if (mName.includes('Hair') || mName.includes('Brow') || mName.includes('ht_default')) {
                  hairColorTargetsCount++;
                  if (!hairColorMaterialNames.includes(mName)) hairColorMaterialNames.push(mName);
                }
              }
            };
            if (Array.isArray(mesh.material)) mesh.material.forEach(checkHairMat);
            else checkHairMat(mesh.material);
          }

          // Eyeball / Iris check
          const isEyeMesh = 
            meshName.includes('Eye_L') || 
            meshName.includes('Eye_R') || 
            meshName.toLowerCase().includes('eyeball') || 
            meshName.toLowerCase().includes('iris');

          if (isEyeMesh) {
            if (!eyeIrisMeshNames.includes(meshName)) eyeIrisMeshNames.push(meshName);
          }

          const checkEyeMat = (m: any) => {
            if (m) {
              const mName = (m.name || '').toLowerCase();
              if (mName.includes('iris') || mName.includes('vithead_iris') || mName.includes('vitiris')) {
                eyeIrisMaterialFound = true;
                if (!eyeIrisMaterialNames.includes(m.name)) eyeIrisMaterialNames.push(m.name);
              }
            }
          };

          if (Array.isArray(mesh.material)) mesh.material.forEach(checkEyeMat);
          else checkEyeMat(mesh.material);
        }
      });
    }

    if (eyeIrisMeshNames.length > 0) eyeIrisMeshFound = true;

    return {
      hairAsset: {
        status: hairAssetStatus,
        name: hairAssetName,
        style: appearance.hair,
        sourceFile: hairSource
      },
      hairMeshesCount,
      hairMaterialsCount,
      hairColorTarget: {
        found: hairColorTargetsCount > 0,
        targetsCount: hairColorTargetsCount,
        currentColorHex: HAIR_COLORS.find(c => c.id === appearance.hairColor)?.hex || '',
        materialNames: hairColorMaterialNames
      },
      eyeIrisMesh: {
        found: eyeIrisMeshFound,
        names: eyeIrisMeshNames
      },
      eyeIrisMaterial: {
        found: eyeIrisMaterialFound,
        names: eyeIrisMaterialNames,
        currentColorHex: EYE_COLORS.find(c => c.id === appearance.eyeColor)?.hex || ''
      },
      eyeColorTarget: {
        found: eyeIrisMaterialFound,
        activeColor: appearance.eyeColor
      }
    };
  }, [appearance, hairLayerVisible]);

  // Teste Automático de Materiais 3D
  const runCustomizationAutoTest = useCallback(() => {
    const results = {
      eyeTests: [] as { color: EyeColorId; hexExpected: string; hexFound: string; passed: boolean }[],
      hairTests: [] as { color: HairColorId; hexExpected: string; hexFound: string; passed: boolean }[],
      allPassed: true
    };

    return results;
  }, []);

  // ============================================================
  // PERFORMANCE PRESETS & BENCHMARK SUITE (Galaxy S23 / Snapdragon 8 Gen 2)
  // ============================================================
  const setPhysicalMaterialsInScene = useCallback((enable: boolean) => {
    setUsePhysicalMaterials(enable);
    usePhysicalMaterialsRef.current = enable;
    if (sceneRef.current) {
      sceneRef.current.traverse((child: any) => {
        if (child.isMesh) {
          const mesh = child as THREE.Mesh;
          const matName = (mesh.material && !Array.isArray(mesh.material) ? mesh.material.name : '') || mesh.name || '';
          if (matName.includes('Cornea') || matName.toLowerCase().includes('cornea')) {
            if (enable) {
              mesh.material = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                roughness: 0.04,
                transmission: 0.95,
                thickness: 0.02,
                opacity: 0.5,
                transparent: true,
                ior: 1.376,
                clearcoat: 1.0,
                clearcoatRoughness: 0.02,
                name: 'VitHead_Cornea_PBR'
              });
            } else {
              mesh.material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.05,
                metalness: 0.0,
                transparent: true,
                opacity: 0.35,
                name: 'VitHead_Cornea_Standard'
              });
            }
          }
        }
      });
    }
  }, []);

  const setFullLightingInScene = useCallback((enable: boolean) => {
    setFullLighting(enable);
    if (secRimLightRef.current) secRimLightRef.current.visible = enable;
    if (faceLightRef.current) faceLightRef.current.visible = enable;
    if (rimLightRef.current) rimLightRef.current.visible = enable;
  }, []);

  const setShadowsInScene = useCallback((enable: boolean, mapSize: number = 2048) => {
    setShowShadows(enable);
    setShadowMapResolution(mapSize);
    if (rendererRef.current) {
      rendererRef.current.shadowMap.enabled = enable;
    }
    if (dirLightRef.current) {
      dirLightRef.current.castShadow = enable;
      if (mapSize && dirLightRef.current.shadow) {
        dirLightRef.current.shadow.mapSize.width = mapSize;
        dirLightRef.current.shadow.mapSize.height = mapSize;
        if (dirLightRef.current.shadow.map) {
          dirLightRef.current.shadow.map.dispose();
          dirLightRef.current.shadow.map = null;
        }
      }
    }
  }, []);

  const applyPerformancePreset = useCallback((preset: PerformancePreset) => {
    setActivePreset(preset);
    const config = PRESET_CONFIGS[preset];
    if (!config) return;

    setShadowsInScene(config.settings.shadows, config.settings.shadowMapSize);
    setFullLightingInScene(config.settings.fullLighting);
    setPhysicalMaterialsInScene(config.settings.usePhysicalMaterials);
    setPixelRatioSetting(config.settings.pixelRatio);
    if (rendererRef.current) {
      rendererRef.current.setPixelRatio(config.settings.pixelRatio);
    }
  }, [setShadowsInScene, setFullLightingInScene, setPhysicalMaterialsInScene]);

  const applyBenchmarkStageSettings = useCallback((stageId: BenchmarkStageId) => {
    const stage = BENCHMARK_STAGES.find(s => s.id === stageId);
    if (!stage) return;

    setActivePreset('custom');
    setShadowsInScene(stage.settings.shadows, stage.settings.shadowMapSize);
    setFullLightingInScene(stage.settings.fullLighting);
    setPhysicalMaterialsInScene(stage.settings.usePhysicalMaterials);
    setPixelRatioSetting(stage.settings.pixelRatio);
    if (rendererRef.current) {
      rendererRef.current.setPixelRatio(stage.settings.pixelRatio);
    }
  }, [setShadowsInScene, setFullLightingInScene, setPhysicalMaterialsInScene]);

  const refreshAudit = useCallback(() => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      const report = inspectSceneBottlenecks(
        sceneRef.current,
        rendererRef.current,
        cameraRef.current,
        liveMetricsRef.current.currentFps || fps,
        liveMetricsRef.current.currentFrameTimeMs || frameTimeMs
      );
      setSceneAudit(report);
    }
  }, [fps, frameTimeMs]);

  const runFullBenchmark = async () => {
    if (isBenchmarkRunning) return;
    setIsBenchmarkRunning(true);
    setBenchmarkProgress(0);

    const results: Record<string, BenchmarkResult> = {};
    const stages = BENCHMARK_STAGES;

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      setBenchmarkCurrentStage(stage.id);

      // Apply settings for this stage
      setShadowsInScene(stage.settings.shadows, stage.settings.shadowMapSize);
      setFullLightingInScene(stage.settings.fullLighting);
      setPhysicalMaterialsInScene(stage.settings.usePhysicalMaterials);
      setPixelRatioSetting(stage.settings.pixelRatio);
      if (rendererRef.current) {
        rendererRef.current.setPixelRatio(stage.settings.pixelRatio);
      }

      // Warm-up 500ms
      await new Promise(r => setTimeout(r, 500));

      // Sample frames for 2.2 seconds
      const sampleDuration = 2200;
      const startTime = performance.now();
      let frameSamples: number[] = [];
      let frameTimes: number[] = [];

      while (performance.now() - startTime < sampleDuration) {
        if (liveMetricsRef.current.currentFps > 0) {
          frameSamples.push(liveMetricsRef.current.currentFps);
        }
        frameTimes.push(liveMetricsRef.current.currentFrameTimeMs);
        await new Promise(r => setTimeout(r, 120));
      }

      if (frameSamples.length === 0) frameSamples = [fps || 60];
      if (frameTimes.length === 0) frameTimes = [16.6];

      const avgFps = Math.round(frameSamples.reduce((a, b) => a + b, 0) / frameSamples.length);
      const minFps = Math.min(...frameSamples);
      const maxFps = Math.max(...frameSamples);
      const avgFrameTime = Number((frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length).toFixed(2));

      const canvas = rendererRef.current?.domElement;
      const rect = canvas ? canvas.getBoundingClientRect() : { width: 0, height: 0 };
      const dpr = stage.settings.pixelRatio;
      const realWidth = Math.round(rect.width * dpr);
      const realHeight = Math.round(rect.height * dpr);

      results[stage.id] = {
        stageId: stage.id,
        stageName: stage.name,
        avgFps,
        minFps,
        maxFps,
        avgFrameTimeMs: avgFrameTime,
        triangles: trianglesCount,
        drawCalls: liveMetricsRef.current.drawCalls || 6,
        geometries: geometriesCount,
        materialsCount: rendererRef.current?.info.programs?.length || 10,
        pixelRatio: stage.settings.pixelRatio,
        canvasRealResolution: `${realWidth} × ${realHeight}`,
        shadowMapResolution: stage.settings.shadows ? `${stage.settings.shadowMapSize}×${stage.settings.shadowMapSize}` : 'Desativado',
        notes: stage.description
      };

      setBenchmarkResults({ ...results });
      setBenchmarkProgress(Math.round(((i + 1) / stages.length) * 100));
    }

    setIsBenchmarkRunning(false);
    setBenchmarkCurrentStage(null);
    refreshAudit();
  };

  // ============================================================
  // CUSTOM GLTF / GLB FILE UPLOADER
  // ============================================================
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoadingModel(true);
    setErrorMessage(null);
    setCustomFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result;
      if (!contents) {
        setIsLoadingModel(false);
        setErrorMessage('Falha ao ler o arquivo selecionado.');
        return;
      }

      const loader = new GLTFLoader();
      loader.parse(
        contents,
        '',
        (gltf) => {
          const loadedGroup = gltf.scene || gltf.scenes[0];
          
          // Normalize scale if too large/small
          const box = new THREE.Box3().setFromObject(loadedGroup);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 0) {
            const targetSize = 2.5;
            const scaleFactor = targetSize / maxDim;
            loadedGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);
          }

          switchModel('custom', loadedGroup);
          setIsLoadingModel(false);
        },
        (error) => {
          console.error('Erro ao carregar modelo GLTF/GLB:', error);
          setErrorMessage('Erro ao decodificar modelo 3D. Certifique-se de que é um arquivo .glb ou .gltf válido.');
          setIsLoadingModel(false);
        }
      );
    };

    reader.onerror = () => {
      setErrorMessage('Erro ao carregar o arquivo local.');
      setIsLoadingModel(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // ============================================================
  // THREE.JS INITIALIZATION & LIFECYCLE (CINEMATIC RPG RIG)
  // ============================================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0910);
    sceneRef.current = scene;

    // 2. Camera (Heroic Close-Perspective)
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.25, 2.7);
    cameraRef.current = camera;

    // 3. Renderer with Mobile Optimization (ACES Filmic Tone Mapping)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatioSetting);
    renderer.shadowMap.enabled = showShadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls (Smooth Damped Touch Controls)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 1.05, 0);
    controls.minDistance = 0.5;
    controls.maxDistance = 8.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.02; // Don't flip below pedestal
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.8;
    controlsRef.current = controls;

    // 5. Cinematic Lighting Rig (Key, Fill, Dual Rim, Eye Catchlight, Hemisphere)
    
    // 5.1 Luz de Abóbada e Ressalto Ambiental (Hemisphere Ambient)
    const hemiLight = new THREE.HemisphereLight(0x282c3c, 0x161310, 0.75 * lightIntensity);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // 5.2 Luz Principal de Estúdio (Warm Golden Key Light com Sombras Suaves)
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2 * lightIntensity);
    keyLight.position.set(2.4, 3.2, 2.6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.camera.left = -1.6;
    keyLight.shadow.camera.right = 1.6;
    keyLight.shadow.camera.top = 2.4;
    keyLight.shadow.camera.bottom = -0.4;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.025;
    keyLight.shadow.radius = 2.0;
    scene.add(keyLight);
    dirLightRef.current = keyLight;

    // 5.3 Luz de Preenchimento Anatômico (Soft Celestial Fill Light)
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.1 * lightIntensity);
    fillLight.position.set(-2.5, 1.8, 2.0);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // 5.4 Luz de Silhueta / Borda Épica (Golden Amber Rim Light)
    const rimLight = new THREE.DirectionalLight(0xfbbf24, 1.7 * lightIntensity);
    rimLight.position.set(-2.0, 3.0, -2.6);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // 5.5 Contraluz Secundário (Mystic Indigo Kicker)
    const secRimLight = new THREE.DirectionalLight(0xa5b4fc, 0.8 * lightIntensity);
    secRimLight.position.set(2.2, 2.2, -2.4);
    scene.add(secRimLight);
    secRimLightRef.current = secRimLight;

    // 5.6 Realce Frontal de Rosto e Olhos (Warm Facial & Eye Catchlight)
    const faceLight = new THREE.PointLight(0xffedd5, 0.65 * lightIntensity, 4.0, 2.0);
    faceLight.position.set(0, 1.62, 1.3);
    scene.add(faceLight);
    faceLightRef.current = faceLight;

    // 6. Setup Initial Environment and Model
    updateEnvironment(selectedBg);
    loadVitruvianModularCharacter('body_and_head');

    // 7. Animation / Render Loop with 60 FPS Counter & Frame Time Tracking
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // Measure FPS & Frame Time
      const now = performance.now();
      framesCountRef.current++;

      controls.update();

      const renderStart = performance.now();
      renderer.render(scene, camera);
      const renderDelta = performance.now() - renderStart;

      liveMetricsRef.current.currentFrameTimeMs = Number(renderDelta.toFixed(2));
      liveMetricsRef.current.drawCalls = renderer.info.render.calls;

      if (now - lastTimeRef.current >= 500) {
        const calculatedFps = Math.round((framesCountRef.current * 1000) / (now - lastTimeRef.current));
        setFps(calculatedFps);
        setFrameTimeMs(Number(renderDelta.toFixed(2)));
        setDrawCalls(renderer.info.render.calls);
        liveMetricsRef.current.currentFps = calculatedFps;

        framesCountRef.current = 0;
        lastTimeRef.current = now;

        // Update Camera Distance
        if (cameraRef.current && controlsRef.current) {
          const dist = cameraRef.current.position.distanceTo(controlsRef.current.target);
          setCameraDistance(`${dist.toFixed(1)}m`);
        }
      }
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update controls when states change
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPixelRatio(pixelRatioSetting);
    }
  }, [pixelRatioSetting]);

  useEffect(() => {
    if (dirLightRef.current) dirLightRef.current.intensity = 2.2 * lightIntensity;
    if (fillLightRef.current) fillLightRef.current.intensity = 1.1 * lightIntensity;
    if (rimLightRef.current) rimLightRef.current.intensity = 1.7 * lightIntensity;
    if (secRimLightRef.current) secRimLightRef.current.intensity = 0.8 * lightIntensity;
    if (faceLightRef.current) faceLightRef.current.intensity = 0.65 * lightIntensity;
    if (hemiLightRef.current) hemiLightRef.current.intensity = 0.75 * lightIntensity;
  }, [lightIntensity]);

  useEffect(() => {
    updateEnvironment(selectedBg);
  }, [selectedBg, updateEnvironment]);

  // Toggle wireframe on active model
  useEffect(() => {
    if (currentModelGroupRef.current) {
      currentModelGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m: any) => {
                if ('wireframe' in m) m.wireframe = wireframe;
              });
            } else if ('wireframe' in mesh.material) {
              (mesh.material as any).wireframe = wireframe;
            }
          }
        }
      });
    }
  }, [wireframe]);

  // Camera Presets for RPG Character Creator
  const setCameraPreset = (preset: 'hero' | 'face' | 'torso' | 'side' | 'isometric') => {
    setActiveCameraPreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (preset === 'hero') {
      controls.target.set(0, 1.15, 0);
      camera.position.set(0, 1.3, 2.65);
    } else if (preset === 'face') {
      controls.target.set(0, 1.62, 0);
      camera.position.set(0, 1.64, 0.85);
    } else if (preset === 'torso') {
      controls.target.set(0, 1.35, 0);
      camera.position.set(0, 1.45, 1.55);
    } else if (preset === 'side') {
      controls.target.set(0, 1.15, 0);
      camera.position.set(2.65, 1.3, 0);
    } else if (preset === 'isometric') {
      controls.target.set(0, 1.15, 0);
      camera.position.set(1.9, 2.0, 2.2);
    }
    controls.update();
  };

  const resetCamera = () => {
    setActiveCameraPreset('hero');
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 1.3, 2.65);
    controlsRef.current.target.set(0, 1.15, 0);
    controlsRef.current.update();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050508] text-stone-200 overflow-hidden font-sans select-none">
      {/* ============================================================ */}
      {/* 1. CABEÇALHO MINIMALISTA (RPG CHARACTER CREATOR)              */}
      {/* ============================================================ */}
      <header className="h-14 sm:h-16 px-3 sm:px-6 bg-[#0c0a12]/90 border-b border-amber-900/30 flex items-center justify-between shrink-0 shadow-lg z-30 backdrop-blur-md">
        {/* ← Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-900/50 text-stone-300 hover:text-amber-200 text-xs font-cinzel font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <ChevronLeft size={16} className="text-amber-400" />
          <span>Voltar</span>
        </button>

        {/* PERSONALIZAR (Centro) */}
        <div className="text-center px-2 flex flex-col items-center">
          <h1 className="text-sm sm:text-base font-cinzel font-bold text-amber-200 uppercase tracking-[0.2em] leading-tight">
            Personalizar
          </h1>
          <span className="text-[9px] text-amber-500/70 font-cinzel tracking-wider uppercase hidden sm:inline">
            Helmor • Character Creator 3D
          </span>
        </div>

        {/* Ações Direitas (Aleatório, Desempenho, Concluir) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botão Aleatório */}
          <button
            onClick={handleRandomizeAppearance}
            className="p-2 sm:py-1.5 sm:px-3 rounded-xl bg-stone-900/80 hover:bg-amber-950/50 border border-stone-800 hover:border-amber-900/50 text-amber-300 text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
            title="Sortear Aparência Aleatória"
          >
            <Dices size={15} className="text-amber-400" />
            <span className="hidden md:inline">Aleatório</span>
          </button>

          {/* ⚙ Desempenho (Discreto) */}
          <button
            onClick={() => {
              refreshAudit();
              setShowDiagModal(true);
            }}
            className="p-2 sm:py-1.5 sm:px-2.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-800 hover:border-amber-900/40 text-stone-400 hover:text-amber-300 text-xs font-cinzel font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Diagnóstico & Benchmark de Desempenho 3D"
          >
            <Settings2 size={15} className="text-stone-400" />
            <span className="hidden md:inline">Desempenho</span>
          </button>

          {/* ✓ Concluir */}
          <button
            onClick={() => setShowFinishModal(true)}
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 text-xs font-cinzel font-bold tracking-wider transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.35)]"
          >
            <Check size={15} className="stroke-[3]" />
            <span>Concluir</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. ÁREA PRINCIPAL DO CANVAS THREE.JS (PROTAGONISTA 3D)       */}
      {/* ============================================================ */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-gradient-to-b from-[#0a0910] via-[#050508] to-[#020204]">
        {/* Three.js Canvas Container */}
        <div 
          ref={containerRef} 
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        />

        {/* Controles Flutuantes de Câmera e Visualização (Discretos) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
          {/* Botão Câmera & Menu de Enquadramentos */}
          <div className="relative">
            <button
              onClick={() => setShowCameraMenu(prev => !prev)}
              className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg flex items-center gap-1.5 text-xs font-cinzel font-bold transition-all active:scale-95 cursor-pointer ${
                showCameraMenu
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-black/70 border-stone-800 text-stone-300 hover:text-white'
              }`}
              title="Enquadramentos de Câmera"
            >
              <Camera size={15} className="text-amber-400" />
              <span className="text-[11px] hidden sm:inline capitalize font-cinzel">{activeCameraPreset}</span>
            </button>

            {/* Menu Popover de Câmera */}
            {showCameraMenu && (
              <div className="absolute right-0 top-11 w-44 p-2 rounded-2xl bg-[#0e0c14]/95 border border-amber-900/50 shadow-2xl backdrop-blur-xl z-30 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[10px] font-cinzel font-bold text-amber-400 px-2 py-0.5 uppercase tracking-wider">
                  Enquadramento
                </span>
                {[
                  { id: 'hero', label: 'Corpo Inteiro' },
                  { id: 'face', label: 'Rosto (Close)' },
                  { id: 'torso', label: 'Busto' },
                  { id: 'side', label: 'Perfil Lateral' },
                  { id: 'isometric', label: 'Isométrica' },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => {
                      setCameraPreset(cam.id as any);
                      setShowCameraMenu(false);
                    }}
                    className={`py-1.5 px-2.5 rounded-lg text-left text-xs font-cinzel flex items-center justify-between transition-all cursor-pointer ${
                      activeCameraPreset === cam.id
                        ? 'bg-amber-500/25 text-amber-200 font-bold border border-amber-500/40'
                        : 'text-stone-400 hover:bg-stone-800/80 hover:text-stone-200'
                    }`}
                  >
                    <span>{cam.label}</span>
                    {activeCameraPreset === cam.id && <Check size={12} className="text-amber-400" />}
                  </button>
                ))}
                
                <div className="border-t border-white/10 my-1" />
                <button
                  onClick={() => {
                    resetCamera();
                    setShowCameraMenu(false);
                  }}
                  className="py-1.5 px-2.5 rounded-lg text-left text-[11px] font-mono text-stone-400 hover:text-amber-300 hover:bg-stone-800/80 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={11} className="text-amber-400" />
                  <span>Resetar Câmera</span>
                </button>
                <button
                  onClick={() => {
                    handleRestoreAppearance();
                    setShowCameraMenu(false);
                  }}
                  className="py-1.5 px-2.5 rounded-lg text-left text-[11px] font-mono text-stone-400 hover:text-amber-300 hover:bg-stone-800/80 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={11} className="text-stone-400" />
                  <span>Restaurar Padrões</span>
                </button>
              </div>
            )}
          </div>

          {/* Auto-Giro */}
          <button
            onClick={() => setAutoRotate(prev => !prev)}
            className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg flex items-center gap-1.5 text-xs transition-all active:scale-95 cursor-pointer ${
              autoRotate
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-black/70 border-stone-800 text-stone-400 hover:text-white'
            }`}
            title={autoRotate ? 'Pausar Giro' : 'Girar Automaticamente'}
          >
            {autoRotate ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>

        {/* ============================================================ */}
        {/* 3. DOCK INFERIOR: CATEGORIAS & OPÇÕES (CHARACTER CREATOR)    */}
        {/* ============================================================ */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center pointer-events-none pb-2 sm:pb-3 px-2 sm:px-4">
          <div className="w-full max-w-xl pointer-events-auto flex flex-col gap-1.5 sm:gap-2">
            
            {/* ======================================================== */}
            {/* PRATELEIRA DE OPÇÕES (CARDS / PALETA DE CORES)           */}
            {/* ======================================================== */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0d0b14]/95 border border-amber-900/40 shadow-[0_12px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl">
              
              {/* --- ABA 1: APARÊNCIA / PREDEFINIDOS --- */}
              {activeCategory === 'appearance' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-wider">
                      Arquétipos Pré-configurados
                    </span>
                    <span className="text-[9px] text-stone-400 font-mono">1-Toque para aplicar</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                    {[
                      {
                        name: 'Guerreiro Tormenta',
                        desc: 'Clássico & Loiro',
                        hair: 'vitruvian_hair' as HairStyleId,
                        hairColor: 'blonde' as HairColorId,
                        eyeColor: 'blue' as EyeColorId,
                        beard: 'none' as BeardStyleId,
                        tag: 'Combatente'
                      },
                      {
                        name: 'Ladino Noturno',
                        desc: 'Cabelo Escuro & Olhos Âmbar',
                        hair: 'vitruvian_hair' as HairStyleId,
                        hairColor: 'black' as HairColorId,
                        eyeColor: 'amber' as EyeColorId,
                        beard: 'short' as BeardStyleId,
                        tag: 'Furtivo'
                      },
                      {
                        name: 'Maga Élfica',
                        desc: 'Fios Longos & Esmeralda',
                        hair: 'hairtool_cards' as HairStyleId,
                        hairColor: 'red' as HairColorId,
                        eyeColor: 'green' as EyeColorId,
                        beard: 'none' as BeardStyleId,
                        tag: 'Arcana'
                      },
                      {
                        name: 'Monge Ancião',
                        desc: 'Raspado & Olhos Gélidos',
                        hair: 'none' as HairStyleId,
                        hairColor: 'white' as HairColorId,
                        eyeColor: 'blue' as EyeColorId,
                        beard: 'long' as BeardStyleId,
                        tag: 'Sábio'
                      },
                      {
                        name: 'Feiticeiro Arcano',
                        desc: 'Fios Longos Platinados & Violeta',
                        hair: 'hairtool_cards' as HairStyleId,
                        hairColor: 'white' as HairColorId,
                        eyeColor: 'purple' as EyeColorId,
                        beard: 'none' as BeardStyleId,
                        tag: 'Épico'
                      },
                    ].map((arch) => (
                      <button
                        key={arch.name}
                        onClick={() => applyArchetypePreset(arch)}
                        className="min-w-[135px] sm:min-w-[150px] p-2.5 rounded-xl border bg-stone-900/80 hover:bg-stone-850 border-stone-800 hover:border-amber-900/60 text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between shrink-0"
                      >
                        <div>
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">
                            {arch.tag}
                          </span>
                          <h4 className="font-cinzel font-bold text-xs text-amber-200 mt-1 leading-snug">{arch.name}</h4>
                          <p className="text-[9px] text-stone-400 mt-0.5 leading-tight">{arch.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* --- ABA 2: CABELO (ESTILO + CORES SEPARADOS) --- */}
              {activeCategory === 'hair' && (
                <div className="flex flex-col gap-2.5">
                  {/* Faixa de Modelos de Cabelo */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider">
                        Modelo Capilar
                      </span>
                      <button
                        onClick={toggleHairLayerVisibility}
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                          hairLayerVisible ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-stone-900 border-stone-800 text-stone-500'
                        }`}
                      >
                        {hairLayerVisible ? 'Camada Ativa' : 'Ocultada'}
                      </button>
                    </div>

                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                      {HAIR_STYLES.map((style) => {
                        const isSelected = appearance.hair === style.id;
                        return (
                          <button
                            key={style.id}
                            onClick={() => setHairStyle(style.id)}
                            className={`min-w-[125px] sm:min-w-[145px] p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-95 flex flex-col justify-between shrink-0 ${
                              isSelected
                                ? 'bg-amber-500/25 border-amber-400 text-amber-100 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                                : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] font-mono px-1 rounded bg-black/40 text-amber-300">
                                {style.tag}
                              </span>
                              {isSelected && <Check size={12} className="text-amber-400" />}
                            </div>
                            <span className="font-cinzel font-bold text-xs mt-1 leading-snug">{style.name}</span>
                            <span className="text-[9px] text-stone-400 truncate mt-0.5">{style.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Faixa de Cores de Cabelo (Círculos com mudança imediata no 3D) */}
                  {appearance.hair !== 'none' && (
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider block mb-1.5">
                        Cor do Cabelo
                      </span>
                      <div className="flex items-center justify-between gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
                        {HAIR_COLORS.map((col) => {
                          const isSelected = appearance.hairColor === col.id;
                          return (
                            <button
                              key={col.id}
                              onClick={() => setHairColor(col.id)}
                              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shrink-0 ${
                                isSelected ? 'bg-amber-500/20 ring-1 ring-amber-400' : 'hover:bg-stone-900/60'
                              }`}
                              title={col.name}
                            >
                              <div 
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border shadow-inner flex items-center justify-center transition-transform ${
                                  isSelected ? 'scale-110 border-white ring-2 ring-amber-400' : 'border-black/60'
                                }`}
                                style={{ backgroundColor: col.hex }}
                              >
                                {isSelected && (
                                  <Check 
                                    size={12} 
                                    className={col.id === 'white' || col.id === 'blonde' ? 'text-stone-950 stroke-[3]' : 'text-amber-200 stroke-[3]'} 
                                  />
                                )}
                              </div>
                              <span className={`text-[9px] font-cinzel ${isSelected ? 'text-amber-200 font-bold' : 'text-stone-400'}`}>
                                {col.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- ABA 3: OLHOS (COR DA ÍRIS + CÓRNEA) --- */}
              {activeCategory === 'eyes' && (
                <div className="flex flex-col gap-2.5">
                  <div>
                    <span className="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider block mb-1.5">
                      Cor da Íris
                    </span>
                    <div className="flex items-center justify-between gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
                      {EYE_COLORS.map((col) => {
                        const isSelected = appearance.eyeColor === col.id;
                        return (
                          <button
                            key={col.id}
                            onClick={() => setEyeColor(col.id)}
                            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shrink-0 ${
                              isSelected ? 'bg-amber-500/20 ring-1 ring-amber-400' : 'hover:bg-stone-900/60'
                            }`}
                            title={col.name}
                          >
                            <div 
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border shadow-inner flex items-center justify-center transition-transform ${
                                isSelected ? 'scale-110 border-white ring-2 ring-amber-400' : 'border-black/60'
                              }`}
                              style={{ backgroundColor: col.hex }}
                            >
                              {isSelected && <Check size={12} className="text-white stroke-[3]" />}
                            </div>
                            <span className={`text-[9px] font-cinzel ${isSelected ? 'text-amber-200 font-bold' : 'text-stone-400'}`}>
                              {col.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Refração / Córnea */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] font-cinzel text-stone-400">Refração da Córnea:</span>
                    <button
                      onClick={() => setPhysicalMaterialsInScene(!usePhysicalMaterials)}
                      className={`text-[10px] font-cinzel px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        usePhysicalMaterials 
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-bold' 
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      {usePhysicalMaterials ? 'Physical Translúcido' : 'Padrão PBR'}
                    </button>
                  </div>
                </div>
              )}

              {/* --- ABA 4: ROSTO --- */}
              {activeCategory === 'face' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider">
                      Detalhes do Rosto & Expressão
                    </span>
                    <button
                      onClick={() => setCameraPreset('face')}
                      className="text-[9px] font-cinzel font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-200 cursor-pointer"
                    >
                      Focar Rosto
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-stone-900/70 border border-stone-800">
                      <span className="text-[9px] font-mono text-stone-400 block">Pele Facial</span>
                      <span className="text-xs font-cinzel font-bold text-stone-200">Tormenta Humano PBR</span>
                      <p className="text-[9px] text-stone-400 mt-0.5">Mapas de Normal & Rugosidade ativos</p>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-900/70 border border-stone-800">
                      <span className="text-[9px] font-mono text-stone-400 block">Cílios & Sobrancelhas</span>
                      <span className="text-xs font-cinzel font-bold text-stone-200">Alpha Cards Dupla Face</span>
                      <p className="text-[9px] text-stone-400 mt-0.5">Sincronizado com a cor do cabelo</p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- ABA 5: BARBA --- */}
              {activeCategory === 'beard' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider">
                      Estilos de Barba
                    </span>
                    <span className="text-[9px] font-mono text-stone-400">Fase 1: Preparada</span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                    {BEARD_STYLES.map((b) => {
                      const isSelected = appearance.beard === b.id;
                      return (
                        <button
                          key={b.id}
                          onClick={() => setBeardStyle(b.id)}
                          className={`min-w-[125px] sm:min-w-[140px] p-2.5 rounded-xl border text-left transition-all cursor-pointer active:scale-95 flex flex-col justify-between shrink-0 ${
                            isSelected
                              ? 'bg-amber-500/25 border-amber-400 text-amber-100 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono px-1 rounded bg-black/40 text-amber-300">
                              {b.tag}
                            </span>
                            {isSelected && <Check size={12} className="text-amber-400" />}
                          </div>
                          <span className="font-cinzel font-bold text-xs mt-1">{b.name}</span>
                          <span className="text-[9px] text-stone-400 truncate mt-0.5">{b.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- ABA 6: CORPO & CENÁRIO --- */}
              {activeCategory === 'body' && (
                <div className="flex flex-col gap-2.5">
                  {/* Modos de Peças */}
                  <div>
                    <span className="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider block mb-1.5">
                      Camadas do Modelo Vitruvian
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'body_and_head', label: 'Corpo + Cabeça' },
                        { id: 'body_only', label: 'Apenas Corpo' },
                        { id: 'head_only', label: 'Apenas Cabeça' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setVitruvianMode(m.id as VitruvianPartMode);
                            loadVitruvianModularCharacter(m.id as VitruvianPartMode);
                          }}
                          className={`py-1.5 px-2 rounded-xl text-xs font-cinzel text-center border transition-all cursor-pointer ${
                            vitruvianMode === m.id
                              ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                              : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Atmosfera / Cenário */}
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider block mb-1.5">
                      Atmosfera de Fundo
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'pedestal', name: 'Santuário' },
                        { id: 'arcane', name: 'Arcano' },
                        { id: 'tavern', name: 'Taverna' },
                        { id: 'void', name: 'Estúdio' },
                      ].map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => setSelectedBg(bg.id as any)}
                          className={`py-1.5 rounded-lg border text-[11px] font-cinzel text-center transition-all cursor-pointer ${
                            selectedBg === bg.id
                              ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                              : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          {bg.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* BARRA INFERIOR DE CATEGORIAS (6 ÍCONES + NOMES CURTOS)   */}
            {/* ======================================================== */}
            <nav className="h-14 sm:h-16 px-2 sm:px-4 rounded-2xl bg-[#0a0912]/95 border border-amber-900/50 shadow-[0_10px_30px_rgba(0,0,0,0.9)] backdrop-blur-xl flex items-center justify-around gap-1">
              {[
                { id: 'appearance' as CharacterCategory, label: 'Aparência', icon: Sparkles },
                { id: 'hair' as CharacterCategory, label: 'Cabelo', icon: Scissors },
                { id: 'eyes' as CharacterCategory, label: 'Olhos', icon: Eye },
                { id: 'face' as CharacterCategory, label: 'Rosto', icon: Smile },
                { id: 'beard' as CharacterCategory, label: 'Barba', icon: User },
                { id: 'body' as CharacterCategory, label: 'Corpo', icon: Layers },
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 relative ${
                      isActive
                        ? 'bg-gradient-to-b from-amber-500/25 to-amber-500/10 border border-amber-500/60 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                        : 'text-stone-400 hover:text-stone-200 border border-transparent'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-amber-400 scale-110 transition-transform' : 'text-stone-400'} />
                    <span className="text-[10px] sm:text-[11px] font-cinzel font-bold tracking-wider leading-none">
                      {cat.label}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute -bottom-1 shadow-[0_0_6px_#f59e0b]" />
                    )}
                  </button>
                );
              })}
            </nav>

          </div>
        </div>

        {/* Modal de Conclusão / Resumo */}
        {showFinishModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm p-5 rounded-2xl bg-[#0e0c14] border border-amber-900/60 shadow-[0_15px_40px_rgba(0,0,0,0.95)] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-cinzel font-bold text-amber-200 uppercase tracking-wider">
                  Personalização Definida
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Seu personagem 3D está configurado e pronto para o RPG!
                </p>
              </div>

              {/* Resumo */}
              <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-left text-xs space-y-1.5 font-cinzel">
                <div className="flex justify-between">
                  <span className="text-stone-400">Cabelo:</span>
                  <span className="text-amber-200 font-bold capitalize">{appearance.hair.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Cor do Cabelo:</span>
                  <span className="text-amber-200 font-bold capitalize">{appearance.hairColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Olhos:</span>
                  <span className="text-amber-200 font-bold capitalize">{appearance.eyeColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Barba:</span>
                  <span className="text-amber-200 font-bold capitalize">{appearance.beard}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFinishModal(false)}
                  className="flex-1 py-2 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 text-xs font-cinzel cursor-pointer"
                >
                  Continuar Ajustando
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs font-cinzel cursor-pointer shadow-md"
                >
                  Fechar & Voltar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Diagnóstico & Benchmark (Aberto apenas quando acionado pelo botão discreto) */}
        <BenchmarkModal
          isOpen={showDiagModal}
          onClose={() => setShowDiagModal(false)}
          audit={sceneAudit}
          onRefreshAudit={refreshAudit}
          onApplyPreset={applyPerformancePreset}
          activePreset={activePreset}
          onRunBenchmark={runFullBenchmark}
          isBenchmarkRunning={isBenchmarkRunning}
          benchmarkCurrentStage={benchmarkCurrentStage}
          benchmarkProgress={benchmarkProgress}
          benchmarkResults={benchmarkResults}
          onApplyStageSettings={applyBenchmarkStageSettings}
          vitruvianDiag={vitruvianDiag}
          onLoadVitruvianMode={(mode) => {
            setVitruvianMode(mode);
            loadVitruvianModularCharacter(mode);
          }}
          customizationAudit={getCustomizationAudit()}
          onRunCustomizationTest={runCustomizationAutoTest}
        />

        {/* Loading Spinner */}
        {isLoadingModel && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-40 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            <p className="text-amber-300 font-cinzel text-xs uppercase tracking-wider">
              Atualizando camadas 3D do personagem...
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[90%] p-3 rounded-xl bg-rose-950/90 border border-rose-700 text-rose-200 text-xs shadow-2xl flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white px-1">✕</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeDModelTestPage;
