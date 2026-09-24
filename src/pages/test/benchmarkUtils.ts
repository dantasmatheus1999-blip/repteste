import * as THREE from 'three';
import { 
  BenchmarkStageConfig, 
  SceneBottleneckAudit, 
  ShadowLightInfo, 
  SuspectedBottleneck,
  PerformancePreset
} from './benchmarkTypes';

export const BENCHMARK_STAGES: BenchmarkStageConfig[] = [
  {
    id: 'no_shadows',
    name: '1. Modelo sem Sombras',
    description: 'Sombras dinâmicas desligadas (shadowMap.enabled = false). Isola o custo de rasterização sem render pass de profundidade.',
    category: 'shadows',
    settings: {
      shadows: false,
      shadowMapSize: 1024,
      fullLighting: true,
      usePhysicalMaterials: true,
      pixelRatio: 1.5
    }
  },
  {
    id: 'with_shadows',
    name: '2. Modelo + Sombras (2048px)',
    description: 'Sombras ativadas com mapa de alta definição (2048x2048) e filtro suave PCFSoft. Avalia o passe extra de sombra.',
    category: 'shadows',
    settings: {
      shadows: true,
      shadowMapSize: 2048,
      fullLighting: true,
      usePhysicalMaterials: true,
      pixelRatio: 1.5
    }
  },
  {
    id: 'full_lighting',
    name: '3. Modelo + Iluminação Completa',
    description: 'Rig cinematográfico completo com 6 luzes ativas (Key, Fill, 2x Rim, Face Catchlight, Hemisphere). Custo de fragment shader.',
    category: 'lighting',
    settings: {
      shadows: true,
      shadowMapSize: 1024,
      fullLighting: true,
      usePhysicalMaterials: true,
      pixelRatio: 1.5
    }
  },
  {
    id: 'pbr_standard',
    name: '4. Materiais PBR Standard',
    description: 'Converte materiais físicos complexos (como córnea com Transmission) para MeshStandardMaterial simples.',
    category: 'materials',
    settings: {
      shadows: true,
      shadowMapSize: 1024,
      fullLighting: true,
      usePhysicalMaterials: false,
      pixelRatio: 1.5
    }
  },
  {
    id: 'pbr_physical',
    name: '5. Materiais Physical / Clearcoat',
    description: 'MeshPhysicalMaterial com Transmission e Clearcoat na córnea. Testa o impacto do render pass de refração vítrea.',
    category: 'materials',
    settings: {
      shadows: true,
      shadowMapSize: 1024,
      fullLighting: true,
      usePhysicalMaterials: true,
      pixelRatio: 1.5
    }
  },
  {
    id: 'pixel_ratio_1x',
    name: '6. Pixel Ratio 1.0x (Resolução Nativa 1:1)',
    description: 'Renderiza 1 pixel de buffer por pixel CSS. Custo mínimo de preenchimento (Fillrate) da GPU.',
    category: 'resolution',
    settings: {
      shadows: true,
      shadowMapSize: 1024,
      fullLighting: true,
      usePhysicalMaterials: true,
      pixelRatio: 1.0
    }
  },
  {
    id: 'pixel_ratio_1_5x',
    name: '7. Pixel Ratio 1.5x (Resolução Balanceada)',
    description: 'Resolução intermediária com excelente nitidez visual e 2.25x pixels a mais que 1.0x.',
    category: 'resolution',
    settings: {
      shadows: true,
      shadowMapSize: 1024,
      fullLighting: true,
      usePhysicalMaterials: true,
      pixelRatio: 1.5
    }
  },
  {
    id: 'pixel_ratio_2x',
    name: '8. Pixel Ratio 2.0x (Alta Densidade Mobile)',
    description: 'Renderiza em altíssima resolução (4x pixels em relação a 1.0x). Testa se o fillrate mobile é o gargalo principal.',
    category: 'resolution',
    settings: {
      shadows: true,
      shadowMapSize: 1024,
      fullLighting: true,
      usePhysicalMaterials: true,
      pixelRatio: 2.0
    }
  }
];

