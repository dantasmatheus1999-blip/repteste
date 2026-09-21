import * as THREE from 'three';
import { DiceType, DiceSkin } from './types';
import { createDiceMaterials } from './diceTextureGenerator';

export interface DiceMeshInfo {
  mesh: THREE.Mesh;
  faceValues: (number | string)[];
  faceNormals: THREE.Vector3[];
  radius: number;
}

/**
 * Creates a complete, true 3D D20 Mesh with 20 distinct faces, mapped numbers 1-20,
 * and pre-calculated face normal vectors for target roll alignment.
 */
export function createD20(skinId: DiceSkin, radius = 1.2): DiceMeshInfo {
  const baseGeom = new THREE.IcosahedronGeometry(radius, 0);
  const nonIndexed = baseGeom.toNonIndexed();
  baseGeom.dispose();

  const posAttr = nonIndexed.getAttribute('position');
  const count = posAttr.count; // 60 vertices (20 triangles)
  const faceCount = count / 3; // 20

  const uvs = new Float32Array(count * 2);
  const faceNormals: THREE.Vector3[] = [];

  // Authentic D20 face number arrangement (opposite faces sum to 21)
  const faceValues = [
    20, 1, 14, 8, 12, 
    18, 2, 19, 7, 11, 
    15, 6, 17, 3, 13, 
    9, 5, 16, 4, 10
  ];

  // Set up UV mapping for equilateral triangles on each face
  for (let f = 0; f < faceCount; f++) {
    const i = f * 3;
    const v0 = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    const v1 = new THREE.Vector3(posAttr.getX(i + 1), posAttr.getY(i + 1), posAttr.getZ(i + 1));
    const v2 = new THREE.Vector3(posAttr.getX(i + 2), posAttr.getY(i + 2), posAttr.getZ(i + 2));

    const center = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);
    const normal = center.clone().normalize();
    faceNormals.push(normal);

    // Order vertices relative to a "top" vertex
    // Determine which vertex is most aligned with the face's top
    const upReference = new THREE.Vector3(0, 1, 0);
    const tangent = new THREE.Vector3().crossVectors(normal, upReference);
    if (tangent.lengthSq() < 0.001) {
      tangent.set(1, 0, 0).crossVectors(normal, tangent);
    }
    tangent.normalize();
    const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

    // Map triangle vertices onto 2D UV canvas (top, bottom-left, bottom-right)
    uvs[i * 2] = 0.5;
    uvs[i * 2 + 1] = 0.92;

    uvs[(i + 1) * 2] = 0.08;
    uvs[(i + 1) * 2 + 1] = 0.15;

    uvs[(i + 2) * 2] = 0.92;
    uvs[(i + 2) * 2 + 1] = 0.15;

    // Add material group for this specific face
    nonIndexed.addGroup(f * 3, 3, f);
  }

  nonIndexed.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  nonIndexed.computeVertexNormals();

  const materials = createDiceMaterials('d20', skinId, faceValues);
  const mesh = new THREE.Mesh(nonIndexed, materials);
  mesh.castShadow = true;
  mesh.receiveShadow = false;

  return {
    mesh,
    faceValues,
    faceNormals,
    radius
  };
}

/**
 * Creates a D6 Cube Mesh.
 */
export function createD6(skinId: DiceSkin, size = 1.6): DiceMeshInfo {
  const geom = new THREE.BoxGeometry(size, size, size);
  const faceValues = [1, 6, 2, 5, 3, 4];
  const faceNormals = [
    new THREE.Vector3(1, 0, 0),  // Right
    new THREE.Vector3(-1, 0, 0), // Left
    new THREE.Vector3(0, 1, 0),  // Top
    new THREE.Vector3(0, -1, 0), // Bottom
    new THREE.Vector3(0, 0, 1),  // Front
    new THREE.Vector3(0, 0, -1), // Back
  ];

  const materials = createDiceMaterials('d6', skinId, faceValues);
  const mesh = new THREE.Mesh(geom, materials);
  mesh.castShadow = true;

  return {
    mesh,
    faceValues,
    faceNormals,
    radius: size * 0.86
  };
}

/**
 * Creates a D4 Tetrahedron Mesh.
 */
