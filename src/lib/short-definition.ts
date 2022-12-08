export namespace ShortDefinition {
  export type Parameter = {
    module: string
    exportName: string
  }

  export type Class = {
    parameters: Parameter[]
  }

  export type Module = {
    classes: Record<string, Class>
  }
}
