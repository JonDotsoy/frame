import { Context } from "./Context";

export const refCurrentContext: { current: null | Context } = { current: null }

export const getCurrentContext = (): Context => {
  const ctx = refCurrentContext.current
  if (!ctx) {
    throw new Error(`Cannot found context`)
  }
  return ctx
}
