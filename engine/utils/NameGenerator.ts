const PREFIXES = ["Ara", "Vel", "Kor", "Ilo", "Zar", "Nym", "Eth", "Vor", "Sel", "Wen", "Tar", "Brix", "Dun", "Fex", "Gio"]
const SUFFIXES = ["an", "is", "ox", "el", "ax", "en", "ir", "os", "un", "yx", "al", "em", "or", "ix", "as"]

export function generateName(): string {
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)]
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]
    return prefix + suffix
}