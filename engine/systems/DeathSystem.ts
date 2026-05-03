import { EntityManager } from "../ecs/EntityManager"
import { Energy } from "../components/Energy"
import { DeathTimer } from "../components/DeathTimer"

export function deathSystem(em: EntityManager, delta: number): void {
    const creatures = em.getEntitiesWith("Position", "Energy")

    creatures.forEach(id => {
        const energy = em.getComponent<Energy>(id, "Energy")!

        if (energy.value <= 0) {
            if (!em.getComponent<DeathTimer>(id, "DeathTimer")) {
                em.addComponent<DeathTimer>(id, "DeathTimer", {
                    timeWithoutEnergy: 0,
                    deathAfter: 5,
                })
            }

            const timer = em.getComponent<DeathTimer>(id, "DeathTimer")!
            timer.timeWithoutEnergy += delta

            if (timer.timeWithoutEnergy >= timer.deathAfter) {
                em.destroyEntity(id)
            }
        } else {
            if (em.getComponent<DeathTimer>(id, "DeathTimer")) {
                em.addComponent<DeathTimer>(id, "DeathTimer", {
                    timeWithoutEnergy: 0,
                    deathAfter: 5,
                })
            }
        }
    })
}