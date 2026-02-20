# Core Concepts

TSpark basiert auf einer **Entity-Component-System (ECS)** Architektur, die eine saubere Trennung von Daten und Logik ermöglicht.

## Was ist ECS?

ECS ist ein Architekturmuster, das in der Spieleentwicklung weit verbreitet ist:

- **Entities** sind eindeutige Identifikatoren für Spielobjekte
- **Components** sind Datencontainer, die Entities zugeordnet werden
- **Systems** sind Logikprozessoren, die auf Entities mit bestimmten Components arbeiten

## Architektur-Übersicht

```
TSpark
  └── World(s)
       ├── Scene(s)
       │    ├── Entity
       │    │    └── Component(s)
       │    └── ComponentStore
       └── System(s)
```

### TSpark

Die Hauptklasse, die das gesamte Framework initialisiert und verwaltet:

- Verwaltet den Game Loop
- Koordiniert das Rendering
- Verwaltet Worlds

### World

Ein Top-Level-Container für Spiellogik:

- Kann mehrere **Scenes** enthalten
- Verwaltet **Systems**
- Führt Queries über alle aktiven Scenes aus

```typescript
const world = tspark.createWorld('MyWorld');
```

### Scene

Eine Sammlung von Entities innerhalb einer World:

- Enthält **Entities** und ihre **Components**
- Verwaltet **ComponentStores**
- Kann aktiviert/deaktiviert werden

```typescript
const scene = world.createScene('MyScene');
```

### Entity

Ein eindeutiger Identifier (String) für ein Spielobjekt:

- Hat selbst keine Daten oder Logik
- Wird verwendet, um Components zu gruppieren

```typescript
const entity = scene.createEntity();
```

### Component

Ein Datencontainer, der einer Entity zugeordnet wird:

- Enthält nur Daten, keine Logik
- Wird in ComponentStores gespeichert
- Beispiele: `Position3`, `Rotation3`, `Camera3`, `Box3`

```typescript
const position = new component3D.Position3({ x: 0, y: 0, z: 5 });
scene.getComponentStore<component3D.Position3>(component3D.Position3.name)
  .add(entity, position);
```

### System

Eine Logikeinheit, die auf Entities mit bestimmten Components arbeitet:

- Implementiert das `System` Interface
- Hat Zugriff auf die gesamte World
- Wird jeden Frame oder in festen Zeitintervallen aufgerufen

```typescript
export interface System {
  init(world: World): void;
  exec(deltaTimeMs: number): void;
  destroy(): void;
}
```

Beispiel:

```typescript
class RotationSystem implements System {
  world!: World;
  
  init(world: World): void {
    this.world = world;
  }
  
  exec(deltaTimeMs: number): void {
    this.world.query<RotationComponent>('Rotation', ({ entity, component }) => {
      component.angle += component.speed * deltaTimeMs;
    });
  }
  
  destroy(): void {}
}
```

## Datenfluss

1. **Initialization**: TSpark → World → Scene → Entities + Components
2. **Game Loop**: 
   - Fixed Update: Systems werden in festen Zeitintervallen aufgerufen
   - Update: Systems werden jeden Frame aufgerufen
   - Draw: Renderer zeichnet alle Worlds
3. **Queries**: Systems fragen Components über die World ab

## Vorteile von ECS

- **Modularität**: Components und Systems sind wiederverwendbar
- **Flexibilität**: Entities können zur Laufzeit verändert werden
- **Performance**: Cache-freundliche Datenstruktur
- **Testbarkeit**: Logik ist von Daten getrennt
- **Skalierbarkeit**: Neue Features können einfach als Systems hinzugefügt werden

## Nächste Schritte

- [World & Scenes](/guide/world-and-scenes) - Detaillierte Informationen
- [Entities & Components](/guide/entities-and-components) - Component-Entwicklung
- [Systems](/guide/systems) - System-Entwicklung
