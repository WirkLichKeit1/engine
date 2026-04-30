import { EntityManager } from "../ecs/EntityManager"
import { Position } from "../components/Position"
import { Velocity } from "../components/Velocity"

export function movementSystem(em: EntityManager, delta: number): void {
    const entities = em.getEntitiesWith("Position", "Velocity")

    entities.forEach(id => {
        const pos = em.getComponent<Position>(id, "Position")!
        const vel = em.getComponent<Velocity>(id, "Velocity")!

        pos.x += vel.dx * delta
        pos.y += vel.dy * delta
    })
}