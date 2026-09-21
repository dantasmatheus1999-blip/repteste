import * as THREE from 'three';
import { DiceType, DiceMeshInfo } from './types';
import { getDiceTemplate } from './DiceTemplateManager';

export type { DiceMeshInfo };

export interface CachedGeometryData {
  geometry: THREE.BufferGeometry;
  faceNormals: THREE.Vector3[];
  faceValues: (number | string)[];
  faceIds: string[];
  radius: number;
}

const GEOMETRY_CACHE: Partial<Record<DiceType, CachedGeometryData>> = {};

/**
 * Constructs D20 Icosahedron BufferGeometry with UVs bound to the official 5x4 net template.
 */
function buildD20Geometry(radius = 1.2): CachedGeometryData {
  const template = getDiceTemplate('d20');
  const baseGeom = new THREE.IcosahedronGeometry(radius, 0);
  const nonIndexed = baseGeom.toNonIndexed();
  baseGeom.dispose();

  const posAttr = nonIndexed.getAttribute('position');
  const count = posAttr.count; // 60 vertices (20 triangles)
  const faceCount = count / 3; // 20

  const uvs = new Float32Array(count * 2);
  const faceNormals: THREE.Vector3[] = [];
  const faceValues: (number | string)[] = [];
  const faceIds: string[] = [];

  for (let f = 0; f < faceCount; f++) {
    const i = f * 3;
    const v0 = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    const v1 = new THREE.Vector3(posAttr.getX(i + 1), posAttr.getY(i + 1), posAttr.getZ(i + 1));
    const v2 = new THREE.Vector3(posAttr.getX(i + 2), posAttr.getY(i + 2), posAttr.getZ(i + 2));

    const center = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);
    const normal = center.clone().normalize();
    faceNormals.push(normal);

    const faceDef = template.faces[f] || template.faces[0];
    faceValues.push(faceDef.value);
    faceIds.push(faceDef.faceId);

    // Map the 3 vertices to the template's UV triangle
    const [uv0, uv1, uv2] = faceDef.uvCoords;
    uvs[i * 2] = uv0[0];
    uvs[i * 2 + 1] = uv0[1];

    uvs[(i + 1) * 2] = uv1[0];
    uvs[(i + 1) * 2 + 1] = uv1[1];

    uvs[(i + 2) * 2] = uv2[0];
    uvs[(i + 2) * 2 + 1] = uv2[1];
  }

  nonIndexed.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  nonIndexed.computeVertexNormals();

  return {
    geometry: nonIndexed,
    faceNormals,
    faceValues,
    faceIds,
    radius
  };
}

/**
 * Constructs D6 Box BufferGeometry with UVs bound to the cross net template.
 */
