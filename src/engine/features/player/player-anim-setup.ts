import { AnimatorControllerComponent, type AnimState } from './animator-controller';

function state(name: string, clip: string, transitions: AnimState['transitions']): AnimState {
  return { name, clip, transitions };
}

export function createPlayerAnimatorController(): AnimatorControllerComponent {
  return new AnimatorControllerComponent({
    current: 'idle',
    parameters: {
      Speed: 0,
      Grounded: true,
      Rising: false,
      Crouch: false,
      Dig: false,
      Grab: false,
    },
    anyState: [
      { to: 'dig', conditions: [{ param: 'Dig', equals: true }] },
      { to: 'grab', conditions: [{ param: 'Grab', equals: true }] },
      { to: 'jump', conditions: [{ param: 'Grounded', equals: false }, { param: 'Rising', equals: true }] },
      { to: 'fall', conditions: [{ param: 'Grounded', equals: false }, { param: 'Rising', equals: false }] },
    ],
    states: [
      state('idle', 'idle', [
        { to: 'walk', conditions: [{ param: 'Grounded', equals: true }, { param: 'Speed', greater: 0.12 }] },
        { to: 'crouch', conditions: [{ param: 'Crouch', equals: true }, { param: 'Grounded', equals: true }] },
      ]),
      state('walk', 'walk', [
        { to: 'idle', conditions: [{ param: 'Grounded', equals: true }, { param: 'Speed', less: 0.12 }] },
        { to: 'crouch', conditions: [{ param: 'Crouch', equals: true }, { param: 'Grounded', equals: true }] },
      ]),
      state('crouch', 'crouch', [
        { to: 'idle', conditions: [{ param: 'Crouch', equals: false }, { param: 'Grounded', equals: true }] },
      ]),
      state('jump', 'jump', [
        { to: 'fall', conditions: [{ param: 'Rising', equals: false }, { param: 'Grounded', equals: false }] },
        { to: 'idle', conditions: [{ param: 'Grounded', equals: true }, { param: 'Speed', less: 0.12 }] },
        { to: 'walk', conditions: [{ param: 'Grounded', equals: true }, { param: 'Speed', greater: 0.12 }] },
      ]),
      state('fall', 'fall', [
        { to: 'idle', conditions: [{ param: 'Grounded', equals: true }, { param: 'Speed', less: 0.12 }] },
        { to: 'walk', conditions: [{ param: 'Grounded', equals: true }, { param: 'Speed', greater: 0.12 }] },
      ]),
      state('dig', 'dig', [
        { to: 'idle', conditions: [{ param: 'Dig', equals: false }, { param: 'Grounded', equals: true }] },
        { to: 'fall', conditions: [{ param: 'Dig', equals: false }, { param: 'Grounded', equals: false }] },
      ]),
      state('grab', 'grab', [
        { to: 'idle', conditions: [{ param: 'Grab', equals: false }, { param: 'Grounded', equals: true }] },
        { to: 'fall', conditions: [{ param: 'Grab', equals: false }, { param: 'Grounded', equals: false }] },
      ]),
    ],
  });
}
