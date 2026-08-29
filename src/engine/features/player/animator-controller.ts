import { assignProps } from '../../core/utils/common';
import type { Component, Properties, System, WorldQueryData } from '../../core/types';
import type { World } from '../../core/world';
import { SpriteAnimatorComponent } from './sprite-animator';

export type AnimParamValue = number | boolean;

export interface AnimCondition {
  param: string;
  equals?: AnimParamValue;
  greater?: number;
  less?: number;
}

export interface AnimTransition {
  to: string;
  conditions: AnimCondition[];
}

export interface AnimState {
  name: string;
  clip: string;
  transitions: AnimTransition[];
}

export class AnimatorControllerComponent implements Component<{
  parameters: Record<string, AnimParamValue>;
  states: AnimState[];
  anyState: AnimTransition[];
  current: string;
}> {
  parameters: Record<string, AnimParamValue> = {};
  states: AnimState[] = [];
  anyState: AnimTransition[] = [];
  current: string = 'idle';

  constructor(props?: Properties<AnimatorControllerComponent>) {
    assignProps(this, props);
  }

  setNumber(name: string, value: number): void {
    this.parameters[name] = value;
  }

  setBool(name: string, value: boolean): void {
    this.parameters[name] = value;
  }
}

function matches(controller: AnimatorControllerComponent, conditions: AnimCondition[]): boolean {
  return conditions.every((condition) => {
    const value = controller.parameters[condition.param];
    if (condition.equals !== undefined) return value === condition.equals;
    if (typeof value !== 'number') return false;
    if (condition.greater !== undefined && !(value > condition.greater)) return false;
    if (condition.less !== undefined && !(value < condition.less)) return false;
    return true;
  });
}

export class AnimatorControllerSystem implements System {
  world!: World;

  init(world: World): void {
    this.world = world;
  }

  exec(deltaTimeMs: number): void {
    this.world.query<AnimatorControllerComponent>(AnimatorControllerComponent.name, (result: WorldQueryData<AnimatorControllerComponent>) => {
      const controller = result.component;
      const next = this.evaluate(controller);
      if (next && next !== controller.current) {
        controller.current = next;
        this.world.queryOne<SpriteAnimatorComponent>(SpriteAnimatorComponent.name, result.entity, (anim: WorldQueryData<SpriteAnimatorComponent>) => {
          const state = controller.states.find((item) => item.name === next);
          anim.component.play(state?.clip ?? next);
        });
      }
      this.world.queryOne<SpriteAnimatorComponent>(SpriteAnimatorComponent.name, result.entity, (anim: WorldQueryData<SpriteAnimatorComponent>) => {
        this.advance(anim.component, deltaTimeMs / 1000);
      });
    });
  }

  destroy(): void {}

  private evaluate(controller: AnimatorControllerComponent): string | undefined {
    for (const transition of controller.anyState) {
      if (transition.to !== controller.current && matches(controller, transition.conditions)) {
        return transition.to;
      }
    }
    const state = controller.states.find((item) => item.name === controller.current);
    if (!state) return controller.states[0]?.name;
    for (const transition of state.transitions) {
      if (matches(controller, transition.conditions)) return transition.to;
    }
    return controller.current;
  }

  private advance(animator: SpriteAnimatorComponent, dt: number): void {
    const clip = animator.clip();
    if (!clip || clip.frames <= 1) {
      animator.frame = 0;
      return;
    }
    animator.time += dt * clip.fps;
    if (clip.loop) {
      animator.frame = Math.floor(animator.time) % clip.frames;
    } else {
      animator.frame = Math.min(Math.floor(animator.time), clip.frames - 1);
    }
  }
}
