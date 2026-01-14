import { component2D, component3D, type SceneDefaultComponents } from "../types";

export const defaultComponents: SceneDefaultComponents[] = [
  {
    component: component2D.Velocity,
    key: 'velocity2d',
    options: {},
  },
  {
    component: component2D.Transform,
    key: 'transform2d',
    options: {},
  },
  {
    component: component2D.Sprite,
    key: 'sprite2d',
    options: {},
  },
  {
    component: component2D.Camera,
    key: 'camera2d',
    options: {},
  },
  {
    component: component2D.Triangle,
    key: 'triangle2d',
    options: {},
  },
  {
    component: component3D.Vector3,
    key: component3D.Vector3.name,
    options: {},
  },
  {
    component: component3D.Position3,
    key: component3D.Position3.name,
    options: {},
  },
  {
    component: component3D.Rotation3,
    key: component3D.Rotation3.name,
    options: {},
  },
  {
    component: component3D.Scale3,
    key: component3D.Scale3.name,
    options: {},
  },
  {
    component: component3D.Transform3,
    key: component3D.Transform3.name,
    options: {},
  },
  {
    component: component3D.Velocity3,
    key: component3D.Velocity3.name,
    options: {},
  },
  {
    component: component3D.Camera3,
    key: component3D.Camera3.name,
    options: {},
  },
  {
    component: component3D.Material3,
    key: component3D.Material3.name,
    options: {},
  },
  {
    component: component3D.BaseColor3,
    key: component3D.BaseColor3.name,
    options: {},
  },
  {
    component: component3D.Geometry3,
    key: component3D.Geometry3.name,
    options: {},
  },
  {
    component: component3D.RenderItem3,
    key: component3D.RenderItem3.name,
    options: {},
  },
  {
    component: component3D.Box3,
    key: component3D.Box3.name,
    options: {},
  },
];