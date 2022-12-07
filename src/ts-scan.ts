import { argv, cwd } from "process";
import { inspect, parseArgs } from "util";
import * as swc from "@swc/core"
import { Identifier, parseFile } from "@swc/core"
import { objectFilterTree } from "../path-tools";
import { createWriteStream, existsSync } from "fs";
import { basename, dirname, relative } from "path";
import { writeFile } from "fs/promises";

const w = createWriteStream('.log')

const parsed = parseArgs({
    options: {
        class: {
            type: 'string',
            multiple: false,
        },
        out: {
            type: 'string',
            multiple: false
        },
        'init-bootstrap': {
            type: 'boolean',
            multiple: false
        }
    }
})

const classLocation = parsed.values.class;
if (!classLocation) throw new SyntaxError(`Cannot found argument '--class'`)

const outLocationArgument = parsed.values.out;
if (!outLocationArgument) throw new SyntaxError(`Cannot found argument '--out'`)

const classLocationTransform = new URL(classLocation, new URL(`${cwd()}/`, 'file:///'))
const outLocation = new URL(outLocationArgument, new URL(`${cwd()}/`, 'file:///'))

namespace ShortDefinition {
    export type Parameter = {
        module: string
        exportName: string
    };

    export type Class = {
        parameters: Parameter[]
    };

    export type Module = {
        classes: Record<string, Class>
    };
}

type types = swc.ClassDeclaration
type CTX = {}
const defaultCtx = (): CTX => ({})
const eachTreeWithContext = (p: unknown, ctxMutRef: CTX, each: (item: types) => void) => {
    if (typeof p === 'object' && p !== null) {
        if (Object.hasOwn(p, 'type')) {
            w.write(`${inspect(p)}\n`)
        }
        for (const propName of Object.getOwnPropertyNames(p)) {
            const propertyDescriptor = Object.getOwnPropertyDescriptor(p, propName)
            eachTreeWithContext(propertyDescriptor?.value, ctxMutRef, each)
        }
    }
}

type Cache = Map<string, ShortDefinition.Module>
const cacheDefault = (): Cache => new Map<string, ShortDefinition.Module>()

