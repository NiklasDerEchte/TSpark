import { TSpark } from '../../../app';
import { assignProps, component3D, type Component, type Properties, type System, type World, type WorldQueryData } from '../..';

export class XYZOverlayComponent implements Component<{ xyz: component3D.Vector3; label: string }> {
  label: string = "N/A";
  xyz: component3D.Vector3 = new component3D.Vector3();
  constructor(props?: Properties<XYZOverlayComponent>) {
    assignProps(this, props);
  }
}

export class XYZOverlaySystem implements System {
  private x: Text | undefined;
  private y: Text | undefined;
  private z: Text | undefined;
  private label: Text | undefined;
  private ready: boolean = false;
  world!: World;
  init(world: World): void {
    this.world = world;
    TSpark.getInstance()
      .inject({
        html: ['ui/xyz-overlay/overlay.html'],
        css: ['ui/xyz-overlay/overlay.css'],
      })
      .then(() => {
        this.x = this.createTextNode('#x');
        this.y = this.createTextNode('#y');
        this.z = this.createTextNode('#z');
        this.label = this.createTextNode('#label');
        this.ready = true;
      });
  }

  createTextNode(id: string): Text {
    let element = document.querySelector(id);
    let textNode = document.createTextNode('');
    element?.appendChild(textNode);
    return textNode;
  }

  exec(dt: number) {
    if(this.ready) {
      this.world.query<XYZOverlayComponent>(XYZOverlayComponent.name, (result: WorldQueryData<XYZOverlayComponent>) => {
        if(this.x) {
          this.x.nodeValue = result.component.xyz.x.toFixed(0);
        }
        if (this.y) {
          this.y.nodeValue = result.component.xyz.y.toFixed(0);
        }
        if (this.z) {
          this.z.nodeValue = result.component.xyz.z.toFixed(0);
        }
        if (this.label) {
          this.label.nodeValue = result.component.label.toString();
        }
      });
    }
  }

  destroy(): void {}
}
