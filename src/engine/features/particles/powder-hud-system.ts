import { TSpark } from '../../../app';
import type { System, WorldQueryData } from '../../core/types';
import type { World } from '../../core/world';
import { MATERIALS, type MaterialId } from './materials';
import { PowderWorldComponent } from './powder-world';

export class PowderHudSystem implements System {
  world!: World;
  private ready = false;
  private materialLabel: Text | undefined;
  private brushLabel: Text | undefined;
  private countLabel: Text | undefined;
  private debugLabel: Text | undefined;
  private pausedLabel: HTMLElement | undefined;
  private buttons: HTMLButtonElement[] = [];

  init(world: World): void {
    this.world = world;
    TSpark.getInstance()
      .inject({
        html: ['ui/powder-overlay/overlay.html'],
        css: ['ui/powder-overlay/overlay.css'],
      })
      .then(() => {
        this.materialLabel = this.createText('#powder-material');
        this.brushLabel = this.createText('#powder-brush');
        this.countLabel = this.createText('#powder-count');
        this.debugLabel = this.createText('#powder-debug');
        this.pausedLabel = document.querySelector('#powder-paused') as HTMLElement | undefined;
        this.buttons = Array.from(document.querySelectorAll('#powder-palette button'));
        this.buttons.forEach((button) => {
          button.addEventListener('click', () => {
            const id = Number(button.dataset.mat);
            this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (result: WorldQueryData<PowderWorldComponent>) => {
              result.component.selectedMaterial = id as MaterialId;
            });
          });
        });
        this.ready = true;
      });
  }

  exec(_deltaTimeMs: number): void {
    if (!this.ready) return;
    this.world.query<PowderWorldComponent>(PowderWorldComponent.name, (result: WorldQueryData<PowderWorldComponent>) => {
      const powder = result.component;
      const def = MATERIALS[powder.selectedMaterial];
      if (this.materialLabel) this.materialLabel.nodeValue = def?.name ?? 'Unknown';
      if (this.brushLabel) this.brushLabel.nodeValue = String(powder.brushRadius);
      if (this.countLabel) this.countLabel.nodeValue = String(powder.particleCount);
      if (this.debugLabel) {
        this.debugLabel.nodeValue = powder.debugMatter ? 'V: cyan = falling' : 'V: show falling pixels';
      }
      if (this.pausedLabel) this.pausedLabel.style.display = powder.paused ? 'inline' : 'none';
      this.buttons.forEach((button) => {
        button.classList.toggle('active', Number(button.dataset.mat) === powder.selectedMaterial);
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