async function asd(location: string, cache: Map<string, ShortDefinition.Module> = cacheDefault()): Promise<Cache> {
    if (cache.has(location)) return cache
    const program = await parseFile(location, { syntax: 'typescript', 'target': 'es2022' })

    const shortModule: ShortDefinition.Module = {
        classes: {}
    }

    const importIdentifiers = new Map<string, ShortDefinition.Parameter>()

    for (const moduleItem of program.body) {
        if (moduleItem.type === 'ImportDeclaration') {
            let module = require.resolve(new URL(moduleItem.source.value, new URL(`${dirname(location)}/`, 'file://')).pathname)
            for (const specifier of moduleItem.specifiers) {
                if (specifier.type === 'ImportSpecifier') {
                    importIdentifiers.set(specifier.local.value, {
                        exportName: specifier.imported?.value ?? specifier.local.value,
                        module,
                    })
                }
                if (specifier.type === 'ImportDefaultSpecifier') {
                    importIdentifiers.set(specifier.local.value, {
                        exportName: 'default',
                        module,
                    })
                }
            }
        }
        if (moduleItem.type === 'ExportDeclaration') {
            const declaration = moduleItem.declaration

            if (declaration.type === "ClassDeclaration") {
                const shortClassName = declaration.identifier.value
                const shortClass: ShortDefinition.Class = {
                    parameters: []
                }
                const itemConstructor = declaration.body.find(item => item.type === 'Constructor') as swc.Constructor | undefined
                if (itemConstructor) {
                    for (const param of itemConstructor.params) {
                        if (param.type === 'TsParameterProperty') {
                            const tsParamProperty = param.param;
                            if (tsParamProperty.type === 'Identifier') {
                                if (tsParamProperty.typeAnnotation) {
                                    const typeAnnotation = tsParamProperty.typeAnnotation.typeAnnotation;
                                    if (typeAnnotation.type == 'TsTypeReference') {
                                        const tsEntityName = typeAnnotation.typeName
                                        if (tsEntityName.type === 'Identifier') {
                                            const parameter = importIdentifiers.get(tsEntityName.value)
                                            if (parameter) {
                                                shortClass.parameters.push(parameter)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                shortModule.classes[shortClassName] = shortClass
            }

        }
    }

    cache.set(location, shortModule)

    for (const [_, parameter] of importIdentifiers) {
        await asd(parameter.module, cache)
    }

    return cache
}

namespace LittleScript {
    export abstract class Sentence {
        abstract toSource(): string
    }
    export class LiteralSentence extends Sentence {
        constructor(readonly source: string) { super() }
        toSource(): string { return this.source }
    }
    export class AwaitSentence extends Sentence {
        constructor(readonly sentence: CallSentence) { super() }
        toSource(): string { return `await ${this.sentence.toSource()}` }
    }
    export class AsyncFunctionSentence extends Sentence {
        constructor(readonly functionName: IdentifierSentence, readonly args: any[], readonly body: ProgramSentence) { super() }
        toSource(): string {
            return [
                `async function ${this.functionName.toSource()}() {`,
                this.body.toSource({ ident: 2 }),
                '}',
            ].join('\n')
        }
    }
    export class ImportSentence extends Sentence {
        constructor(readonly asIdentifier: IdentifierSentence, readonly source: string) { super() }
        toSource(): string {
            return `import * as ${this.asIdentifier.toSource()} from ${inspect(this.source)}`
        }
    }
    export class ExportSentence extends Sentence {
        constructor(readonly sentence: VariableSentence) { super() }
        toSource(): string {
            return `export ${this.sentence.toSource()}`
        }
    }
    export class IdentifierSentence extends Sentence {
        constructor(readonly literal: string) { super() }
        toSource(): string {
            return this.literal
        }
    }
    export class VariableSentence extends Sentence {
        constructor(readonly type: 'let' | 'const', readonly variableName: IdentifierSentence, readonly assign: AwaitSentence | IdentifierSentence | MapSentence | CallSentence) { super() }
        toSource(): string {
            return `${this.type} ${this.variableName.toSource()} = ${this.assign.toSource()}`
        }
    }
    export class MapSentence extends Sentence {
        constructor(readonly k: IdentifierSentence, readonly v: IdentifierSentence) { super() }
        toSource(): string {
            return `new Map<${this.k.toSource()}, ${this.v.toSource()}>()`
        }
    }
    export class GetParamSentence extends Sentence {
        constructor(readonly parent: IdentifierSentence, readonly prop: IdentifierSentence) { super() }
        toSource(): string {
            return `${this.parent.toSource()}.${this.prop.toSource()}`
        }
    }
    export class ArraySentence extends Sentence {
        constructor(readonly params: (IdentifierSentence | GetParamSentence)[]) { super() }
        toSource(): string {
            return `[${this.params.map(param => param.toSource()).join(', ')}]`
        }
    }
    export class CallSentence extends Sentence {
        constructor(readonly parent: null | IdentifierSentence | CallSentence, readonly method: IdentifierSentence, readonly params: (IdentifierSentence | GetParamSentence | ArraySentence)[]) { super() }
        toSource(): string {
            const p = this.parent ? `${this.parent.toSource()}.${this.method.toSource()}` : this.method.toSource()

            return `${p}(${this.params.map(param => param.toSource()).join(', ')})`
        }
    }
    type ProgramSentenceTypesAllow = AwaitSentence | AsyncFunctionSentence | LiteralSentence | VariableSentence | ExportSentence | ImportSentence | MapSentence | CallSentence
    export class ProgramSentence extends Sentence {
        constructor(readonly body: ProgramSentenceTypesAllow[] = []) { super() }
        append(sentence: ProgramSentenceTypesAllow) {
            this.body.push(sentence)
        }
        toSource(opts?: { ident?: number }): string {
            const ident = opts?.ident ?? 0;
            const identStr = ' '.repeat(ident);
            return this.body.map(item => `${identStr}${item.toSource()}`).join('\n')
        }
    }
}

const makeDeepFile = async (outLocation: string, cache: Cache, makeBootstrap: boolean) => {
    const program = new LittleScript.ProgramSentence()
    const deepsIdentifier = new LittleScript.IdentifierSentence('deeps')
    const setIdentifier = new LittleScript.IdentifierSentence('set')

    const importIdentifierNames = new Map<string, LittleScript.IdentifierSentence>()

    const toImportIdentifier = (sourceLocation: string): LittleScript.IdentifierSentence => {
        const importIdentifier = importIdentifierNames.get(sourceLocation)
        if (!importIdentifier) throw new Error(`Cannot found identifier to ${sourceLocation}`)
        return importIdentifier
    }

    const toRelativeSource = (sourceLocation: string) => {
        const _sourceRelativeLocation = relative(dirname(outLocation), sourceLocation)
        const __sourceRelativeLocation = _sourceRelativeLocation.startsWith('/') || _sourceRelativeLocation.startsWith('.') ? _sourceRelativeLocation : `./${_sourceRelativeLocation}`
        const sourceRelativeLocation = __sourceRelativeLocation.endsWith('.ts') ? __sourceRelativeLocation.substring(0, __sourceRelativeLocation.length - 3) : __sourceRelativeLocation

        const sourceBasename = basename(sourceRelativeLocation).replace(/\W/g, '_')

        const eachName = (name: string): string => {
            let iter = 0;
            while (true) {
                if (importIdentifierNames.has(name)) {
                    iter = iter + 1
                    continue
                }
                return iter ? `${name}${iter}` : name
            }
        }

        const keyword = eachName(sourceBasename);

        return { keyword, sourceRelativeLocation };
    }

    // load tomy
    const tomySourceLocation = require.resolve('./tomy')
    const tomyRelativeSource = toRelativeSource(tomySourceLocation)
    const tomyScriptIdentified = new LittleScript.IdentifierSentence(tomyRelativeSource.keyword)
    importIdentifierNames.set(tomySourceLocation, tomyScriptIdentified)

    program.append(new LittleScript.ImportSentence(tomyScriptIdentified, tomyRelativeSource.sourceRelativeLocation))

    for (const [sourceLocation, module] of cache) {
        const { keyword, sourceRelativeLocation } = toRelativeSource(sourceLocation)

        const scriptIdentifier = new LittleScript.IdentifierSentence(keyword);
        importIdentifierNames.set(sourceLocation, scriptIdentifier)

        program.append(new LittleScript.ImportSentence(scriptIdentifier, sourceRelativeLocation))
    }

    program.append(new LittleScript.LiteralSentence(''))

    program.append(
        new LittleScript.VariableSentence(
            'const',
            deepsIdentifier,
            new LittleScript.MapSentence(
                new LittleScript.IdentifierSentence('any'),
                new LittleScript.IdentifierSentence('any[]'),
            )
        )
    )

    program.append(new LittleScript.LiteralSentence(''))

    for (const [sourceLocation, module] of cache) {
        const importIdentifier = toImportIdentifier(sourceLocation)

        for (const [className, { parameters }] of Object.entries(module.classes)) {

            program.append(
                new LittleScript.CallSentence(
                    deepsIdentifier,
                    setIdentifier,
                    [
                        new LittleScript.GetParamSentence(
                            importIdentifier,
                            new LittleScript.IdentifierSentence(className),
                        ),
                        new LittleScript.ArraySentence(
                            parameters.map(parameter => {
                                return new LittleScript.GetParamSentence(
                                    toImportIdentifier(parameter.module),
                                    new LittleScript.IdentifierSentence(parameter.exportName),
                                )
                            })
                        )
                    ]
                )
            )
        }
    }

    program.append(new LittleScript.LiteralSentence(''))

    const ctxIdentifier = new LittleScript.IdentifierSentence('ctx');
    program.append(
        new LittleScript.ExportSentence(
            new LittleScript.VariableSentence(
                'const',
                ctxIdentifier,
                new LittleScript.CallSentence(
                    tomyScriptIdentified,
                    new LittleScript.IdentifierSentence('createContext'),
                    [
                        deepsIdentifier
                    ]
                )
            )
        )
    )

    program.append(new LittleScript.LiteralSentence(''))

    if (makeBootstrap) {

        const inferClassApp = (): { location: string, className: string } | undefined => {
            for (const [location, cacheItem] of cache.entries()) {
                for (const [classRef, ref] of Object.entries(cacheItem.classes)) {
                    if (classRef.toLowerCase() === "app") {
                        return {
                            location,
                            className: classRef,
                        }
                    }
                }
            }
        }

        const c = inferClassApp()
        if (!c) throw new Error('Not posible infer the class App')

        const bootstrapVariableIdentifier = new LittleScript.IdentifierSentence('bootstrap');
        const myAppVariableIdentifier = new LittleScript.IdentifierSentence('myApp');
        const newLocal_1 = new LittleScript.VariableSentence(
            'const',
            myAppVariableIdentifier,
            new LittleScript.AwaitSentence(
                new LittleScript.CallSentence(ctxIdentifier, new LittleScript.IdentifierSentence('factory'), [
                    new LittleScript.GetParamSentence(toImportIdentifier(c.location), new LittleScript.IdentifierSentence(c.className))
                ])
            )
        );



        program.append(new LittleScript.AsyncFunctionSentence(bootstrapVariableIdentifier, [], new LittleScript.ProgramSentence([
            newLocal_1,
            new LittleScript.AwaitSentence(
                new LittleScript.CallSentence(
                    myAppVariableIdentifier,
                    new LittleScript.IdentifierSentence("run"),
                    []
                )
            )
        ])))

        program.append(new LittleScript.LiteralSentence(''))

        program.append(
            new LittleScript.CallSentence(
                new LittleScript.CallSentence(null, bootstrapVariableIdentifier, []),
                new LittleScript.IdentifierSentence('catch'),
                [
                    new LittleScript.GetParamSentence(
                        new LittleScript.IdentifierSentence('console'),
                        new LittleScript.IdentifierSentence('error'),
                    )
                ]
            )
        )

        program.append(new LittleScript.LiteralSentence(''))
    }

    await writeFile(outLocation, program.toSource(), 'utf-8')
}


asd(classLocationTransform.pathname)
    .then(cache => makeDeepFile(outLocation.pathname, cache, parsed.values["init-bootstrap"] ?? false))
