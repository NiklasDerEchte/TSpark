# Beispiel
- Character System / Input System
- Beispiel Game

# File Imports: 
- Es müssen Blender Scenen oder URDF files eingelesen werden können für den renderer
- FBX, STL, glTF 2.0, URDF
- OBJ -> Texturen Müssen noch getestet werden
- https://people.math.sc.edu/Burkardt/data/obj/obj.html
- https://www.loc.gov/preservation/digital/formats/fdd/fdd000507.shtml

# 3D-Renderer:
- culling - nur die meshes anzeigen die im view sind

# UI-Text Rendern:
- 2D SubRenderer updaten, sodass der Text verfünftig angezeigt wird
- https://webglfundamentals.org/webgl/lessons/webgl-text-glyphs.html
- https://webgl2fundamentals.org/webgl/lessons/webgl-text-html.html
- Ich weiß noch nicht ob Glyph oder SDF gut sind bzw ob eins besser geeignet wäre als das andere

# Referenzen:
- https://medium.com/@lovonmahon/simple-player-input-in-unity-dots-ecs-unity-2019-fa8512e007e2


# Chat
Entity Destruction (Entfernen von Entities):

Warum fehlt? Scene hat createEntity, aber kein destroyEntity. Entities bleiben im Array, auch wenn nicht mehr verwendet – Speicherleck und Inkonsistenzen.
Auswirkung: Wenn eine Entity entfernt wird, bleiben Components in Stores hängen.
Vorschlag: Füge destroyEntity(entity: Entity) in Scene hinzu. Entferne aus entities Array und rufe componentStores.forEach(store => store.remove(entity)) auf, um alle Components zu cleanup.
Automatisches Component Cleanup bei Entity-Entfernung:

Warum fehlt? ComponentStore.remove existiert, aber keine automatische Verknüpfung. Wenn Entity entfernt wird, müssen Components manuell gecleant werden.
Auswirkung: Inkonsistente Daten, wenn Entities vergessen werden.
Vorschlag: Integriere in destroyEntity (siehe oben). Oder füge einen EntityManager hinzu, der Lifecycle verwaltet.
System Execution (Update-Methoden):

Warum fehlt? Systems haben init/destroy, aber kein update(dt) oder fixedUpdate(dt). Wie werden Systems ausgeführt? Wahrscheinlich extern im GameLoop, aber nicht gezeigt.
Auswirkung: Systems sind statisch – keine dynamische Logik pro Frame.
Vorschlag: Erweitere System Interface um update(world: World, dt: number) und fixedUpdate(world: World, dt: number). In World füge updateSystems(dt) hinzu, das alle Systems durchläuft und aufruft. Integriere in GameLoop.
Erweiterte Queries (Filter und Kombinationen):

Warum fehlt? Aktuelle Queries sind einfach (ein Component-Typ). Keine Filter für mehrere Components (z.B. "Entities mit Transform UND Velocity") oder Excludes.
Auswirkung: Bei komplexen Szenen ineffizient, alles manuell filtern.
Vorschlag: Erweitere query um Parameter wie required: string[], excluded: string[]. Nutze Sets für schnelle Checks.
Event System für ECS:

Warum fehlt? Keine Kommunikation zwischen Systems/Components (z.B. "Entity kollidiert" Event).
Auswirkung: Tight Coupling, schwer wartbar.
Vorschlag: Füge EventBus in World hinzu (z.B. mit emit, on). Systems können Events senden/lauschen.
Parent-Child Hierarchien für Entities:

Warum fehlt? Entities sind flach – keine Bäume (z.B. für Transform-Hierarchien in 3D).
Auswirkung: Schwierig für komplexe Objekte (z.B. Roboter mit Teilen).
Vorschlag: Füge parent: Entity | null in Entity-Metadaten hinzu. Erweitere Queries um Hierarchie-Traversal.
Serialization/Deserialization:

Warum fehlt? Kein Speichern/Laden von Worlds/Scenes (z.B. für Saves).
Auswirkung: Kein Persistenz.
Vorschlag: Füge serialize()/deserialize(data) in World/Scene hinzu, nutze JSON für Components/Entities.
Performance-Optimierungen (Archetypes/Chunks):

Warum fehlt? Bei vielen Entities (>1000) sind Maps langsam.
Auswirkung: Skalierungsprobleme.
Vorschlag: Implementiere Archetypes (Gruppen Entities mit gleichen Components) für Cache-Effizienz, aber optional für später.