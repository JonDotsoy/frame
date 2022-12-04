import { objectFilterTree as $$$, objectDeepAt as $ } from "./path-tools"
import { ExportDeclaration, ExportDefaultExpression, ImportDeclaration, ImportSpecifier, parseFile, Program, Span } from "@swc/core"
import * as  a from "stacktrace-js"
import { createRequire } from "node:module"
import { inspect, InspectOptions } from "node:util"
import * as path from "node:path"
import { cwd } from "node:process"
import { mkdir, writeFile } from "node:fs/promises"

const consoleInspect = (arg: any, options?: InspectOptions) => console.log(inspect(arg, { depth: Infinity, ...options }))

type SpecifierDef = [name: string, localName?: string]

interface ImportDef {
    sourceLocation: string
    specifiers: SpecifierDef[],
}

interface ProgramDef {
    imports: Set<ImportDef>
    exports: Set<SpecifierDef>
}

interface CollectIndexed {
    loaded: Map<string, ProgramDef>
}

const createMinimalProgramSpecifier = async (fileLocation: string): Promise<ProgramDef> => {
    const require = createRequire(fileLocation)
    const module = await parseFile(fileLocation, { syntax: 'typescript', target: 'es2022' })

    const importSpecifiersToSpecifierDef = (sourceLocation: string) => (importSpecifier: ImportSpecifier): SpecifierDef => {
        if (importSpecifier.type === 'ImportSpecifier' && importSpecifier.imported) {
            return [importSpecifier.imported.value, importSpecifier.local.value]
        }
        return [importSpecifier.local.value]
    }

    const importDeclarationToImportDef = (importDeclaration: ImportDeclaration): ImportDef => {
        const sourceLocation = require.resolve(importDeclaration.source.value)
        return {
            sourceLocation,
            specifiers: importDeclaration.specifiers.map(importSpecifiersToSpecifierDef(sourceLocation)),
        }
    }

    const importDeclarations = new Set($$$<ImportDeclaration>(module.body, (_, obj) => $(obj, 'type') === 'ImportDeclaration').map(importDeclarationToImportDef))

    const exports = new Set<SpecifierDef>()

    for (const exportDefaultExpression of $$$<ExportDefaultExpression>(module.body, (_, o) => $(o, 'type') === 'ExportDefaultExpression')) {
        exports.add(['default'])
    }

    for (const exportDeclaration of $$$<ExportDeclaration>(module.body, (_, o) => $(o, 'type') === 'ExportDeclaration')) {
        const declaration = exportDeclaration.declaration;
        if (declaration.type === 'ClassDeclaration' || declaration.type === 'FunctionDeclaration') {
            exports.add([declaration.identifier.value])
        }
        if (declaration.type === 'VariableDeclaration') {
            for (const variableDeclaration of declaration.declarations) {
                const id = variableDeclaration.id
                if (id.type === 'Identifier') {
                    exports.add([id.value])
                }
            }
        }
    }

    return {
        imports: importDeclarations,
        exports,
    }
}

namespace LiteJsSys {
    export abstract class JsSys {
        abstract toSource(): string
    }
    export class Comment extends JsSys {
        constructor(readonly message: string) { super() }
        toSource(): string {
            return `// ${this.message}\n`
        }
    }
    export class NewLine extends JsSys {
        toSource(): string {
            return '\n'
        }
    }
    export class Import extends JsSys {
        constructor(readonly sourceLocation: string, readonly name: string) { super() }
        toSource() {
            return `import * as ${this.name} from ${inspect(this.sourceLocation)}\n`
        }
    }
    export class MapExpression extends JsSys {
        constructor(readonly k: string = 'any', readonly v: string = 'any') { super() }
        toSource() {
            return `new Map<${this.k}, ${this.v}>()`
        }
    }
    export class ConstExpression extends JsSys {
        constructor(readonly name: string, readonly expression: JsSys) { super() }
        toSource() {
            return `const ${this.name} = ${this.expression.toSource()}`
        }
    }
    export class Export extends JsSys {
        constructor(readonly expression: JsSys) { super() }
        toSource() {
            return `export ${this.expression.toSource()};\n`
        }
    }
    export class Program extends JsSys {
        _body: JsSys[] = []
        imports = new Map<string, Import>()
        constructor(readonly filename: string) { super() }
        appendImport(importExpression: Import) {
            this.imports.set(importExpression.name, importExpression)
        }
        append(expression: JsSys) {
            this._body.push(expression)
        }
        get body() {
            return [
                ...Array.from(this.imports.values()),
                new NewLine(),
                new NewLine(),
                ...this._body,
            ]
        }
        toSource() {
            const sourceLines: string[] = [];

            for (const line of this.body) {
                sourceLines.push(line.toSource())
            }

            return sourceLines.join('')
        }
    }
}

