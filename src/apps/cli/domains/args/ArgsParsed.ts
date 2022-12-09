import { globalArgsParsed } from "../../lib/globalArgsParsed/globalArgsParsed"

export class ArgsParsed {
  parsed = globalArgsParsed

  positional(index: number): string | undefined {
    return globalArgsParsed.positionals[index]
  }

  assetPositional(index: number, message: string): string {
    const positional = this.positional(index)
    if (!positional) throw new Error(message)
    return positional
  }
}
