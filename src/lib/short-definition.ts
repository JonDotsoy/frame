import { URLTransformer } from "./url-transformer"

export namespace ShortDefinition {
  export type Parameter = {
    module: URLTransformer
    exportName: string
  }

  export type Class = {
    parameters: Parameter[]
  }

  export type Module = {
    classes: Record<string, Class>
  }
}
