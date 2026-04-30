import { EntityManager } from "../ecs/EntityManager"
import { Position } from "../components/Position"
import { Energy } from "../components/Energy"
import { Food } from "../components/Food"
import { randomPosition } from "../World"

const FOOD_DETECTION_RADIUS = 20
const MAX_FOOD = 80
const SPAWN_INTERVAL = 3
let timeSinceLastSpawn = 0

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
                energy.value = Math.min(100, energy.value + food.value)
            }
        })
    })

    foodEntities.forEach(foodId => {
        const food = em.getComponent<Food>(foodId, "Food")!
        if (food.consumed) {
            em.destroyEntity(foodId)
        }
    })
}

function spawnFood(em: EntityManager): void {
    const pos = randomPosition()
    const foodId = em.createEntity()
    em.addComponent(foodId, "Position", { x: pos.x, y: pos.y })
    em.addComponent<Food>(foodId, "Food", { value: 30, consumed: false })
}