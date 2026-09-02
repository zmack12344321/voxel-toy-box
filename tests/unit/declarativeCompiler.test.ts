import { describe, expect, it } from 'vitest';
import { compileDeclarativePayload, compileSceneSpec } from '../../services/rasterizer';
import { tropicalIslandTerrain } from '../../utils/biomes/tropical';

describe('declarative compiler', () => {
  it('compiles and centers a declarative box', () => {
    const result = compileDeclarativePayload({ palette: { body: '#123456' }, commands: [{ op: 'box', at: [4, 2, 6], size: [2, 1, 2], color: 'body' }] });
    expect(result.water).toBeNull(); expect(result.animatedEntities).toEqual([]);
    expect(result.voxels).toHaveLength(18);
    expect(result.voxels.every(v => v.color === 0x123456)).toBe(true);
    expect(Math.min(...result.voxels.map(v => v.x))).toBe(-1);
    expect(Math.max(...result.voxels.map(v => v.x))).toBe(1);
    expect(Math.min(...result.voxels.map(v => v.y))).toBe(0);
    expect(Math.max(...result.voxels.map(v => v.y))).toBe(1);
    expect(Math.min(...result.voxels.map(v => v.z))).toBe(-1);
    expect(Math.max(...result.voxels.map(v => v.z))).toBe(1);
  });
  it('compiles water metadata and animated entities', () => {
    const waypoints: Array<[number, number, number]> = [[0, 0, 0], [2, 0, 0]];
    const result = compileDeclarativePayload({ commands: [
      { op: 'box', at: [0, 2, 0], size: [1, 1, 1], color: '#fff' },
      { op: 'water', at: [0, 5, 0], size: [10, 10], color: '#00f' },
    ], animatedEntities: [{ id: 'orb', waypoints, commands: [{ op: 'box', at: [0, 0, 0], size: [1, 1, 1], color: '#f00' }] }] });
    expect(result.water?.level).toBe(3); expect(result.animatedEntities[0].speed).toBe(0.1);
    waypoints[0][0] = 99;
    expect(result.animatedEntities[0].waypoints[0][0]).toBe(0);
  });
  it('generates the canonical tropical palm layout deterministically', () => {
    const first = tropicalIslandTerrain([10, 2, -4], [100, 30, 100], 8);
    const second = tropicalIslandTerrain([10, 2, -4], [100, 30, 100], 8);
    expect(second).toEqual(first);
    expect(tropicalIslandTerrain([10, 2, -4], [100, 30, 100], 8, undefined, 42))
      .not.toEqual(first);
  });

  it('adapts canonical scene specs into the legacy compiler', () => {
    const result = compileSceneSpec({
      model: {
        palette: { body: '#123456' },
        commands: [{ op: 'box', at: [0, 0, 0], size: [1, 1, 1], color: 'body' }],
      },
      sceneCommands: [{ op: 'water', at: [0, 2, 0], size: [4, 4], color: '#0000ff' }],
    });
    expect(result.voxels).toHaveLength(8);
    expect(result.water?.level).toBe(2);
  });
});
