import { EntityManager } from "./ecs/EntityManager"
import { GameLoop } from "./ecs/GameLoop"
import { movementSystem } from "./systems/MovementSystem"
import { hungerSystem, getEntityState } from "./systems/HungerSystem"
import { foodSystem } from "./systems/FoodSystem"
import { decisionSystem } from "./systems/DecisionSystem"
import { randomPosition } from "./World"

const em = new EntityManager()
const loop = new GameLoop(30)

for (let i = 0; i < 10; i++) {
    const pos = randomPosition()
    const id = em.createEntity()
    em.addComponent(id, "Position", { x: pos.x, y: pos.y })
    em.addComponent(id, "Velocity", { dx: 0, dy: 0 })
    em.addComponent(id, "Energy", { value: 250 })
}

let tick = 0

loop.start((delta) => {
    decisionSystem(em, delta)
    movementSystem(em, delta)
    hungerSystem(em, delta)
    foodSystem(em, delta)

    tick++
    if (tick % 90 === 0) {
        const creatures = em.getEntitiesWith("Position", "Energy")
        const food = em.getEntitiesWith("Food")
        const avgEnergy = creatures.reduce((sum, id) => {
            const e = em.getComponent<{ value: number }>(id, "Energy")!
            return sum + e.value
        }, 0) / creatures.length

        console.log(
            `criaturas: ${creatures.length} | comida: ${food.length} | energia média: ${avgEnergy.toFixed(1)} | estado: ${getEntityState({ value: avgEnergy })}`
        )
    }
})