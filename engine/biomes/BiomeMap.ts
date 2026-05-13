import { WORLD } from "../World"

export type BiomeType = "prairie" | "forest" | "desert" | "swamp"

export interface Biome {
    type: BiomeType
    foodSpawnMultiplier: number   // multiplicador de chance de spawn de comida
    energyDrainMultiplier: number // multiplicador de custo de energia
    speedMultiplier: number       // multiplicador de velocidade
    color: number                 // cor PIXI para o frontend
}

export const BIOMES: Record<BiomeType, Biome> = {
    prairie: {
        type: "prairie",
        foodSpawnMultiplier: 1.0,
        energyDrainMultiplier: 1.0,
        speedMultiplier: 1.0,
        color: 0x2d4a1e,
    },
    forest: {
        type: "forest",
        foodSpawnMultiplier: 1.8,
        energyDrainMultiplier: 0.9,
        speedMultiplier: 0.75,
        color: 0x1a3a0f,
    },
    desert: {
        type: "desert",
        foodSpawnMultiplier: 0.3,
        energyDrainMultiplier: 1.5,
        speedMultiplier: 1.1,
        color: 0x8a6a2a,
    },
    swamp: {
        type: "swamp",
        foodSpawnMultiplier: 1.2,
        energyDrainMultiplier: 1.1,
        speedMultiplier: 0.55,
        color: 0x2a3d2a,
    },
}

const BIOME_TYPES: BiomeType[] = ["prairie", "forest", "desert", "swamp"]
const CELL_COUNT = 24 // número de centros Voronoi
const TRANSITION_RADIUS = 3000 // zona de transição em unidades do mundo

export interface BiomeCell {
    x: number
    y: number
    type: BiomeType
}

// gerado uma vez, fixo pra sempre
export const biomeCells: BiomeCell[] = Array.from({ length: CELL_COUNT }, (_, i) => ({
    x: Math.random() * WORLD.width,
    y: Math.random() * WORLD.height,
    type: BIOME_TYPES[i % BIOME_TYPES.length],
}))

// retorna o bioma dominante numa posição
export function getBiomeAt(x: number, y: number): Biome {
    let nearest = biomeCells[0]
    let nearestDist = Infinity

    for (const cell of biomeCells) {
        const dx = cell.x - x
        const dy = cell.y - y
        const dist = dx * dx + dy * dy
        if (dist < nearestDist) {
            nearestDist = dist
            nearest = cell
        }
    }

    return BIOMES[nearest.type]
}

// retorna multiplicadores interpolados na zona de transição entre biomas
export function getBlendedBiome(x: number, y: number): Biome {
    // calcula distância para todos os centros, ordena pelos 2 mais próximos
    const distances = biomeCells.map(cell => {
        const dx = cell.x - x
        const dy = cell.y - y
        return { cell, dist: Math.sqrt(dx * dx + dy * dy) }
    }).sort((a, b) => a.dist - b.dist)

    const first = distances[0]
    const second = distances[1]

    // fora da zona de transição — bioma puro
    const gap = second.dist - first.dist
    if (gap >= TRANSITION_RADIUS) {
        return BIOMES[first.cell.type]
    }

    // dentro da zona — interpola entre os dois biomas
    const t = gap / TRANSITION_RADIUS // 0 = totalmente primeiro, 1 = totalmente segundo
    const a = BIOMES[first.cell.type]
    const b = BIOMES[second.cell.type]

    return {
        type: first.cell.type,
        foodSpawnMultiplier: lerp(a.foodSpawnMultiplier, b.foodSpawnMultiplier, t),
        energyDrainMultiplier: lerp(a.energyDrainMultiplier, b.energyDrainMultiplier, t),
        speedMultiplier: lerp(a.speedMultiplier, b.speedMultiplier, t),
        color: lerpColor(a.color, b.color, t),
    }
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
}

function lerpColor(a: number, b: number, t: number): number {
    const ar = (a >> 16) & 0xff
    const ag = (a >> 8) & 0xff
    const ab = a & 0xff
    const br = (b >> 16) & 0xff
    const bg = (b >> 8) & 0xff
    const bb = b & 0xff
    return (Math.round(lerp(ar, br, t)) << 16) |
           (Math.round(lerp(ag, bg, t)) << 8) |
           Math.round(lerp(ab, bb, t))
}