function buildD6Geometry(size = 1.6): CachedGeometryData {
  const template = getDiceTemplate('d6');
  const geom = new THREE.BufferGeometry();
  const s = size / 2;

  // 6 faces: Top (+Y), Front (+Z), Right (+X), Left (-X), Back (-Z), Bottom (-Y)
  const faceVertices = [
    // Face 0: Top (+Y)
    [[-s, s, -s], [s, s, -s], [s, s, s], [-s, s, s]],
    // Face 1: Front (+Z)
    [[-s, s, s], [s, s, s], [s, -s, s], [-s, -s, s]],
    // Face 2: Right (+X)
    [[s, s, s], [s, s, -s], [s, -s, -s], [s, -s, s]],
    // Face 3: Left (-X)
    [[-s, s, -s], [-s, s, s], [-s, -s, s], [-s, -s, -s]],
    // Face 4: Back (-Z)
    [[s, s, -s], [-s, s, -s], [-s, -s, -s], [s, -s, -s]],
    // Face 5: Bottom (-Y)
    [[-s, -s, s], [s, -s, s], [s, -s, -s], [-s, -s, -s]],
  ];

  const positions: number[] = [];
  const uvs: number[] = [];
  const faceNormals: THREE.Vector3[] = [];
  const faceValues: (number | string)[] = [];
  const faceIds: string[] = [];

  const rawNormals = [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(0, -1, 0),
  ];

  for (let f = 0; f < 6; f++) {
    const [p0, p1, p2, p3] = faceVertices[f];
    const faceDef = template.faces[f];
    const [uv0, uv1, uv2, uv3] = faceDef.uvCoords;

    // Triangle 1: p0, p1, p2
    positions.push(...p0, ...p1, ...p2);
    uvs.push(uv0[0], uv0[1], uv1[0], uv1[1], uv2[0], uv2[1]);

    // Triangle 2: p0, p2, p3
    positions.push(...p0, ...p2, ...p3);
    uvs.push(uv0[0], uv0[1], uv2[0], uv2[1], uv3[0], uv3[1]);

    faceNormals.push(rawNormals[f]);
    faceValues.push(faceDef.value);
    faceIds.push(faceDef.faceId);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();

  return {
    geometry: geom,
    faceNormals,
    faceValues,
    faceIds,
    radius: size * 0.86
  };
}

/**
 * Constructs D4 Tetrahedron BufferGeometry.
 */
function buildD4Geometry(radius = 1.3): CachedGeometryData {
  const template = getDiceTemplate('d4');
  const baseGeom = new THREE.TetrahedronGeometry(radius, 0);
  const nonIndexed = baseGeom.toNonIndexed();
  baseGeom.dispose();

  const posAttr = nonIndexed.getAttribute('position');
  const count = posAttr.count; // 12 vertices (4 triangles)
  const faceCount = count / 3;

  const uvs = new Float32Array(count * 2);
  const faceNormals: THREE.Vector3[] = [];
  const faceValues: (number | string)[] = [];
  const faceIds: string[] = [];

  for (let f = 0; f < faceCount; f++) {
    const i = f * 3;
    const v0 = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    const v1 = new THREE.Vector3(posAttr.getX(i + 1), posAttr.getY(i + 1), posAttr.getZ(i + 1));
    const v2 = new THREE.Vector3(posAttr.getX(i + 2), posAttr.getY(i + 2), posAttr.getZ(i + 2));

    const center = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);
    faceNormals.push(center.clone().normalize());

    const faceDef = template.faces[f] || template.faces[0];
    faceValues.push(faceDef.value);
    faceIds.push(faceDef.faceId);

    const [uv0, uv1, uv2] = faceDef.uvCoords;
    uvs[i * 2] = uv0[0];
    uvs[i * 2 + 1] = uv0[1];

    uvs[(i + 1) * 2] = uv1[0];
    uvs[(i + 1) * 2 + 1] = uv1[1];

    uvs[(i + 2) * 2] = uv2[0];
    uvs[(i + 2) * 2 + 1] = uv2[1];
  }

  nonIndexed.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  nonIndexed.computeVertexNormals();

  return {
    geometry: nonIndexed,
    faceNormals,
    faceValues,
    faceIds,
    radius
  };
}

/**
 * Constructs D8 Octahedron BufferGeometry.
 */
function buildD8Geometry(radius = 1.3): CachedGeometryData {
  const template = getDiceTemplate('d8');
  const baseGeom = new THREE.OctahedronGeometry(radius, 0);
  const nonIndexed = baseGeom.toNonIndexed();
  baseGeom.dispose();

  const posAttr = nonIndexed.getAttribute('position');
  const count = posAttr.count; // 24 vertices (8 triangles)
  const faceCount = count / 3;

  const uvs = new Float32Array(count * 2);
  const faceNormals: THREE.Vector3[] = [];
  const faceValues: (number | string)[] = [];
  const faceIds: string[] = [];

  for (let f = 0; f < faceCount; f++) {
    const i = f * 3;
    const v0 = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    const v1 = new THREE.Vector3(posAttr.getX(i + 1), posAttr.getY(i + 1), posAttr.getZ(i + 1));
    const v2 = new THREE.Vector3(posAttr.getX(i + 2), posAttr.getY(i + 2), posAttr.getZ(i + 2));

    const center = new THREE.Vector3().add(v0).add(v1).add(v2).divideScalar(3);
    faceNormals.push(center.clone().normalize());

    const faceDef = template.faces[f] || template.faces[0];
    faceValues.push(faceDef.value);
    faceIds.push(faceDef.faceId);

    const [uv0, uv1, uv2] = faceDef.uvCoords;
    uvs[i * 2] = uv0[0];
    uvs[i * 2 + 1] = uv0[1];

    uvs[(i + 1) * 2] = uv1[0];
    uvs[(i + 1) * 2 + 1] = uv1[1];

    uvs[(i + 2) * 2] = uv2[0];
    uvs[(i + 2) * 2 + 1] = uv2[1];
  }

  nonIndexed.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  nonIndexed.computeVertexNormals();

  return {
    geometry: nonIndexed,
    faceNormals,
    faceValues,
    faceIds,
    radius
  };
}