export function createD4(skinId: DiceSkin, radius = 1.3): DiceMeshInfo {
  const baseGeom = new THREE.TetrahedronGeometry(radius, 0);
  const nonIndexed = baseGeom.toNonIndexed();
  baseGeom.dispose();

  const faceCount = 4;
  const faceValues = [1, 2, 3, 4];
  const faceNormals: THREE.Vector3[] = [];
  const posAttr = nonIndexed.getAttribute('position');
  const uvs = new Float32Array(faceCount * 3 * 2);

  for (let f = 0; f < faceCount; f++) {
    const i = f * 3;
    const v0 = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    const v1 = new THREE.Vector3(posAttr.getX(i + 1), posAttr.getY(i + 1), posAttr.getZ(i + 1));
    const v2 = new THREE.Vector3(posAttr.getX(i + 2), posAttr.getY(i + 2), posAttr.getZ(i + 2));

    const center = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);
    faceNormals.push(center.clone().normalize());

    uvs[i * 2] = 0.5;
    uvs[i * 2 + 1] = 0.9;
    uvs[(i + 1) * 2] = 0.1;
    uvs[(i + 1) * 2 + 1] = 0.15;
    uvs[(i + 2) * 2] = 0.9;
    uvs[(i + 2) * 2 + 1] = 0.15;

    nonIndexed.addGroup(f * 3, 3, f);
  }

  nonIndexed.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  nonIndexed.computeVertexNormals();

  const materials = createDiceMaterials('d4', skinId, faceValues);
  const mesh = new THREE.Mesh(nonIndexed, materials);
  mesh.castShadow = true;

  return {
    mesh,
    faceValues,
    faceNormals,
    radius
  };
}

/**
 * Creates a D8 Octahedron Mesh.
 */
export function createD8(skinId: DiceSkin, radius = 1.3): DiceMeshInfo {
  const baseGeom = new THREE.OctahedronGeometry(radius, 0);
  const nonIndexed = baseGeom.toNonIndexed();
  baseGeom.dispose();

  const faceCount = 8;
  const faceValues = [1, 8, 2, 7, 3, 6, 4, 5];
  const faceNormals: THREE.Vector3[] = [];
  const posAttr = nonIndexed.getAttribute('position');
  const uvs = new Float32Array(faceCount * 3 * 2);

  for (let f = 0; f < faceCount; f++) {
    const i = f * 3;
    const v0 = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    const v1 = new THREE.Vector3(posAttr.getX(i + 1), posAttr.getY(i + 1), posAttr.getZ(i + 1));
    const v2 = new THREE.Vector3(posAttr.getX(i + 2), posAttr.getY(i + 2), posAttr.getZ(i + 2));

    const center = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);
    faceNormals.push(center.clone().normalize());

    uvs[i * 2] = 0.5;
    uvs[i * 2 + 1] = 0.92;
    uvs[(i + 1) * 2] = 0.1;
    uvs[(i + 1) * 2 + 1] = 0.15;
    uvs[(i + 2) * 2] = 0.9;
    uvs[(i + 2) * 2 + 1] = 0.15;

    nonIndexed.addGroup(f * 3, 3, f);
  }

  nonIndexed.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  nonIndexed.computeVertexNormals();

  const materials = createDiceMaterials('d8', skinId, faceValues);
  const mesh = new THREE.Mesh(nonIndexed, materials);
  mesh.castShadow = true;

  return {
    mesh,
    faceValues,
    faceNormals,
    radius
  };
}

/**
 * Creates a D10 or D100 Pentagonal Trapezohedron Mesh.
 */
