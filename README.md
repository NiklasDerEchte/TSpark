# TSpark Engine

TSpark ist eine leichtgewichtige und modulare 2D- und 3D-Game-Engine, die mit TypeScript geschrieben wurde und auf WebGL (über TWGL.js) für das Rendering setzt. Sie folgt einem Entity-Component-System (ECS)-Ansatz, um die Spielelogik flexibel und erweiterbar zu gestalten.

## ✨ Features

- **ECS-Architektur:** Organisieren Sie Ihre Spielobjekte sauber mit Entitäten, Komponenten und Systemen.
- **2D- & 3D-Rendering:** Basiert auf `TWGL.js`, einem schlanken WebGL-Helfer, für performantes Rendering.
- **Modulare Systeme:** Fügen Sie Logik wie Bewegung, Physik oder KI durch eigenständige Systeme hinzu.
- **Einfache Szenenverwaltung:** Erstellen und verwalten Sie mehrere Welten und Szenen.
- **Flexibles Komponenten-System:** Definieren Sie eigene Daten-Container für Ihre Entitäten.

## 🚀 Getting Started

1.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    ```

2.  **Entwicklungsserver starten:**
    ```bash
    npm run tspark:dev
    ```
    Dies startet einen Vite-Server, der die Beispiele unter `src/examples` bereitstellt.

## 🎬 Demo

Hier ist eine kurze Demonstration des Stress-Tests, der mehrere hundert Würfel gleichzeitig rendert und rotiert.

![TSpark Stress Test](docs/res/stress-test-17_1.gif)

![TSpark Stress Test](docs/res/editor-space_23_1.gif)

