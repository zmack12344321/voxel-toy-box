import * as THREE from 'three';

export interface FrameLoopHooks {
  update(delta: number): void;
}

export interface FrameScheduler {
  request(callback: () => void): number;
  cancel(id: number): void;
}

interface DeltaClock {
  getDelta(): number;
}

/** Owns requestAnimationFrame scheduling and clock lifetime for the renderer runtime. */
export class EngineFrameLoop {
  private readonly clock: DeltaClock;
  private readonly scheduler: FrameScheduler;
  private animationId: number | null = null;
  private running = false;

  public constructor(
    scheduler: FrameScheduler = {
      request: callback => requestAnimationFrame(callback),
      cancel: id => cancelAnimationFrame(id),
    },
    clock: DeltaClock = new THREE.Clock(),
  ) {
    this.scheduler = scheduler;
    this.clock = clock;
  }

  public start(hooks: FrameLoopHooks): void {
    if (this.running) return;
    this.running = true;
    const tick = () => {
      if (!this.running) return;
      this.animationId = this.scheduler.request(tick);
      hooks.update(this.clock.getDelta());
    };
    tick();
  }

  public stop(): void {
    this.running = false;
    if (this.animationId !== null) this.scheduler.cancel(this.animationId);
    this.animationId = null;
  }
}
