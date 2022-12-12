import { existsSync, PathLike } from "fs"
import { Logger } from "./logger"

const logger = new Logger("tomts")

export class RequireManager {
  readonly exts: `.${string}`[] = []

  constructor(readonly baseLocation: URL, options?: { exts?: `.${string}`[] }) {
    this.exts = options?.exts ?? [".ts"]
  }

  resolve(pathLike: URL): URL {
    for (const ext of ["", ...this.exts]) {
      const proposalPath = new URL(`${pathLike}${ext}`, this.baseLocation)
      logger.log(`Find file path ${proposalPath}`)
      if (existsSync(proposalPath)) return proposalPath
    }
    throw new Error(`Cannot resolve path to ${pathLike}`)
  }
}
