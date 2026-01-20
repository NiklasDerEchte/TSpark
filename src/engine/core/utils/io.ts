import { colord } from "colord";
import { component3D } from "../types";

/**
 * parses a .obj file and returns a RenderItem3 object
 * @param filePath 
 * @returns {Promise<component3D.RenderItem3>}
 */
export async function objFileToRenderItem(filePath: string): Promise<component3D.RenderItem3> {
  const response = await fetch(filePath);
  const objText = await response.text();

  const renderItem = new component3D.RenderItem3();
  const vertices: number[][] = [];
  const uvs: number[][] = [];
  const normals: number[][] = [];

  const finalVertices: number[] = [];
  const finalUvs: number[] = [];
  const finalNormals: number[] = [];

  const indices: number[] = [];
  const faceCache = new Map<string, number>();
  let faceCount = 0;

  const lines = objText.split('\n');
  let materialLib: string | undefined;

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const type = parts.shift();

    if (type === 'v') {
      vertices.push(parts.map(parseFloat));
    } else if (type === 'vt') {
      uvs.push(parts.map(parseFloat));
    } else if (type === 'vn') {
      normals.push(parts.map(parseFloat));
    } else if (type === 'f') {
      for (const part of parts) {
        if (faceCache.has(part)) {
          indices.push(faceCache.get(part)!);
          continue;
        }

        const [vIdx, uvIdx, nIdx] = part.split('/').map((s) => parseInt(s, 10) - 1);
        const newIndex = faceCount;
        faceCount++;
        faceCache.set(part, newIndex);
        indices.push(newIndex);

        finalVertices.push(...vertices[vIdx]);
        if (uvIdx < uvs.length) {
          finalUvs.push(...uvs[uvIdx]);
        }
        if (nIdx < normals.length) {
          finalNormals.push(...normals[nIdx]);
        }
      }
    } else if (type === 'mtllib') {
      materialLib = parts.join(' ');
    }
  }

  renderItem.geometry.vertices = finalVertices;
  renderItem.geometry.indices = indices;
  // TODO Noch nicht Implementiert: renderItem.geometry.normals = finalNormals;

  if (materialLib) {
    const objDirectory = filePath.substring(0, filePath.lastIndexOf('/') + 1);
    const mtlPath = objDirectory + materialLib;
    const materials = await mtlFileToMaterial(mtlPath);
    const firstMaterialName = Object.keys(materials)[0];
    if (firstMaterialName) {
      renderItem.material = materials[firstMaterialName];
      renderItem.material.uvs = finalUvs;
    }
  }

  return renderItem;
}

/**
 * parses a .mtl file and returns a dictionary of material names to Material3 objects
 * @param filePath 
 * @returns {Promise<{ [name: string]: component3D.Material3 }>}
 */
export async function mtlFileToMaterial(filePath: string): Promise<{ [name: string]: component3D.Material3 }> {
  const response = await fetch(filePath);
  const mtlText = await response.text();
  const materials: { [name: string]: component3D.Material3 } = {};

  const lines = mtlText.split('\n');
  let currentMaterial: component3D.Material3 | null = null;

  let blenderConverter = (n: number) => {
    return n ** (1 / 2.2) * 255;
  };

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const type = parts.shift();

    if (!type || type.startsWith('#')) {
      continue; // Skip empty lines and comments
    }

    if (type === 'newmtl') {
      const materialName = parts[0];
      currentMaterial = new component3D.Material3();
      materials[materialName] = currentMaterial;
    } else if (currentMaterial) {
      if (type === 'Ka') {
        // Ambient color
        const [r, g, b] = parts.map((p) => parseFloat(p));
        currentMaterial.ambient = colord({ r: blenderConverter(r), g: blenderConverter(g), b: blenderConverter(b), a: 1 });
      } else if (type === 'Kd') {
        // Diffuse color
        const [r, g, b] = parts.map((p) => parseFloat(p));
        console.log(r, g, b);
        currentMaterial.color = colord({ r: blenderConverter(r), g: blenderConverter(g), b: blenderConverter(b), a: 1 });
      } else if (type === 'Ks') {
        // Specular color
        const [r, g, b] = parts.map((p) => parseFloat(p));
        currentMaterial.specularColor = colord({ r: blenderConverter(r), g: blenderConverter(g), b: blenderConverter(b), a: 1 });
      } else if (type === 'Ns') {
        // Specular exponent (shininess)
        currentMaterial.specularColor.rgba.r = parseFloat(parts[0]) * 255; // Storing in r of RGBA as per structure
      } else if (type === 'd' || type === 'Tr') {
        const opacity = parseFloat(parts[0]);
        currentMaterial.color.rgba.a = type === 'Tr' ? 1 - opacity : opacity;
      } else if (type === 'map_Kd') {
        const objDirectory = filePath.substring(0, filePath.lastIndexOf('/') + 1);
        currentMaterial.texture.src = objDirectory + parts.join(' ');
      }
    }
  }

  return materials;
}
