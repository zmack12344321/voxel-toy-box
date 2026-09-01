/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Applies volume-preserving Taubin Laplacian smoothing (shrink step followed by inflation step)
 * to a 3D vertex position graph.
 */
export function applyTaubinSmoothing(
  positions: Float32Array | number[],
  origPositions: number[],
  indices: number[],
  smoothness: number
): void {
  const totalVertices = positions.length / 3;
  if (totalVertices === 0 || smoothness <= 0.01) return;

  // Build adjacency list for vertices
  const neighbors: Set<number>[] = new Array(totalVertices);
  for (let i = 0; i < totalVertices; i++) {
    neighbors[i] = new Set<number>();
  }

  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];

    neighbors[a].add(b);
    neighbors[a].add(c);
    neighbors[b].add(a);
    neighbors[b].add(c);
    neighbors[c].add(a);
    neighbors[c].add(b);
  }

  const tempPos = new Float32Array(positions.length);
  const lambda = Math.min(0.55, 0.5 * smoothness);
  const mu = -lambda * 1.04; // Negative inflation step prevents shrinkage
  const iterations = Math.max(1, Math.min(18, Math.round(smoothness * 18)));

  const maxDisplacement = 0.45 * smoothness;

  for (let it = 0; it < iterations; it++) {
    // Step 1: Shrinking pass with factor lambda
    for (let v = 0; v < totalVertices; v++) {
      const nbrs = neighbors[v];
      if (nbrs.size === 0) {
        tempPos[v * 3] = positions[v * 3];
        tempPos[v * 3 + 1] = positions[v * 3 + 1];
        tempPos[v * 3 + 2] = positions[v * 3 + 2];
        continue;
      }

      let avgX = 0, avgY = 0, avgZ = 0;
      nbrs.forEach(n => {
        avgX += positions[n * 3];
        avgY += positions[n * 3 + 1];
        avgZ += positions[n * 3 + 2];
      });
      avgX /= nbrs.size;
      avgY /= nbrs.size;
      avgZ /= nbrs.size;

      tempPos[v * 3] = positions[v * 3] + lambda * (avgX - positions[v * 3]);
      tempPos[v * 3 + 1] = positions[v * 3 + 1] + lambda * (avgY - positions[v * 3 + 1]);
      tempPos[v * 3 + 2] = positions[v * 3 + 2] + lambda * (avgZ - positions[v * 3 + 2]);
    }

    // Step 2: Inflating pass with factor mu
    for (let v = 0; v < totalVertices; v++) {
      const nbrs = neighbors[v];
      if (nbrs.size === 0) {
        positions[v * 3] = tempPos[v * 3];
        positions[v * 3 + 1] = tempPos[v * 3 + 1];
        positions[v * 3 + 2] = tempPos[v * 3 + 2];
        continue;
      }

      let avgX = 0, avgY = 0, avgZ = 0;
      nbrs.forEach(n => {
        avgX += tempPos[n * 3];
        avgY += tempPos[n * 3 + 1];
        avgZ += tempPos[n * 3 + 2];
      });
      avgX /= nbrs.size;
      avgY /= nbrs.size;
      avgZ /= nbrs.size;

      let newX = tempPos[v * 3] + mu * (avgX - tempPos[v * 3]);
      let newY = tempPos[v * 3 + 1] + mu * (avgY - tempPos[v * 3 + 1]);
      let newZ = tempPos[v * 3 + 2] + mu * (avgZ - tempPos[v * 3 + 2]);

      // Clamp displacement relative to original mesh position
      const ox = origPositions[v * 3];
      const oy = origPositions[v * 3 + 1];
      const oz = origPositions[v * 3 + 2];

      const dx = newX - ox;
      const dy = newY - oy;
      const dz = newZ - oz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist > maxDisplacement && dist > 0.0001) {
        const scale = maxDisplacement / dist;
        newX = ox + dx * scale;
        newY = oy + dy * scale;
        newZ = oz + dz * scale;
      }

      positions[v * 3] = newX;
      positions[v * 3 + 1] = newY;
      positions[v * 3 + 2] = newZ;
    }
  }
}
