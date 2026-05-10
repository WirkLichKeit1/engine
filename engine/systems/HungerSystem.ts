import { EntityManager } from "../ecs/EntityManager"
import { Energy } from "../components/Energy"

export type EntityState = "exploring" | "search_food" | "resting"

export function hungerSystem(em: EntityManager, delta: number): void {
    const entities = em.getEntitiesWith("Energy")

    entities.forEach(id => {
        const energy = em.getComponent<Energy>(id, "Energy")!

        energy.value -= delta * 1.4

        if (energy.value < 0) energy.value = 0
    })
}

export function getEntityState(energy: Energy): EntityState {
    if (energy.value < 20) return "resting"
    if (energy.value < 50) return "search_food"
    return "exploring"
}