export const PRESET_CONFIGS: Record<PerformancePreset, {
  name: string;
  badge: string;
  description: string;
  settings: {
    shadows: boolean;
    shadowMapSize: number;
    fullLighting: boolean;
    usePhysicalMaterials: boolean;
    pixelRatio: number;
  };
}> = {
  ultra: {
    name: 'Ultra (Desktop / Máxima Qualidade)',
    badge: 'Máxima Fidelidade',
    description: 'DPR 2.0x, Sombras 2048x2048, Todas as 6 luzes ativas, MeshPhysicalMaterial com Transmission na córnea.',
    settings: {
      shadows: true,
      shadowMapSize: 2048,
      fullLighting: true,
      usePhysicalMaterials: true,
      pixelRatio: 2.0
    }
  },
  high: {
    name: 'High (Equilibrado Alto)',
    badge: 'Alta Nitidez',
    description: 'DPR 1.5x, Sombras 1024x1024, 6 luzes ativas, MeshPhysicalMaterial ativo.',
    settings: {
      shadows: true,
      shadowMapSize: 1024,
      fullLighting: true,
      usePhysicalMaterials: true,
      pixelRatio: 1.5
    }
  },
  balanced: {
    name: 'Balanced (Balanceado)',
    badge: 'Uso Geral',
    description: 'DPR 1.25x, Sombras 1024x1024, Luzes com sombras, Córnea com Standard Material (sem transmission pass).',
    settings: {
      shadows: true,
      shadowMapSize: 1024,
      fullLighting: false,
      usePhysicalMaterials: false,
      pixelRatio: 1.25
    }
  },
  mobile: {
    name: 'Mobile (Conservador / Alta Eficiência)',
    badge: '60 FPS Estável',
    description: 'DPR 1.0x, Sombras 512x512 ou desligadas, Iluminação simplificada (Key + Fill + Hemi), MeshStandardMaterial em toda a cena.',
    settings: {
      shadows: false,
      shadowMapSize: 512,
      fullLighting: false,
      usePhysicalMaterials: false,
      pixelRatio: 1.0
    }
  }
};

/**
 * Inspeciona a cena Three.js e identifica detalhadamente as configurações ativas e potenciais gargalos.
 */
