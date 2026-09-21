import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { DiceType, DiceSkinConfig } from './types';
import { createDiceMeshWithMaterial, getDiceGeometry } from './DiceGeometryRegistry';
import { getDiceMaterial, getDiceMaterialSync } from './DiceTextureLoader';
import { createSafeWebGLRenderer } from './webglHelper';
import { DicePhysicsEngine } from './DicePhysicsEngine';
import { RotateCw, ZoomIn, ZoomOut, Eye, Sparkles, Play } from 'lucide-react';

interface Dice3DPreviewProps {
  diceType: DiceType;
  skinConfig: DiceSkinConfig;
  className?: string;
  showControls?: boolean;
  onFaceSelect?: (faceIndex: number, faceId: string, value: number | string) => void;
}

export const Dice3DPreview: React.FC<Dice3DPreviewProps> = ({
  diceType,
  skinConfig,
  className = 'w-full h-72',
  showControls = true,
  onFaceSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedFace, setSelectedFace] = useState<number>(0);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isTestRolling, setIsTestRolling] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const physicsRef = useRef<DicePhysicsEngine>(new DicePhysicsEngine());
  const reqIdRef = useRef<number | null>(null);

  // Interaction dragging state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotVelocityRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef<THREE.Quaternion | null>(null);
  const zoomLevelRef = useRef(4.0);

  // Initialize and update 3D Scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0.5, zoomLevelRef.current);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = createSafeWebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    if (!renderer) return;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x90cdf4, 1.2);
    fillLight.position.set(-6, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, 1.0);
    rimLight.position.set(0, -6, -6);
    scene.add(rimLight);

    // Initial Material & Mesh
    const initialMat = getDiceMaterialSync(diceType, skinConfig);
    const diceInfo = createDiceMeshWithMaterial(diceType, initialMat);
    scene.add(diceInfo.mesh);
    meshRef.current = diceInfo.mesh;

    // Async high-quality texture load
    getDiceMaterial(diceType, skinConfig).then((mat) => {
      if (meshRef.current) {
        meshRef.current.material = mat;
      }
    });

    // Render loop
    let lastTime = performance.now();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (physicsRef.current && isTestRolling) {
        const stillRolling = physicsRef.current.update();
        if (!stillRolling) {
          setIsTestRolling(false);
        }
      } else if (meshRef.current) {
        if (targetRotationRef.current) {
          meshRef.current.quaternion.slerp(targetRotationRef.current, Math.min(1.0, dt * 8));
          if (meshRef.current.quaternion.angleTo(targetRotationRef.current) < 0.01) {
            targetRotationRef.current = null;
          }
        } else if (autoRotate && !isDraggingRef.current) {
          meshRef.current.rotation.y += dt * 0.7;
          meshRef.current.rotation.x += dt * 0.35;
        } else if (!isDraggingRef.current) {
          // Inertia damping
          meshRef.current.rotation.y += rotVelocityRef.current.y * dt;
          meshRef.current.rotation.x += rotVelocityRef.current.x * dt;
          rotVelocityRef.current.x *= Math.max(0, 1 - 4 * dt);
          rotVelocityRef.current.y *= Math.max(0, 1 - 4 * dt);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [diceType, skinConfig]);

  // Update material on skin property change
  useEffect(() => {
    if (!meshRef.current) return;
    getDiceMaterial(diceType, skinConfig).then((mat) => {
      if (meshRef.current) {
        mat.wireframe = wireframe;
        meshRef.current.material = mat;
      }
    });
  }, [diceType, skinConfig, wireframe]);

  // Rotate camera / die to focus on specific face
  const alignToFace = useCallback((faceIdx: number) => {
    if (!meshRef.current) return;
    setAutoRotate(false);
    setSelectedFace(faceIdx);

    const geomData = getDiceGeometry(diceType);
    const normal = geomData.faceNormals[faceIdx] || new THREE.Vector3(0, 1, 0);
    const targetCameraDir = new THREE.Vector3(0, 0.2, 1).normalize();

    const qAlign = new THREE.Quaternion().setFromUnitVectors(normal, targetCameraDir);
    targetRotationRef.current = qAlign;

    const faceDef = geomData.faceValues[faceIdx];
    const faceId = geomData.faceIds[faceIdx];
    onFaceSelect?.(faceIdx, faceId, faceDef);
  }, [diceType, onFaceSelect]);

  // Trigger test roll animation
  const handleTestRoll = useCallback(() => {
    if (!meshRef.current || isTestRolling) return;
    setAutoRotate(false);
    targetRotationRef.current = null;
    setIsTestRolling(true);

    const geomData = getDiceGeometry(diceType);
    const randomIdx = Math.floor(Math.random() * geomData.faceValues.length);
    const targetVal = geomData.faceValues[randomIdx];

    const diceInfo = {
      mesh: meshRef.current,
      geometry: geomData.geometry,
      material: meshRef.current.material,
      faceValues: geomData.faceValues,
      faceNormals: geomData.faceNormals,
      faceIds: geomData.faceIds,
      radius: geomData.radius
    };

    physicsRef.current.startRoll({
      diceInfo,
      targetValue: targetVal,
      duration: 1.8,
      onUpdate: (pos, quat, scale) => {
        if (meshRef.current) {
          meshRef.current.position.copy(pos);
          meshRef.current.quaternion.copy(quat);
          meshRef.current.scale.setScalar(scale);
        }
      },
      onComplete: () => {
        setIsTestRolling(false);
        setSelectedFace(randomIdx);
      }
    });
  }, [diceType, isTestRolling]);

  // Touch & Mouse Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    setAutoRotate(false);
    targetRotationRef.current = null;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !meshRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    const speed = 0.008;
    meshRef.current.rotation.y += dx * speed;
    meshRef.current.rotation.x += dy * speed;

    rotVelocityRef.current = { x: dy * speed * 20, y: dx * speed * 20 };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const delta = e.deltaY * 0.004;
    zoomLevelRef.current = Math.min(Math.max(zoomLevelRef.current + delta, 2.2), 7.0);
    cameraRef.current.position.z = zoomLevelRef.current;
  };

  const geomData = getDiceGeometry(diceType);

  return (
    <div className={`relative flex flex-col bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden select-none ${className}`}>
      {/* 3D Canvas Area */}
      <div 
        ref={containerRef}
        className="w-full h-full min-h-[220px] flex-1 relative cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Overlay Badges */}
        <div className="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {diceType.toUpperCase()} 3D
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
            {skinConfig.name}
          </span>
        </div>

        {/* Action Controls in Corner */}
        {showControls && (
          <div className="absolute top-2.5 right-3 flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-700/60 shadow-lg backdrop-blur">
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              title={autoRotate ? 'Pausar rotação' : 'Girar automaticamente'}
              className={`p-1.5 rounded transition ${autoRotate ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'}`}
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setWireframe(!wireframe)}
              title="Alternar Wireframe"
              className={`p-1.5 rounded transition ${wireframe ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'}`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleTestRoll}
              disabled={isTestRolling}
              title="Testar Rolagem com Física"
              className="px-2 py-1 flex items-center gap-1 rounded bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-bold shadow hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-current" />
              Rolar
            </button>
          </div>
        )}
      </div>

      {/* Face Navigator Bar */}
      {showControls && (
        <div className="p-2 bg-slate-900/90 border-t border-slate-800/80 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Inspecionar Face ({geomData.faceValues.length} faces mapeadas):
            </span>
            <span className="font-mono text-slate-300">
              Face Atual: <strong className="text-amber-400 font-bold">{geomData.faceValues[selectedFace]}</strong> ({geomData.faceIds[selectedFace]})
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
            {geomData.faceValues.map((val, idx) => {
              const isSelected = selectedFace === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => alignToFace(idx)}
                  className={`px-2.5 py-1 min-w-[32px] rounded text-xs font-mono font-bold transition shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-1 ring-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
