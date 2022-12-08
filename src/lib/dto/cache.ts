import { ShortDefinition } from "../short-definition"

export type Cache = Map<string, ShortDefinition.Module>
export const cacheDefault = (): Cache =>
  new Map<string, ShortDefinition.Module>()
