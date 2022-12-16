import { existsSync, PathLike } from "fs"
import { Logger } from "./logger"
import { URLTransformer } from "./url-transformer"

type ExtDef = Record<string, { rewriteExt: string }>

const logger = new Logger("tomts")

export class RequireManager {
  readonly exts: ExtDef = {}

  constructor(readonly baseLocation: URL, options?: { exts?: ExtDef }) {
    this.exts = {
      "": { rewriteExt: '' },
      ".ts": { rewriteExt: '' },
      ".d.ts": { rewriteExt: '' },
      ...options?.exts,
    }
  }

  resolveExpression(pathLike: string): URLTransformer | null {
    for (const [ext, { rewriteExt }] of Object.entries(this.exts)) {
      const location = new URL(`${pathLike}${ext}`, this.baseLocation)
      // const relativePath = new URL(`${pathLike}${rewriteExt}`, this.baseLocation)
      logger.log(`Try find file path ${location}`)
      if (existsSync(location)) {
        logger.log(`Found file path ${location}`)
        const locationSource = new URL(`${pathLike}${rewriteExt}`, this.baseLocation)
        return new URLTransformer(location, locationSource)
      }
    }
    return null
  }
}
