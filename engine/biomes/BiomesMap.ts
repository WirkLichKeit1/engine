import { WORLD } from "../World"

export type BiomeType = "prairie" | "forest" | "desert" | "swamp"

export interface Biome {
    type: BiomeType
    foodSpawnMultiplier: number   // multiplicador de chance de spawn de comida
    energyDrainMultiplier: number // multiplicador de custo de energia
    speedMultiplier: number       // multiplicador de velocidade
    color: number                 // cor PIXI para o frontend
}