import { EntityManager } from "../ecs/EntityManager"
import { Position } from "../components/Position"
import { Energy } from "../components/Energy"
import { Food } from "../components/Food"
import { WORLD } from "../World"

const FOOD_DETECTION_RADIUS = 40
const MAX_FOOD = 800
const SPAWN_INTERVAL = 0.3
const FERTILE_REGION_COUNT = 12
const FERTILE_RADIUS = 2000
const FERTILE_SPAWN_CHANCE = 0.8

let timeSinceLastSpawn = 0

// regiões férteis geradas uma vez no início
const fertileRagions: { x: number; y: number }[] = Array.from(
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

        foodEntities.forEach(foodId => {
            const food = em.getComponent<Food>(foodId, "Food")!
            if (food.consumed) return

            const foodPos = em.getComponent<Position>(foodId, "Position")!
            const dx = creaturePos.x - foodPos.x
            const dy = creaturePos.y - foodPos.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance <= FOOD_DETECTION_RADIUS) {
                food.consumed = true
                energy.value = Math.min(250, energy.value + food.value)
            }
        })
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
    const region = fertileRagions[Math.floor(Math.random() * fertileRagions.length)]
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * FERTILE_RADIUS

    return {
        x: Math.max(0, Math.min(WORLD.width, region.x + Math.cos(angle) * dist)),
        y: Math.max(0, Math.min(WORLD.height, region.y + Math.cos(angle) * dist))
    }
}

function randomWorldPosition(): { x: number; y: number } {
    return {
        x: Math.random() * WORLD.width,
        y: Math.random() * WORLD.height,
    }
}