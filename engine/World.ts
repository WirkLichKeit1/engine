export const WORLD = {
    width: 25600,
    height: 19200,
} as const

export function clampToWorld(x: number, y: number): { x: number, y: number } {
    return {
        x: Math.max(0, Math.min(WORLD.width, x)),
        y: Math.max(0, Math.min(WORLD.height, y)),
    }
}

export function randomPosition(): { x: number, y: number } {
    return {
        x: Math.random() * WORLD.width,
        y: Math.random() * WORLD.height,
    }
}