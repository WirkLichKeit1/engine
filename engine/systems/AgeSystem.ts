import { EntityManager } from "../ecs/EntityManager"
import { Identity } from "../components/Identity"

export function ageSystem(em: EntityManager, delta: number): void {
    const creatures = em.getEntitiesWith("Identity", "Position")

    creatures.forEach(id => {
        const identity = em.getComponent<Identity>(id, "Identity")!
        identity.age += delta

        if (identity.age >= identity.maxAge) {
            em.destroyEntity(id)
        }
    })
}