const collectIndexedToProgram = async (collectIndexed: CollectIndexed, options: { cwd: string }) => {
    const dirOut = new URL(`${options.cwd}/.frame/`, 'file://');
    const filProgramOut = new URL('app.ts', dirOut)
    const program = new LiteJsSys.Program(filProgramOut.pathname);

    const loadedDefExports: [name: string][] = []

    for (const [programLocation, programDef] of collectIndexed.loaded.entries()) {
        const { keywordName, relative } = newFunction(filProgramOut.pathname, programLocation)
        program.appendImport(new LiteJsSys.Import(relative, keywordName))
    }

    program.append(new LiteJsSys.Export(new LiteJsSys.ConstExpression("m", new LiteJsSys.MapExpression())))

    program.append(new LiteJsSys.NewLine())

    collectIndexed.loaded.forEach(loadedDef => {
        loadedDef.exports.forEach(exportDef => {
            program.append(
                new LiteJsSys.Comment(exportDef[0])
            )
            // program.appendImport(importDef.sourceLocation, importDef.specifiers)
        })
    })

    return program
}

export default 1;

export class A { }

export const [x] = [1];

export const compose = async <T>(ctrl: T) => {
    const [, selfLocationStackFrame, originLocationStackFrame] = a.getSync()
    const selfLocation = selfLocationStackFrame.getFileName()
    const originLocation = originLocationStackFrame.getFileName()
    const cwd = path.dirname(originLocation)

    const selfProgramSpecifier = await createMinimalProgramSpecifier(selfLocation)

    const collectIndexed: CollectIndexed = {
        // exports: new Set(),
        loaded: new Map<string, ProgramDef>([
            [selfLocation, selfProgramSpecifier]
        ])
    }

    const eachFrom = async (location: string): Promise<void> => {
        if (collectIndexed.loaded.has(location)) return
        const programSpecifier = await createMinimalProgramSpecifier(location)
        collectIndexed.loaded.set(location, programSpecifier)
        for (const i of programSpecifier.imports) {
            await eachFrom(i.sourceLocation)
        }
    }

    await eachFrom(originLocation)

    const program = await collectIndexedToProgram(collectIndexed, { cwd })
    // consoleInspect(collectIndexed)
    await mkdir(path.dirname(program.filename), { recursive: true })
    await writeFile(program.filename, program.toSource())

    consoleInspect(require(program.filename))
}

function newFunction(filProgramOut: string, programLocation: string) {
    const a = () => {
        const newLocal = path.relative(path.dirname(filProgramOut), programLocation)
        if (newLocal.endsWith('.ts') || newLocal.endsWith('.js'))
            return newLocal.substring(0, newLocal.length - 3)
        if (newLocal.endsWith('.tsx') || newLocal.endsWith('.jsx'))
            return newLocal.substring(0, newLocal.length - 4)
        return newLocal
    }

    const relative = programLocation.startsWith('/')
        ? a()
        : programLocation

    const keywordName = relative.replace(/\W/g, '_')

    return { relative, keywordName }
}

