export class EntityManager {
    private nextId: number = 0
    private entities: Set<number> = new Set()
    private components: Map<string, Map<number, unknown>> = new Map()

    createEntity(): number {
        const id = this.nextId++
        this.entities.add(id)
        return id
    }

    destroyEntity(id: number): void {
        this.entities.delete(id)
        this.components.forEach(store => store.delete(id))
    }

    addComponent<T>(id: number, name: string, data: T): void {
        if (!this.components.has(name)) {
            this.components.set(name, new Map())
        }
        this.components.get(name)!.set(id, data)
    }

    getComponent<T>(id: number, name: string): T | undefined {
        return this.components.get(name)?.get(id) as T | undefined
    }

    getEntitiesWith(...names: string[]): number[] {
        return [...this.entities].filter(id => 
            names.every(name => this.components.get(name)?.has(id))
        )
    }
}