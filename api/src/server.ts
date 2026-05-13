import { WebSocketServer } from "ws"
import { EntityManager } from "../../engine/ecs/EntityManager"
import { GameLoop } from "../../engine/ecs/GameLoop"
import { movementSystem } from "../../engine/systems/MovementSystem"
import { hungerSystem } from "../../engine/systems/HungerSystem"
import { deathSystem } from "../../engine/systems/DeathSystem"
import { foodSystem, fertileRegions } from "../../engine/systems/FoodSystem"
import { decisionSystem } from "../../engine/systems/DecisionSystem"
import { reproductionSystem } from "../../engine/systems/ReproductionSystem"
import { biomeCells } from "../../engine/biomes/BiomeMap"
import { randomPosition } from "../../engine/World"
import { randomDNA } from "../../engine/components/DNA"

const em = new EntityManager()
const loop = new GameLoop(30)
const wss = new WebSocketServer({ port: 8080 })

for (let i = 0; i < 60; i++) {
    const pos = randomPosition()
    const id = em.createEntity()
    em.addComponent(id, "Position", { x: pos.x, y: pos.y })
    em.addComponent(id, "Velocity", { dx: 0, dy: 0 })
    em.addComponent(id, "Energy", { value: 560 })
    em.addComponent(id, "DNA", randomDNA())
}

wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "init", fertileRegions, biomeCells }))
})

console.log("Servidor rodando na porta 8080")

loop.start((delta) => {
    decisionSystem(em, delta)
    movementSystem(em, delta)
    hungerSystem(em, delta)
    deathSystem(em, delta)
    foodSystem(em, delta)
    const reproductionEvents = reproductionSystem(em)

    if (wss.clients.size === 0) return

    const creatures = em.getEntitiesWith("Position", "Energy")
    const food = em.getEntitiesWith("Food", "Position")

    const payload = JSON.stringify({
        type: "state",
        entities: creatures.map(id => {
            const dna = em.getComponent<{ speed: number; visionRadius: number; reproductionThreshold: number }>(id, "DNA")
            return {
                id,
                x: em.getComponent<{ x: number }>(id, "Position")!.x,
                y: em.getComponent<{ y: number }>(id, "Position")!.y,
                energy: em.getComponent<{ value: number }>(id, "Energy")!.value,
                dna: dna ?? null,
            }
        }),
        food: food.map(id => ({
            id,
            x: em.getComponent<{ x: number }>(id, "Position")!.x,
            y: em.getComponent<{ y: number }>(id, "Position")!.y,
        })),
        reproductionEvents,
    })

    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(payload)
        }
    })
})