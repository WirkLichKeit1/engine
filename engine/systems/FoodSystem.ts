import { EntityManager } from "../ecs/EntityManager"
import { Position } from "../components/Position"
import { Energy } from "../components/Energy"
import { Food } from "../components/Food"
import { WORLD } from "../World"

const FOOD_DETECTION_RADIUS = 120
const MAX_FOOD = 2000
const SPAWN_INTERVAL = 0.2
const FERTILE_REGION_COUNT = 12
const FERTILE_RADIUS = 4000
const FERTILE_SPAWN_CHANCE = 0.8

let timeSinceLastSpawn = 0

// regiões férteis geradas uma vez no início
export const fertileRegions: { x: number; y: number }[] = Array.from(
    { length: FERTILE_REGION_COUNT },
    () => ({
        x: Math.random() * WORLD.width,
        y: Math.random() * WORLD.height,
    })
)

export function foodSystem(em: EntityManager, delta: number): void {
    timeSinceLastSpawn += delta

    const foodEntities = em.getEntitiesWith("Food", "Position")

    if (timeSinceLastSpawn >= SPAWN_INTERVAL && foodEntities.length < MAX_FOOD) {
        spawnFood(em)
        timeSinceLastSpawn = 0
    }

    const creatures = em.getEntitiesWith("Position", "Energy")

    creatures.forEach(creatureId => {
        const creaturePos = em.getComponent<Position>(creatureId, "Position")!
        const energy = em.getComponent<Energy>(creatureId, "Energy")!

        for (const foodId of foodEntities) {
            const food = em.getComponent<Food>(foodId, "Food")!
            if (food.consumed) continue

            const foodPos = em.getComponent<Position>(foodId, "Position")!
            const dx = creaturePos.x - foodPos.x
            const dy = creaturePos.y - foodPos.y

            if (dx * dx + dy * dy <= FOOD_DETECTION_RADIUS * FOOD_DETECTION_RADIUS) {
                food.consumed = true
                energy.value = Math.min(250, energy.value + food.value)
                break
            }
        }
    })

    foodEntities.forEach(foodId => {
        const food = em.getComponent<Food>(foodId, "Food")!
        if (food.consumed) em.destroyEntity(foodId)
    })
}

function spawnFood(em: EntityManager): void {
    const pos = Math.random() < FERTILE_SPAWN_CHANCE
        ? spawnNearFertileRegion()
        : randomWorldPosition()
    
    const foodId = em.createEntity()
    em.addComponent(foodId, "Position", pos)
    em.addComponent<Food>(foodId, "Food", { value: 40, consumed: false })
}

function spawnNearFertileRegion(): { x: number; y: number } {
    const region = fertileRegions[Math.floor(Math.random() * fertileRegions.length)]
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * FERTILE_RADIUS

    return {
        x: Math.max(0, Math.min(WORLD.width, region.x + Math.cos(angle) * dist)),
        y: Math.max(0, Math.min(WORLD.height, region.y + Math.sin(angle) * dist))
    }
}

function randomWorldPosition(): { x: number; y: number } {
    return {
        x: Math.random() * WORLD.width,
        y: Math.random() * WORLD.height,
    }
}