import { WebSocketServer } from "ws"
import { EntityManager } from "../../engine/ecs/EntityManager"
import { GameLoop } from "../../engine/ecs/GameLoop"
import { movementSystem } from "../../engine/systems/MovementSystem"
import { hungerSystem } from "../../engine/systems/HungerSystem"
import { deathSystem } from "../../engine/systems/DeathSystem"
import { foodSystem } from "../../engine/systems/FoodSystem"
import { decisionSystem } from "../../engine/systems/DecisionSystem"
import { reproductionSystem } from "../../engine/systems/ReproductionSystem"
import { randomPosition } from "../../engine/World"
import { randomDNA } from "../../engine/components/DNA"

const em = new EntityManager()
const loop = new GameLoop(30)
const wss = new WebSocketServer({ port: 8080 })

for (let i = 0; i < 10; i++) {
    const pos = randomPosition()
    const id = em.createEntity()
    em.addComponent(id, "Position", { x: pos.x, y: pos.y })
    em.addComponent(id, "Velocity", { dx: 0, dy: 0 })
    em.addComponent(id, "Energy", { value: 250 })
    em.addComponent(id, "DNA", randomDNA())
}

console.log("Servidor rodando na porta 8080")

loop.start((delta) => {
    decisionSystem(em, delta)
    movementSystem(em, delta)
    hungerSystem(em, delta)
    deathSystem(em, delta)
    foodSystem(em, delta)
    reproductionSystem(em)

    if (wss.clients.size === 0) return

    const creatures = em.getEntitiesWith("Position", "Energy")
    const food = em.getEntitiesWith("Food", "Position")

    const payload = JSON.stringify({
        entities: creatures.map(id => ({
            id,
            x: em.getComponent<{ x: number }>(id, "Position")!.x,
            y: em.getComponent<{ y: number }>(id, "Position")!.y,
            energy: em.getComponent<{ value: number }>(id, "Energy")!.value,
        })),
        food: food.map(id => ({
            id,
            x: em.getComponent<{ x: number }>(id, "Position")!.x,
            y: em.getComponent<{ y: number }>(id, "Position")!.y,
        })),
    })

    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(payload)
        }
    })
})