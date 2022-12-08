import { inspect } from "util"

export namespace LittleScript {
  export abstract class Sentence {
    abstract toSource(): string
  }
  export class LiteralSentence extends Sentence {
    constructor(readonly source: string) {
      super()
    }
    toSource(): string {
      return this.source
    }
  }
  export class AwaitSentence extends Sentence {
    constructor(readonly sentence: CallSentence) {
      super()
    }
    toSource(): string {
      return `await ${this.sentence.toSource()}`
    }
  }
  export class AsyncFunctionSentence extends Sentence {
    constructor(
      readonly functionName: IdentifierSentence,
      readonly args: any[],
      readonly body: ProgramSentence
    ) {
      super()
    }
    toSource(): string {
      return [
        `async function ${this.functionName.toSource()}() {`,
        this.body.toSource({ ident: 2 }),
        "}",
      ].join("\n")
    }
  }
  export class ImportSentence extends Sentence {
    constructor(
      readonly asIdentifier: IdentifierSentence,
      readonly source: string
    ) {
      super()
    }
    toSource(): string {
      return `import * as ${this.asIdentifier.toSource()} from ${inspect(
        this.source
      )}`
    }
  }
  export class ExportSentence extends Sentence {
    constructor(readonly sentence: VariableSentence) {
      super()
    }
    toSource(): string {
      return `export ${this.sentence.toSource()}`
    }
  }
  export class IdentifierSentence extends Sentence {
    constructor(readonly literal: string) {
      super()
    }
    toSource(): string {
      return this.literal
    }
  }
  export class VariableSentence extends Sentence {
    constructor(
      readonly type: "let" | "const",
      readonly variableName: IdentifierSentence,
      readonly assign:
        | AwaitSentence
        | IdentifierSentence
        | MapSentence
        | CallSentence
    ) {
      super()
    }
    toSource(): string {
      return `${
        this.type
      } ${this.variableName.toSource()} = ${this.assign.toSource()}`
    }
  }
  export class MapSentence extends Sentence {
    constructor(
      readonly k: IdentifierSentence,
      readonly v: IdentifierSentence
    ) {
      super()
    }
    toSource(): string {
      return `new Map<${this.k.toSource()}, ${this.v.toSource()}>()`
    }
  }
  export class GetParamSentence extends Sentence {
    constructor(
      readonly parent: IdentifierSentence,
      readonly prop: IdentifierSentence
    ) {
      super()
    }
    toSource(): string {
      return `${this.parent.toSource()}.${this.prop.toSource()}`
    }
  }
  export class ArraySentence extends Sentence {
    constructor(readonly params: (IdentifierSentence | GetParamSentence)[]) {
      super()
    }
    toSource(): string {
      return `[${this.params.map((param) => param.toSource()).join(", ")}]`
    }
  }
  export class CallSentence extends Sentence {
    constructor(
      readonly parent: null | IdentifierSentence | CallSentence,
      readonly method: IdentifierSentence,
      readonly params: (IdentifierSentence | GetParamSentence | ArraySentence)[]
    ) {
      super()
    }
    toSource(): string {
      const p = this.parent
        ? `${this.parent.toSource()}.${this.method.toSource()}`
        : this.method.toSource()

      return `${p}(${this.params.map((param) => param.toSource()).join(", ")})`
    }
  }
  type ProgramSentenceTypesAllow =
    | AwaitSentence
    | AsyncFunctionSentence
    | LiteralSentence
    | VariableSentence
    | ExportSentence
    | ImportSentence
    | MapSentence
    | CallSentence
  export class ProgramSentence extends Sentence {
    constructor(readonly body: ProgramSentenceTypesAllow[] = []) {
      super()
    }
    append(sentence: ProgramSentenceTypesAllow) {
      this.body.push(sentence)
    }
    toSource(opts?: { ident?: number }): string {
      const ident = opts?.ident ?? 0
      const identStr = " ".repeat(ident)
      return this.body.map((item) => `${identStr}${item.toSource()}`).join("\n")
    }
  }
}
