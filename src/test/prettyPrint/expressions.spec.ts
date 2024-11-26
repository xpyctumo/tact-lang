import fc from "fast-check";
import { AstExpression, eqExpressions } from "../../grammar/ast";
import { dummySrcInfo, parseExpression } from "../../grammar/grammar";
import { prettyPrint } from "../../prettyPrinter";

describe("Pretty Print Expressions", () => {
    const generateAstNumber = () =>
        fc.record({
            kind: fc.constant("number"),
            base: fc.constantFrom(2, 8, 10, 16),
            //                 VVV  MAYBE A BUG
            value: fc.bigInt().filter((n) => n > 0),
            id: fc.constant(0),
            loc: fc.constant(dummySrcInfo),
        }) as fc.Arbitrary<AstExpression>;

    const generateAstOpUnary = () =>
        fc.record({
            kind: fc.constant("op_unary"),
            op: fc.constantFrom("+", "-", "!", "!!", "~"),
            operand: generateAstNumber(),
            id: fc.constant(0),
            loc: fc.constant(dummySrcInfo),
        }) as fc.Arbitrary<AstExpression>;

    const generateAstOpBinary = () =>
        fc.record({
            kind: fc.constant("op_binary"),
            op: fc.constantFrom(
                "+",
                "-",
                "*",
                "/",
                "!=",
                ">",
                "<",
                ">=",
                "<=",
                "==",
                "&&",
                "||",
                "%",
                "<<",
                ">>",
                "&",
                "|",
                "^",
            ),
            left: generateAstNumber(),
            right: generateAstNumber(),
            id: fc.constant(0),
            loc: fc.constant(dummySrcInfo),
        }) as fc.Arbitrary<AstExpression>;

    const generateAstConditional = (
        astExpression: fc.Arbitrary<AstExpression>,
    ) =>
        fc.record({
            kind: fc.constant("conditional"),
            condition: astExpression,
            thenBranch: astExpression,
            elseBranch: astExpression,
            id: fc.constant(0),
            loc: fc.constant(dummySrcInfo),
        }) as fc.Arbitrary<AstExpression>;

    const generateAstExpression: fc.Arbitrary<AstExpression> = fc.letrec(
        (tie) => ({
            AstExpression: fc.oneof(
                generateAstNumber(),
                tie("AstOpUnary") as fc.Arbitrary<AstExpression>,
                tie("AstOpBinary") as fc.Arbitrary<AstExpression>,
                tie("AstConditional") as fc.Arbitrary<AstExpression>,
            ),
            AstOpUnary: generateAstOpUnary(),
            AstOpBinary: generateAstOpBinary(),
            AstConditional: generateAstConditional(
                tie("AstExpression") as fc.Arbitrary<AstExpression>,
            ),
        }),
    ).AstExpression;

    it.each([
        ["AstConditional", generateAstConditional(generateAstExpression)],
        ["AstOpBinary", generateAstOpBinary()],
        ["AstOpUnary", generateAstOpUnary()],
    ])("should parse random %s expression", (_, astGenerator) => {
        fc.assert(
            fc.property(astGenerator, (astBefore) => {
                const prettyBefore = prettyPrint(astBefore);
                const astAfter = parseExpression(prettyBefore);
                expect(eqExpressions(astBefore, astAfter)).toBe(true);
            }),
        );
    });
});
