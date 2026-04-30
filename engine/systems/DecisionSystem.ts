import { EntityManager } from "../ecs/EntityManager"
import { Position } from "../components/Position"
import { Velocity } from "../components/Velocity"
import { Energy } from "../components/Energy"
import { Food } from "../components/Food"
import { WORLD } from "../World"

const SPEED = 120
const VISION_RADIUS = 600

export function decisionSystem(em: EntityManager, delta: number): void {
    const creatures = em.getEntitiesWith("Position", "Velocity", "Energy")

    creatures.forEach(id => {
        const pos = em.getComponent<Position>(id, "Position")!
        const vel = em.getComponent<Velocity>(id, "Velocity")!
        const energy = em.getComponent<Energy>(id, "Energy")!

        bounceOffWalls(vel, pos)

        if (energy.value <= 0) {
            vel.dx = 0
            vel.dy = 0
            return
        }

        if (energy.value < 150) {
            const nearestFood = findNearestFood(em, pos)
            if (nearestFood) {
                moveTowards(vel, pos, nearestFood, SPEED)
                return
            }
        }

        wander(vel, delta, SPEED)
    })
}

function findNearestFood(em: EntityManager, pos: Position): Position | null {
    const foodEntities = em.getEntitiesWith("Food", "Position")
    let nearest: Position | null = null
    let nearestDist = VISION_RADIUS

    foodEntities.forEach(foodId => {
        const food = em.getComponent<Food>(foodId, "Food")!
        if (food.consumed) return

        const foodPos = em.getComponent<Position>(foodId, "Position")!
        const dx = foodPos.x - pos.x
        const dy = foodPos.y - pos.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < nearestDist) {
            nearestDist = dist
            nearest = foodPos
        }
    })

    return nearest
}

function moveTowards(vel: Velocity, pos: Position, target: Position, speed: number): void {
    const dx = target.x - pos.x
    const dy = target.y - pos.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist === 0) return
    vel.dx = (dx / dist) * speed
    vel.dy = (dy / dist) * speed
}

function wander(vel: Velocity, delta: number, speed: number): void {
    if (Math.random() < delta * 0.8) {
        const angle = Math.random() * Math.PI * 2
        vel.dx = Math.cos(angle) * speed
        vel.dy = Math.sin(angle) * speed
    }
}

function bounceOffWalls(vel: Velocity, pos: Position): void {
    if (pos.x <= 0) { pos.x = 0; vel.dx = Math.abs(vel.dx) }
    if (pos.x >= WORLD.width) { pos.x = WORLD.width; vel.dx = -Math.abs(vel.dx) }
    if (pos.y <= 0) { pos.y = 0; vel.dy = Math.abs(vel.dy) }
    if (pos.y >= WORLD.height) { pos.y = WORLD.height; vel.dy = -Math.abs(vel.dy) }
}