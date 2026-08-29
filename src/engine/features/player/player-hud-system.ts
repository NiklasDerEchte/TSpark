import { TSpark } from '../../../app';
import type { System, WorldQueryData } from '../../core/types';
import type { World } from '../../core/world';
import { PlayerComponent } from './player-component';

export class PlayerHudSystem implements System {
  world!: World;
  private ready = false;
  private cargoLabel: Text | undefined;
  private stateLabel: Text | undefined;
  private wrongLabel: Text | undefined;
  private slots: HTMLButtonElement[] = [];

  init(world: World): void {
    this.world = world;
    TSpark.getInstance()
      .inject({
        html: ['ui/powder-player-overlay/overlay.html'],
        css: ['ui/powder-player-overlay/overlay.css'],
      })
      .then(() => {
        this.cargoLabel = this.createText('#player-cargo');
        this.stateLabel = this.createText('#player-state');
        this.wrongLabel = this.createText('#player-wrong');
        this.slots = Array.from(document.querySelectorAll('#player-hotbar button'));
        this.slots.forEach((button) => {
          button.addEventListener('click', () => {
            const slot = Number(button.dataset.slot);
            this.world.query<PlayerComponent>(PlayerComponent.name, (result: WorldQueryData<PlayerComponent>) => {
              if (slot >= 0 && slot < result.component.hotbar.length) {
                result.component.selectedSlot = slot;
              }
            });
          });
        });
        this.ready = true;
      });
  }

  exec(_deltaTimeMs: number): void {
    if (!this.ready) return;
    this.world.query<PlayerComponent>(PlayerComponent.name, (result: WorldQueryData<PlayerComponent>) => {
      const player = result.component;
      const tool = player.activeTool();
      if (this.cargoLabel) this.cargoLabel.nodeValue = `${player.cargo.length} / ${player.grabCapacity}`;
      if (this.stateLabel) {
        const bits: string[] = [tool.name];
        if (player.grounded) bits.push('ground');
        else bits.push(player.vy < 0 ? 'jump' : 'air');
        if (player.crouching) bits.push('crouch');
        if (player.digHeld) bits.push('dig');
        if (player.grabHeld) bits.push('grab');
        this.stateLabel.nodeValue = bits.join(' · ');
      }
      if (this.wrongLabel) {
        this.wrongLabel.nodeValue = player.wrongTool ? `Wrong tool for this material` : '';
      }
      this.slots.forEach((button) => {
        button.classList.toggle('active', Number(button.dataset.slot) === player.selectedSlot);
      });
    });
  }

  destroy(): void {}

  private createText(selector: string): Text {
    const element = document.querySelector(selector);
    const textNode = document.createTextNode('');
    element?.appendChild(textNode);
    return textNode;
  }
}
