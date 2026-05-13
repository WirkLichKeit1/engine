import { EntityManager } from "../ecs/EntityManager"
import { Energy } from "../components/Energy"
import { Position } from "../components/Position"
import { getBiomeAt } from "../biomes/BiomeMap"

export type EntityState = "exploring" | "search_food" | "resting"

const BASE_DRAIN = 1.4

export function hungerSystem(em: EntityManager, delta: number): void {
    const entities = em.getEntitiesWith("Energy", "Position")

    entities.forEach(id => {
        const energy = em.getComponent<Energy>(id, "Energy")!
        const pos = em.getComponent<Position>(id, "Position")!
        const biome = getBiomeAt(pos.x, pos.y)

        energy.value -= delta * BASE_DRAIN * biome.energyDrainMultiplier

        if (energy.value < 0) energy.value = 0
    })
}

export function getEntityState(energy: Energy): EntityState {
    if (energy.value < 20) return "resting"
    if (energy.value < 50) return "search_food"
    return "exploring"
}