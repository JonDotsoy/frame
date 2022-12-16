import { Context } from "./Context"

export const createContext = (deeps: Map<any, any[]>) => {
  return new Context(deeps)
}
