export class GameLoop {
    private tickRate: number
    private lastTime: number = Date.now()
    private running: boolean = false

    constructor(tickRate: number = 30) {
        this.tickRate = tickRate
    }

    start(update: (delta: number) => void): void {
        this.running = true

        setInterval(() => {
            if (!this.running) return

            const now = Date.now()
            const delta = (now - this.lastTime) / 1000
            this.lastTime = now

            update(delta)
        }, 1000 / this.tickRate)
    }

    stop(): void {
        this.running = false
    }
}