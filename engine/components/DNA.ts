export interface DNA {
    speed: number
    visionRadius: number
    reproductionThreshold: number
}

export function randomDNA(): DNA {
    return {
        speed: 150 + Math.random() * 150,
        visionRadius: 1500 + Math.random() * 2000,
        reproductionThreshold: 150 + Math.random() * 60
    }
}

export function mixDNA(a: DNA, b: DNA): DNA {
    const mutate = (v: number) => v + (Math.random() - 0.5) * v * 0.1

    return {
        speed: mutate((a.speed + b.speed) / 2),
        visionRadius: mutate((a.visionRadius + b.visionRadius) / 2),
        reproductionThreshold: mutate((a.reproductionThreshold + b.reproductionThreshold) / 2)
    }
}