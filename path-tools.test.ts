import { deepEqual, deepStrictEqual, equal, strictEqual } from "node:assert"
import { describe, it } from "node:test"
import { inspect } from "node:util"
import { objectDeepAt, objectFilterTree, objectFindDeepAt } from "./path-tools"


const snap = (data: unknown) => inspect(data, { depth: null })

it("should select a deep property", () => {
    const obj = {
        a: {
            b: [
                1,
                2,
                {
                    c: {
                        d: 'e'
                    }
                }
            ],
            f: {
                g: 'h'
            },
            i: 'j'
        }
    }

    equal(objectDeepAt(obj, 'a', 'b', '2', 'c', 'd'), 'e')
    equal(objectDeepAt(obj, 'a', 'b', '2', 'c', 'd', '0'), 'e')
    equal(objectDeepAt(obj, 'z', 'b', '2', 'c', 'd'), undefined)
})

it('should find deep', () => {
    const obj = {
        a: {
            b: [
                1,
                2,
                {
                    c: {
                        d: 'e',
                        f: 'g'
                    }
                }
            ]
        }
    }

    deepStrictEqual(objectFindDeepAt(obj, 'a', 'b', '2', 'c', 'd'), ['e'])
    deepStrictEqual(objectFindDeepAt(obj, 'a', 'b', '2', 'c', () => true), ['e', 'g'])
})

it('should find by tree', () => {
    const obj = {
        a: {
            b: [
                1,
                2,
                {
                    c: {
                        d: 'e',
                        f: 'g'
                    }
                }
            ]
        },
        h: 'i',
        j: [1, 'k']
    }

    deepStrictEqual(objectFilterTree(obj, (_, obj) => typeof obj === 'string'), ['e', 'g', 'i', 'k'])
    deepStrictEqual(
        objectFilterTree(obj, (_, obj) => objectDeepAt(obj, 'c', 'd') === 'e'),
        [
            {
                c: {
                    d: 'e',
                    f: 'g'
                }
            }
        ],
    )
})