export function inspectSceneBottlenecks(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  fps: number,
  frameTimeMs: number
): SceneBottleneckAudit {
  const shadowCastingLights: ShadowLightInfo[] = [];
  let shadowCastersCount = 0;
  let shadowReceiversCount = 0;
  let activeLightsCount = 0;
  const meshPhysicalObjects: { meshName: string; materialName: string; hasTransmission: boolean; hasClearcoat: boolean }[] = [];
  const transparentObjects: { meshName: string; materialName: string; alphaTest: number; doubleSided: boolean }[] = [];
  const materialsSet = new Set<string>();

  // 1. Traverse scene objects
  scene.traverse((obj) => {
    // Check Lights
    if ((obj as THREE.Light).isLight) {
      const light = obj as THREE.Light;
      if (light.visible) {
        activeLightsCount++;
      }
      if (light.castShadow) {
        const dirLight = light as THREE.DirectionalLight;
        const mapW = dirLight.shadow?.mapSize?.width || 0;
        const mapH = dirLight.shadow?.mapSize?.height || 0;
        shadowCastingLights.push({
          name: light.name || light.type,
          type: light.type,
          mapSize: `${mapW}x${mapH}`,
          bias: dirLight.shadow?.bias || 0,
          intensity: light.intensity,
          castShadow: light.castShadow
        });
      }
    }

    // Check Meshes
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      if (mesh.castShadow) shadowCastersCount++;
      if (mesh.receiveShadow) shadowReceiversCount++;

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => {
        if (!mat) return;
        materialsSet.add(mat.uuid);

        // Check MeshPhysicalMaterial
        if ((mat as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial) {
          const physMat = mat as THREE.MeshPhysicalMaterial;
          meshPhysicalObjects.push({
            meshName: mesh.name || 'Unnamed Mesh',
            materialName: physMat.name || 'MeshPhysicalMaterial',
            hasTransmission: (physMat.transmission || 0) > 0,
            hasClearcoat: (physMat.clearcoat || 0) > 0
          });
        }

        // Check Transparent / AlphaTest
        if (mat.transparent || (mat.alphaTest || 0) > 0) {
          transparentObjects.push({
            meshName: mesh.name || 'Unnamed Mesh',
            materialName: mat.name || 'Transparent Material',
            alphaTest: mat.alphaTest || 0,
            doubleSided: mat.side === THREE.DoubleSide
          });
        }
      });
    }
  });

  const canvas = renderer.domElement;
  const rect = canvas ? canvas.getBoundingClientRect() : { width: 0, height: 0 };
  const dpr = renderer.getPixelRatio();
  const nativeDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const realWidth = Math.round(rect.width * dpr);
  const realHeight = Math.round(rect.height * dpr);

  const suspectedBottlenecks: SuspectedBottleneck[] = [];

  // DIAGNOSTIC RULE 1: High Pixel Ratio on Mobile (Galaxy S23 native is ~2.625)
  if (dpr >= 2.0) {
    suspectedBottlenecks.push({
      severity: 'critical',
      title: 'Pixel Ratio Elevado (≥ 2.0x) em Tela Mobile de Alta Densidade',
      impact: 'Fillrate & Fragment Shader Overhead',
      description: `O canvas está renderizando em ${realWidth} × ${realHeight} pixels (~${((realWidth * realHeight) / 1000000).toFixed(1)} Megapixels por frame). Em telas AMOLED de alta densidade (Galaxy S23), isso quadruplica o cálculo de shaders PBR.`,
      recommendation: 'Reduzir o Pixel Ratio para 1.0x ou 1.25x no mobile para saltar instantaneamente de ~30 para 60 FPS.'
    });
  } else if (dpr > 1.25) {
    suspectedBottlenecks.push({
      severity: 'medium',
      title: 'Pixel Ratio Intermediário (1.5x)',
      impact: 'Uso moderado de Fillrate',
      description: `Renderizando ${realWidth} × ${realHeight} pixels. 2.25x mais pixels calculados em comparação com 1.0x.`,
      recommendation: 'Pode ser mantido se os shaders e sombras estiverem otimizados.'
    });
  }

  // DIAGNOSTIC RULE 2: MeshPhysicalMaterial with Transmission (Refraction Pass)
  const transmissionCount = meshPhysicalObjects.filter(m => m.hasTransmission).length;
  if (transmissionCount > 0) {
    suspectedBottlenecks.push({
      severity: 'high',
      title: 'MeshPhysicalMaterial com Transmission Ativo (Córnea Vítrea)',
      impact: 'Render Target Texture Copy Stall',
      description: `Há ${transmissionCount} material(is) com transmission > 0. O Three.js precisa copiar o frame buffer inteiro para uma textura intermediária antes de renderizar a refração da córnea. Em GPUs mobile com arquitetura Tile-Based (Adreno 740), essa cópia quebra o cache de tiles.`,
      recommendation: 'Substituir por MeshStandardMaterial com transparência simples (opacity: 0.35, roughness: 0.05) no modo mobile.'
    });
  }

  // DIAGNOSTIC RULE 3: High-Resolution Shadow Maps (2048x2048)
  const highResShadows = shadowCastingLights.filter(l => l.mapSize.includes('2048'));
  if (renderer.shadowMap.enabled && highResShadows.length > 0) {
    suspectedBottlenecks.push({
      severity: 'high',
      title: 'Shadow Map em 2048x2048 com PCFSoftShadowMap',
      impact: 'Largura de Banda de VRAM & Passe de Profundidade',
      description: `Luz (${highResShadows.map(l => l.name).join(', ')}) está gerando mapa de sombra de 2048×2048. Filtragem PCFSoft realiza múltiplas amostras de textura de profundidade por fragmento.`,
      recommendation: 'Reduzir a resolução do shadow map para 1024x1024 ou 512x512 no mobile.'
    });
  }

  // DIAGNOSTIC RULE 4: Transparent Hair Cards & Overdraw
  const hairCards = transparentObjects.filter(t => t.meshName.toLowerCase().includes('hair') || t.doubleSided);
  if (hairCards.length > 0) {
    suspectedBottlenecks.push({
      severity: 'medium',
      title: 'Overdraw em Cartões de Cabelo (Hair Cards com DoubleSide)',
      impact: 'Alpha Blending & Test Overdraw',
      description: `Detectados ${hairCards.length} objetos com transparência/alphaTest e faces duplas (DoubleSide). Camadas sobrepostas de fios de cabelo forçam o renderizador a avaliar fragmentos várias vezes no mesmo pixel.`,
      recommendation: 'Usar alphaTest rigoroso (0.4-0.5) sem transparent=true ou alternar para o modelo capilar compacto Vitruvian Hair.'
    });
  }

  // DIAGNOSTIC RULE 5: Multi-light rig (6 lights evaluated per fragment)
  if (activeLightsCount >= 5) {
    suspectedBottlenecks.push({
      severity: 'low',
      title: 'Rig de Iluminação Cinematográfica (6 Luzes Ativas)',
      impact: 'Complexidade de Fragment Shader',
      description: `A cena calcula 6 fontes de luz dinâmicas (Key + Fill + 2x Rim + Face Point + Hemisphere).`,
      recommendation: 'No preset mobile, desativar luzes secundárias e manter Key + Fill + Hemisphere.'
    });
  }

  // Tone mapping info
  let toneMappingName = 'Nenhum';
  if (renderer.toneMapping === THREE.ACESFilmicToneMapping) toneMappingName = 'ACES Filmic Tone Mapping';
  else if (renderer.toneMapping === THREE.LinearToneMapping) toneMappingName = 'Linear Tone Mapping';
  else if (renderer.toneMapping === THREE.ReinhardToneMapping) toneMappingName = 'Reinhard Tone Mapping';

  // Antialias info
  const antialias = renderer.capabilities ? (renderer as any).capabilities.isWebGL2 !== false : true;

  return {
    timestamp: new Date().toLocaleTimeString('pt-BR'),
    fps: Math.round(fps),
    frameTimeMs: Number(frameTimeMs.toFixed(2)),
    triangles: renderer.info.render.triangles || 0,
    drawCalls: renderer.info.render.calls || 0,
    geometriesCount: renderer.info.memory.geometries || 0,
    programsCount: renderer.info.programs?.length || 0,
    materialsCount: materialsSet.size,
    pixelRatio: Number(dpr.toFixed(2)),
    devicePixelRatioNative: Number(nativeDpr.toFixed(2)),
    canvasCssResolution: `${Math.round(rect.width)} × ${Math.round(rect.height)}`,
    canvasRealResolution: `${realWidth} × ${realHeight}`,
    shadowsEnabled: renderer.shadowMap.enabled,
    shadowMapType: renderer.shadowMap.type === THREE.PCFSoftShadowMap ? 'PCFSoftShadowMap' : 'BasicShadowMap',
    shadowCastingLights,
    shadowCastersCount,
    shadowReceiversCount,
    meshPhysicalCount: meshPhysicalObjects.length,
    meshPhysicalObjects,
    transparentMaterialsCount: transparentObjects.length,
    transparentObjects,
    antialiasEnabled: antialias,
    toneMapping: toneMappingName,
    toneMappingExposure: renderer.toneMappingExposure,
    activeLightsCount,
    suspectedBottlenecks
  };
}
