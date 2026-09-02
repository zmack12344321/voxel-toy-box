import { describe, expect, it } from 'vitest';
import { executeScatter } from '../../utils/scatterEngine';

const state = { map: new Map(), palette: new Map() };

describe('scatter engine', () => {
  it('produces the same placements for the same seed', () => {
    const command = {
      op: 'scatter' as const,
      asset: 'missing-asset',
      area: { type: 'circle' as const, center: [0, 4, 0] as [number, number, number], radius: 12 },
      count: 8,
      seed: 42,
      scaleVariance: [0.8, 1.2] as [number, number],
      rotationVariance: true,
      snapToSurface: false,
    };

    expect(executeScatter(state, command)).toEqual(executeScatter(state, command));
  });

  it('changes placements when the seed changes', () => {
    const base = {
      op: 'scatter' as const,
      asset: 'missing-asset',
      area: { type: 'box' as const, center: [0, 4, 0] as [number, number, number], size: [20, 20] as [number, number] },
      count: 4,
      snapToSurface: false,
    };

    expect(executeScatter(state, { ...base, seed: 1 })).not.toEqual(executeScatter(state, { ...base, seed: 2 }));
  });

  it('honors minimum spacing when the area can accommodate it', () => {
    const commands = executeScatter(state, {
      op: 'scatter', asset: 'missing-asset',
      area: { type: 'box', center: [0, 4, 0], size: [30, 30] },
      count: 8, seed: 7, minDistance: 5, snapToSurface: false,
    });
    const points = commands.map(command => (command as { at: [number, number, number] }).at);
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        expect(Math.hypot(points[i][0] - points[j][0], points[i][2] - points[j][2])).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it('can require a valid surface before placing', () => {
    const emptyState = { map: new Map(), palette: new Map() };
    const commands = executeScatter(emptyState, {
      op: 'scatter', asset: 'missing-asset', area: { type: 'box', center: [0, 4, 0], size: [10, 10] },
      count: 4, seed: 1, requireSurface: true,
    });
    expect(commands).toEqual([]);
  });

  it('can reject placements below the active water level', () => {
    const wetState = { map: new Map([['0,0,0', { x: 0, y: 0, z: 0, color: 1 }]]), palette: new Map() };
    const commands = executeScatter(wetState, {
      op: 'scatter', asset: 'missing-asset', area: { type: 'box', center: [0, 0, 0], size: [1, 1] },
      count: 1, seed: 1, avoidWater: true,
    }, 1);
    expect(commands).toEqual([]);
  });
});
