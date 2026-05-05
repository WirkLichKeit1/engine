import { EntityManager } from "../ecs/EntityManager"
import { Position } from "../components/Position"
import { Energy } from "../components/Energy"
import { DNA, mixDNA } from "../components/DNA"

const REPRODUCTION_RADIUS = 60
const REPRODUCTION_COST = 50
const MAX_POPULATION = 300
const MIN_POPULATION_THRESHOLD = 15
const ASEXUAL_ENERGY_THRESHOLD = 180

export function reproductionSystem(em: EntityManager): void {
    const creatures = em.getEntitiesWith("Position", "Energy", "DNA")

    if (creatures.length >= MAX_POPULATION) return

    const alreadyReproduced = new Set<number>()
    const lowPopulation = creatures.length < MIN_POPULATION_THRESHOLD

    for (let i = 0; i < creatures.length; i++) {
        const idA = creatures[i]
        if (alreadyReproduced.has(idA)) continue

        const energyA = em.getComponent<Energy>(idA, "Energy")!
        const dnaA = em.getComponent<DNA>(idA, "DNA")!

        if (energyA.value < dnaA.reproductionThreshold) continue

        let reproduced = false

        // tenta reprodução sexual normal
        for (let j = i + 1; j < creatures.length; j++) {
            const idB = creatures[j]
            if (alreadyReproduced.has(idB)) continue

            const energyB = em.getComponent<Energy>(idB, "Energy")!
            const dnaB = em.getComponent<DNA>(idB, "DNA")!

            if (energyB.value < dnaB.reproductionThreshold) continue

            const posA = em.getComponent<Position>(idA, "Position")!
            const posB = em.getComponent<Position>(idB, "Position")!

            const dx = posA.x - posB.x
            const dy = posA.y - posB.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist <= REPRODUCTION_RADIUS) {
                energyA.value -= REPRODUCTION_COST
                energyB.value -= REPRODUCTION_COST

                spawnChild(em, posA, mixDNA(dnaA, dnaB))

                alreadyReproduced.add(idA)
                alreadyReproduced.add(idB)
                reproduced = true
                break
            }
        }

        // fallback assexuado — só ativa com população baixa
        if (!reproduced && lowPopulation && energyA.value >= ASEXUAL_ENERGY_THRESHOLD) {
            const posA = em.getComponent<Position>(idA, "Position")!
            energyA.value -= REPRODUCTION_COST

            const mutatedDNA = mixDNA(dnaA, dnaA) // mistura consigo mesmo — só mutação
            spawnChild(em, posA, mutatedDNA)
            alreadyReproduced.add(idA)
        }
    }
}

function spawnChild(em: EntityManager, pos: Position, dna: DNA): void {
    const id = em.createEntity()
    em.addComponent(id, "Position", {
        x: pos.x + (Math.random() - 0.5) * 20,
        y: pos.y + (Math.random() - 0.5) * 20,
    })
    em.addComponent(id, "Velocity", { dx: 0, dy: 0 })
    em.addComponent(id, "Energy", { value: 100 })
    em.addComponent(id, "DNA", dna)
}