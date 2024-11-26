import * as fc from "fast-check";
import { prettyPrint } from "../../prettyPrinter";
import { makeValueExpression } from "../../optimizer/util";
import { parseExpression } from "../../grammar/grammar";
import { eqExpressions } from "../../grammar/ast";

describe("Pretty Print Primitives", () => {
    const cases: [string, fc.Arbitrary<boolean | string | bigint>][] = [
        ["boolean", fc.boolean()],
        [
            "string", //                  VVVV <- MAYBE BUG -> VVVV
            fc.string().filter((s) => !s.includes("\\") && !s.includes('"')),
        ],
        ["bigint", fc.bigInt().filter((n) => n > 0)],
    ];

    cases.forEach(([name, arb]) => {
        it(`should not change parsed AST for '${name}' expression`, () => {
            fc.assert(
                fc.property(arb, (value) => {
                    const astBefore = makeValueExpression(value);
                    const prettyBefore = prettyPrint(astBefore);
                    const astAfter = parseExpression(prettyBefore);
                    expect(eqExpressions(astBefore, astAfter)).toBe(true);
                }),
            );
        });
    });

    it("should parse null expression", () => {
        const astBefore = makeValueExpression(null);
        const prettyBefore = prettyPrint(astBefore);
        const astAfter = parseExpression(prettyBefore);
        expect(eqExpressions(astBefore, astAfter)).toBe(true);
    });
});
