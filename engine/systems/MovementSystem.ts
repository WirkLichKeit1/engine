import { EntityManager } from "../ecs/EntityManager"
import { Position } from "../components/Position"
import { Velocity } from "../components/Velocity"
import { getBiomeAt } from "../biomes/BiomeMap"

export function movementSystem(em: EntityManager, delta: number): void {
    const entities = em.getEntitiesWith("Position", "Velocity")

    entities.forEach(id => {
        const pos = em.getComponent<Position>(id, "Position")!
        const vel = em.getComponent<Velocity>(id, "Velocity")!
        const biome = getBiomeAt(pos.x, pos.y)

        pos.x += vel.dx * biome.speedMultiplier * delta
        pos.y += vel.dy * biome.speedMultiplier * delta
    })
}