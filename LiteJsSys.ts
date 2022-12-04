import { inspect } from "node:util";

export namespace LiteJsSys {
    export abstract class JsSys {
        abstract toSource(): string;
    }
    export class Comment extends JsSys {
        constructor(readonly message: string) { super(); }
        toSource(): string {
            return `// ${this.message}\n`;
        }
    }
    export class Literal extends JsSys {
        constructor(readonly source: string) { super(); }
        toSource(): string {
            return `${this.source}\n`;
        }
    }
    export class NewLine extends JsSys {
        toSource(): string {
            return '\n';
        }
    }
    export class Import extends JsSys {
        constructor(readonly sourceLocation: string, readonly name: string) { super(); }
        toSource() {
            return `import * as ${this.name} from ${inspect(this.sourceLocation)}\n`;
        }
    }
    export class MapExpression extends JsSys {
        constructor(readonly k: string = 'any', readonly v: string = 'any') { super(); }
        toSource() {
            return `new Map<${this.k}, ${this.v}>()`;
        }
    }
    export class SetExpression extends JsSys {
        constructor(readonly k: string = 'any') { super(); }
        toSource() {
            return `new Set<${this.k}>()`;
        }
    }
    export class ConstExpression extends JsSys {
        constructor(readonly name: string, readonly expression: JsSys) { super(); }
        toSource() {
            return `const ${this.name} = ${this.expression.toSource()}`;
        }
    }
    export class Export extends JsSys {
        constructor(readonly expression: JsSys) { super(); }
        toSource() {
            return `export ${this.expression.toSource()};\n`;
        }
    }
    export class Program extends JsSys {
        _body: JsSys[] = [];
        imports = new Map<string, Import>();
        constructor(readonly filename: string) { super(); }
        appendImport(importExpression: Import) {
            this.imports.set(importExpression.name, importExpression);
        }
        append(expression: JsSys) {
            this._body.push(expression);
        }
        get body() {
            return [
                ...Array.from(this.imports.values()),
                new NewLine(),
                new NewLine(),
                ...this._body,
            ];
        }
        toSource() {
            const sourceLines: string[] = [];

            for (const line of this.body) {
                sourceLines.push(line.toSource());
            }

            return sourceLines.join('');
        }
    }
}
