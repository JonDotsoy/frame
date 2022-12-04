import { parseFile, ClassDeclaration } from "@swc/core";
import { createWriteStream, writeFileSync } from "fs";
import { EOL } from "os";
import { inspect } from "util";
import {
    objectDeepAt as $,
    objectFindDeepAt as $$,
    objectFilterTree as $$$,
} from "./path-tools";

// const isClassDeclaration = (value: unknown): value is ClassDeclaration => typeof value === "object" && value !== null && $(value, 'type') === 'ClassDeclaration'

// const load = async (location: URL) => {
//     // const module = await parseFile(location.pathname, {
//     //     syntax: "typescript",
//     //     comments: true,
//     // });

//     // // Find name compose to declare use composes
//     // const [nameCompose] = $$(
//     //     module,
//     //     "body",
//     //     (_, obj) =>
//     //         $(obj, "type") === "ImportDeclaration" &&
//     //         $(obj, "source", "value") === "frame",
//     //     "specifiers",
//     //     (_, obj) => $(obj, "type") === "ImportSpecifier",
//     //     "local",
//     //     "value"
//     // );

//     // if (typeof nameCompose !== "string")
//     //     throw new TypeError(`Not use the Compose declaration`);

//     // const variablesCompose = $$$(
//     //     module.body,
//     //     (_, obj) =>
//     //         $(obj, "type") === "VariableDeclarator" &&
//     //         $(obj, "id", "typeAnnotation", "typeAnnotation", "typeName", "value") ===
//     //         nameCompose &&
//     //         $(obj, "init") === null
//     // );

//     // const classToInjects = $$$<ClassDeclaration>(
//     //     module.body,
//     //     (_, obj) => isClassDeclaration(obj)
//     // );

//     // const c = classToInjects.map(e => [e.identifier.value, e] as const)

//     // const nextVars = variablesCompose()

//     // console.log()

//     // console.log(c)
//     // log.write(inspect(variablesCompose, { depth: null }))
//     // log.write(inspect(nameCompose, { depth: null }))
//     // log.write(EOL);
//     // log.write(inspect(module, { depth: null }))

//     // await new Promise((resolve) => log.end(resolve));
// };

// load(new URL(`${__dirname}/sample/app.frame.ts`, "file:///"))