export function createD10(skinId: DiceSkin, isD100 = false, radius = 1.3): DiceMeshInfo {
  const faceCount = 10;
  const faceValues = isD100
    ? ['00', '10', '20', '30', '40', '50', '60', '70', '80', '90']
    : [1, 10, 2, 9, 3, 8, 4, 7, 5, 6];

  // Construct a 10-sided bipyramidal geometry
  const vertices: number[] = [];
  const uvs: number[] = [];
  const faceNormals: THREE.Vector3[] = [];
  const nonIndexed = new THREE.BufferGeometry();

  const top = new THREE.Vector3(0, radius * 1.15, 0);
  const bottom = new THREE.Vector3(0, -radius * 1.15, 0);

  const ringUpper: THREE.Vector3[] = [];
  const ringLower: THREE.Vector3[] = [];

  for (let i = 0; i < 5; i++) {
    const angleUpper = (i * 2 * Math.PI) / 5;
    ringUpper.push(
      new THREE.Vector3(
        radius * Math.cos(angleUpper),
        radius * 0.2,
        radius * Math.sin(angleUpper)
      )
    );

    const angleLower = ((i + 0.5) * 2 * Math.PI) / 5;
    ringLower.push(
      new THREE.Vector3(
        radius * Math.cos(angleLower),
        -radius * 0.2,
        radius * Math.sin(angleLower)
      )
    );
  }

  // 10 kites/triangular pairs
  for (let i = 0; i < 5; i++) {
    // Upper face
    const uNext = (i + 1) % 5;
    const f0_v0 = top;
    const f0_v1 = ringUpper[i];
    const f0_v2 = ringUpper[uNext];

    vertices.push(
      f0_v0.x, f0_v0.y, f0_v0.z,
      f0_v1.x, f0_v1.y, f0_v1.z,
      f0_v2.x, f0_v2.y, f0_v2.z
    );

    const c0 = new THREE.Vector3().add(f0_v0).add(f0_v1).add(f0_v2).divideScalar(3);
    faceNormals.push(c0.clone().normalize());

    uvs.push(0.5, 0.9, 0.1, 0.15, 0.9, 0.15);
    nonIndexed.addGroup(i * 3, 3, i);
  }

  for (let i = 0; i < 5; i++) {
    // Lower face
    const lNext = (i + 1) % 5;
    const f1_v0 = bottom;
    const f1_v1 = ringLower[lNext];
    const f1_v2 = ringLower[i];

    vertices.push(
      f1_v0.x, f1_v0.y, f1_v0.z,
      f1_v1.x, f1_v1.y, f1_v1.z,
      f1_v2.x, f1_v2.y, f1_v2.z
    );

    const c1 = new THREE.Vector3().add(f1_v0).add(f1_v1).add(f1_v2).divideScalar(3);
    faceNormals.push(c1.clone().normalize());

    uvs.push(0.5, 0.9, 0.1, 0.15, 0.9, 0.15);
    nonIndexed.addGroup((i + 5) * 3, 3, i + 5);
  }

  nonIndexed.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  nonIndexed.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  nonIndexed.computeVertexNormals();

  const materials = createDiceMaterials(isD100 ? 'd100' : 'd10', skinId, faceValues);
  const mesh = new THREE.Mesh(nonIndexed, materials);
  mesh.castShadow = true;

  return {
    mesh,
    faceValues,
    faceNormals,
    radius
  };
}

/**
 * Creates a D12 Dodecahedron Mesh.
 */
export function createD12(skinId: DiceSkin, radius = 1.3): DiceMeshInfo {
  const baseGeom = new THREE.DodecahedronGeometry(radius, 0);
  const nonIndexed = baseGeom.toNonIndexed();
  baseGeom.dispose();

  const faceCount = 12; // 12 pentagonal faces = 36 triangles
  const faceValues = [1, 12, 2, 11, 3, 10, 4, 9, 5, 8, 6, 7];
  const faceNormals: THREE.Vector3[] = [];
  const posAttr = nonIndexed.getAttribute('position');
  const count = posAttr.count;
  const uvs = new Float32Array(count * 2);

  // Group every 3 triangles into 1 pentagonal face
  for (let f = 0; f < faceCount; f++) {
    const triStart = f * 3;
    let center = new THREE.Vector3();
    for (let t = 0; t < 3; t++) {
      const idx = (triStart + t) * 3;
      const v0 = new THREE.Vector3(posAttr.getX(idx), posAttr.getY(idx), posAttr.getZ(idx));
      const v1 = new THREE.Vector3(posAttr.getX(idx + 1), posAttr.getY(idx + 1), posAttr.getZ(idx + 1));
      const v2 = new THREE.Vector3(posAttr.getX(idx + 2), posAttr.getY(idx + 2), posAttr.getZ(idx + 2));
      center.add(v0).add(v1).add(v2);

      uvs[idx * 2] = 0.5;
      uvs[idx * 2 + 1] = 0.85;
      uvs[(idx + 1) * 2] = 0.15;
      uvs[(idx + 1) * 2 + 1] = 0.2;
      uvs[(idx + 2) * 2] = 0.85;
      uvs[(idx + 2) * 2 + 1] = 0.2;
    }
    center.divideScalar(9).normalize();
    faceNormals.push(center);

    // Group 3 triangles (9 vertices) per face
    nonIndexed.addGroup(triStart * 3, 9, f);
  }

  nonIndexed.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  nonIndexed.computeVertexNormals();

  const materials = createDiceMaterials('d12', skinId, faceValues);
  const mesh = new THREE.Mesh(nonIndexed, materials);
  mesh.castShadow = true;

  return {
    mesh,
    faceValues,
    faceNormals,
    radius
  };
}

/**
 * Universal Factory to construct any 3D Dice Mesh.
 */
export function createDiceMesh(diceType: DiceType, skinId: DiceSkin, radius = 1.2): DiceMeshInfo {
  switch (diceType) {
    case 'd4':
      return createD4(skinId, radius);
    case 'd6':
      return createD6(skinId, radius * 1.2);
    case 'd8':
      return createD8(skinId, radius);
    case 'd10':
      return createD10(skinId, false, radius);
    case 'd12':
      return createD12(skinId, radius);
    case 'd100':
      return createD10(skinId, true, radius);
    case 'd20':
    default:
      return createD20(skinId, radius);
  }
}