/**
 * Constructs D10 Pentagonal Trapezohedron BufferGeometry.
 */
function buildD10Geometry(isD100 = false, radius = 1.3): CachedGeometryData {
  const template = getDiceTemplate(isD100 ? 'd100' : 'd10');
  const geom = new THREE.BufferGeometry();

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

  const positions: number[] = [];
  const uvs: number[] = [];
  const faceNormals: THREE.Vector3[] = [];
  const faceValues: (number | string)[] = [];
  const faceIds: string[] = [];

  // Upper 5 faces (indices 0..4)
  for (let i = 0; i < 5; i++) {
    const uNext = (i + 1) % 5;
    const vTop = top;
    const vRight = ringUpper[uNext];
    const vLeft = ringUpper[i];
    const vMid = ringLower[i];

    // Kite face made of 2 triangles: (vTop, vRight, vMid) and (vTop, vMid, vLeft)
    const faceDef = template.faces[i];
    const [uvTop, uvRight, uvBot, uvLeft] = faceDef.uvCoords;

    positions.push(
      vTop.x, vTop.y, vTop.z,
      vRight.x, vRight.y, vRight.z,
      vMid.x, vMid.y, vMid.z,

      vTop.x, vTop.y, vTop.z,
      vMid.x, vMid.y, vMid.z,
      vLeft.x, vLeft.y, vLeft.z
    );

    uvs.push(
      uvTop[0], uvTop[1],
      uvRight[0], uvRight[1],
      uvBot[0], uvBot[1],

      uvTop[0], uvTop[1],
      uvBot[0], uvBot[1],
      uvLeft[0], uvLeft[1]
    );

    const center = new THREE.Vector3().add(vTop).add(vRight).add(vLeft).add(vMid).divideScalar(4);
    faceNormals.push(center.clone().normalize());
    faceValues.push(faceDef.value);
    faceIds.push(faceDef.faceId);
  }

  // Lower 5 faces (indices 5..9)
  for (let i = 0; i < 5; i++) {
    const lNext = (i + 1) % 5;
    const vBot = bottom;
    const vLeft = ringLower[lNext];
    const vRight = ringLower[i];
    const vMid = ringUpper[lNext];

    const faceDef = template.faces[i + 5];
    const [uvTop, uvRight, uvBot, uvLeft] = faceDef.uvCoords;

    positions.push(
      vBot.x, vBot.y, vBot.z,
      vLeft.x, vLeft.y, vLeft.z,
      vMid.x, vMid.y, vMid.z,

      vBot.x, vBot.y, vBot.z,
      vMid.x, vMid.y, vMid.z,
      vRight.x, vRight.y, vRight.z
    );

    uvs.push(
      uvBot[0], uvBot[1],
      uvLeft[0], uvLeft[1],
      uvTop[0], uvTop[1],

      uvBot[0], uvBot[1],
      uvTop[0], uvTop[1],
      uvRight[0], uvRight[1]
    );

    const center = new THREE.Vector3().add(vBot).add(vLeft).add(vRight).add(vMid).divideScalar(4);
    faceNormals.push(center.clone().normalize());
    faceValues.push(faceDef.value);
    faceIds.push(faceDef.faceId);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();

  return {
    geometry: geom,
    faceNormals,
    faceValues,
    faceIds,
    radius
  };
}

/**
 * Constructs D12 Dodecahedron BufferGeometry.
 */
function buildD12Geometry(radius = 1.3): CachedGeometryData {
  const template = getDiceTemplate('d12');
  const baseGeom = new THREE.DodecahedronGeometry(radius, 0);
  const nonIndexed = baseGeom.toNonIndexed();
  baseGeom.dispose();

  const posAttr = nonIndexed.getAttribute('position');
  const count = posAttr.count; // 108 vertices (12 faces x 3 triangles x 3 vertices)
  const faceCount = 12;

  const uvs = new Float32Array(count * 2);
  const faceNormals: THREE.Vector3[] = [];
  const faceValues: (number | string)[] = [];
  const faceIds: string[] = [];

  for (let f = 0; f < faceCount; f++) {
    const triStart = f * 9; // 9 vertices per pentagonal face
    let center = new THREE.Vector3();

    for (let v = 0; v < 9; v++) {
      const idx = triStart + v;
      center.add(new THREE.Vector3(posAttr.getX(idx), posAttr.getY(idx), posAttr.getZ(idx)));
    }
    center.divideScalar(9).normalize();
    faceNormals.push(center);

    const faceDef = template.faces[f] || template.faces[0];
    faceValues.push(faceDef.value);
    faceIds.push(faceDef.faceId);

    const uvPts = faceDef.uvCoords; // 5 pentagon vertices
    // Triangle 1: uvPts[0], uvPts[1], uvPts[2]
    uvs[triStart * 2] = uvPts[0][0];
    uvs[triStart * 2 + 1] = uvPts[0][1];
    uvs[(triStart + 1) * 2] = uvPts[1][0];
    uvs[(triStart + 1) * 2 + 1] = uvPts[1][1];
    uvs[(triStart + 2) * 2] = uvPts[2][0];
    uvs[(triStart + 2) * 2 + 1] = uvPts[2][1];

    // Triangle 2: uvPts[0], uvPts[2], uvPts[3]
    uvs[(triStart + 3) * 2] = uvPts[0][0];
    uvs[(triStart + 3) * 2 + 1] = uvPts[0][1];
    uvs[(triStart + 4) * 2] = uvPts[2][0];
    uvs[(triStart + 4) * 2 + 1] = uvPts[2][1];
    uvs[(triStart + 5) * 2] = uvPts[3][0];
    uvs[(triStart + 5) * 2 + 1] = uvPts[3][1];

    // Triangle 3: uvPts[0], uvPts[3], uvPts[4]
    uvs[(triStart + 6) * 2] = uvPts[0][0];
    uvs[(triStart + 6) * 2 + 1] = uvPts[0][1];
    uvs[(triStart + 7) * 2] = uvPts[3][0];
    uvs[(triStart + 7) * 2 + 1] = uvPts[3][1];
    uvs[(triStart + 8) * 2] = uvPts[4][0];
    uvs[(triStart + 8) * 2 + 1] = uvPts[4][1];
  }

  nonIndexed.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  nonIndexed.computeVertexNormals();

  return {
    geometry: nonIndexed,
    faceNormals,
    faceValues,
    faceIds,
    radius
  };
}

/**
 * Universal Geometry Registry.
 * Guarantees geometry is created only ONCE per dice type and cached in memory.
 */
export function getDiceGeometry(diceType: DiceType): CachedGeometryData {
  if (GEOMETRY_CACHE[diceType]) {
    return GEOMETRY_CACHE[diceType]!;
  }

  let data: CachedGeometryData;
  switch (diceType) {
    case 'd4':
      data = buildD4Geometry();
      break;
    case 'd6':
      data = buildD6Geometry();
      break;
    case 'd8':
      data = buildD8Geometry();
      break;
    case 'd10':
      data = buildD10Geometry(false);
      break;
    case 'd100':
      data = buildD10Geometry(true);
      break;
    case 'd12':
      data = buildD12Geometry();
      break;
    case 'd20':
    default:
      data = buildD20Geometry();
      break;
  }

  GEOMETRY_CACHE[diceType] = data;
  return data;
}

/**
 * Constructs a ready-to-render THREE.Mesh with the fixed geometry and applied material.
 */
export function createDiceMeshWithMaterial(
  diceType: DiceType,
  material: THREE.Material | THREE.Material[],
  scale = 1.0
): DiceMeshInfo {
  const geomData = getDiceGeometry(diceType);
  const mesh = new THREE.Mesh(geomData.geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  if (scale !== 1.0) {
    mesh.scale.setScalar(scale);
  }

  return {
    mesh,
    geometry: geomData.geometry,
    material,
    faceValues: geomData.faceValues,
    faceNormals: geomData.faceNormals,
    faceIds: geomData.faceIds,
    radius: geomData.radius * scale
  };
}
