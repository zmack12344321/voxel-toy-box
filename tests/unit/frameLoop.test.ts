import { describe, expect, it } from 'vitest';
import { EngineFrameLoop } from '../../services/runtime/EngineFrameLoop';

describe('EngineFrameLoop', () => {
  it('schedules one frame and cancels it on stop', () => {
    let callback: (() => void) | undefined;
    let cancelled: number | undefined;
    const loop = new EngineFrameLoop(
      { request: next => { callback = next; return 7; }, cancel: id => { cancelled = id; } },
      { getDelta: () => 0.25 },
    );
    const deltas: number[] = [];
    loop.start({ update: delta => deltas.push(delta) });
    expect(deltas).toEqual([0.25]);
    callback?.();
    expect(deltas).toEqual([0.25, 0.25]);
    loop.stop();
    expect(cancelled).toBe(7);
  });

  it('does not schedule twice when started repeatedly', () => {
    let requests = 0;
    const loop = new EngineFrameLoop(
      { request: () => ++requests, cancel: () => undefined },
      { getDelta: () => 0 },
    );
    loop.start({ update: () => undefined });
    loop.start({ update: () => undefined });
    expect(requests).toBe(1);
  });
});
