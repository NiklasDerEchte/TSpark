import { MATERIALS, type HarvestGroup } from '../particles/materials';

export type ToolId = 'shovel' | 'drill';

export interface ToolDef {
  id: ToolId;
  name: string;
  harvest: HarvestGroup;
  radius: number;
  hotkey: string;
  swatch: string;
}

export const TOOLS: Record<ToolId, ToolDef> = {
  shovel: {
    id: 'shovel',
    name: 'Schaufel',
    harvest: 'soft',
    radius: 3,
    hotkey: '1',
    swatch: '#c4a35a',
  },
  drill: {
    id: 'drill',
    name: 'Steinbohrer',
    harvest: 'hard',
    radius: 2,
    hotkey: '2',
    swatch: '#8a93a0',
  },
};

export const DEFAULT_HOTBAR: ToolId[] = ['shovel', 'drill'];

export function canHarvest(tool: ToolDef, materialId: number): boolean {
  const def = MATERIALS[materialId];
  if (!def || def.harvest === 'none') return false;
  return def.harvest === tool.harvest;
}
