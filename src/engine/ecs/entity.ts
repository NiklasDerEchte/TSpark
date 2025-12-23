export type Entity = number;

let nextEntity = 0;

export function createEntity(): Entity {
    return nextEntity++;
}
