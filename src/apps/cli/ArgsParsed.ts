import { parsed } from "./parsed"

export class ArgsParsed {
  parsed = parsed

  positional(index: number): string | undefined {
    return parsed.positionals[index]
  }

  assetPositional(index: number, message: string): string {
    const positional = this.positional(index)
    if (!positional) throw new Error(message)
    return positional
  }
}
