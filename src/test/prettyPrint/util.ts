import fc from "fast-check";
import {
    AstBouncedMessageType,
    AstExpression,
    AstFunctionAttribute,
    AstFunctionDef,
    AstId,
    AstImport,
    AstMapType,
    AstModule,
    AstOpBinary,
    AstOptionalType,
    AstOpUnary,
    AstStatement,
    AstStatementLet,
    AstType,
    AstTypeId,
} from "../../grammar/ast";
import { dummySrcInfo } from "../../grammar/grammar";

export function generateAstExpression(): fc.Arbitrary<AstExpression> {
    return fc.oneof(
        // generateAstExpressionPrimary(),
        generateOpBinary(),
        generateOpUnary(),
        // generateConditional()
    );
}

export function generateAstId(): fc.Arbitrary<AstId> {
    return fc.record({
        kind: fc.constant("id"),
        text: fc.constantFrom("null"),
        id: fc.constant(0),
        loc: fc.constant(dummySrcInfo),
    });
}

export function generateAstType(): fc.Arbitrary<AstType> {
    return fc.oneof(
        generateAstTypeId(),
        generateAstOptionalType(),
        generateAstMapType(),
        generateAstBouncedMessageType(),
    );
}

export function generateAstTypeId(): fc.Arbitrary<AstTypeId> {
    return fc.record({
        kind: fc.constant("type_id" as const),
        text: fc.string(),
        id: fc.integer(),
        loc: fc.constant(dummySrcInfo),
    });
}

export function generateAstOptionalType(): fc.Arbitrary<AstOptionalType> {
    return fc.record({
        kind: fc.constant("optional_type" as const),
        typeArg: generateAstType(),
        id: fc.integer(),
        loc: fc.constant(dummySrcInfo),
    });
}

export function generateAstMapType(): fc.Arbitrary<AstMapType> {
    return fc.record({
        kind: fc.constant("map_type" as const),
        keyType: generateAstTypeId(),
        keyStorageType: fc.oneof(fc.constant(null), generateAstId()),
        valueType: generateAstTypeId(),
        valueStorageType: fc.oneof(fc.constant(null), generateAstId()),
        id: fc.integer(),
        loc: fc.constant(dummySrcInfo),
    });
}

export function generateAstBouncedMessageType(): fc.Arbitrary<AstBouncedMessageType> {
    return fc.record({
        kind: fc.constant("bounced_message_type" as const),
        messageType: generateAstTypeId(),
        id: fc.integer(),
        loc: fc.constant(dummySrcInfo),
    });
}

export function generateOpBinary(): fc.Arbitrary<AstOpBinary> {
    return fc.record({
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
        left: generateAstId(),
        right: generateAstId(),
        id: fc.constant(0),
        loc: fc.constant(dummySrcInfo),
    });
}
export function generateOpUnary(): fc.Arbitrary<AstOpUnary> {
    return fc.record({
        kind: fc.constant("op_unary"),
        op: fc.constantFrom("+", "-", "!", "~"),
        operand: generateAstId(),
        id: fc.constant(0),
        loc: fc.constant(dummySrcInfo),
    });
}

export function generateAstStatementLet(): fc.Arbitrary<AstStatementLet> {
    return fc.record({
        kind: fc.constant("statement_let"),
        name: generateAstId(),
        type: fc.oneof(fc.constant(null)),
        expression: generateOpBinary(),
        id: fc.constant(0),
        loc: fc.constant(dummySrcInfo),
    });
}

export function generateAstStatements(): fc.Arbitrary<AstStatement[]> {
    return fc.array(generateAstStatementLet(), { maxLength: 5 });
}

export function generateFunctionAttribute(): fc.Arbitrary<AstFunctionAttribute> {
    return fc.oneof(
        fc.record({
            kind: fc.constant("function_attribute" as const),
            type: fc.constant("get" as const),
            methodId: fc.oneof(fc.constant(null), generateAstExpression()),
            loc: fc.constant(dummySrcInfo),
        }),
        fc.oneof(
            fc.record({
                kind: fc.constant("function_attribute" as const),
                type: fc.constant("mutates" as const),
                loc: fc.constant(dummySrcInfo),
            }),
            fc.record({
                kind: fc.constant("function_attribute" as const),
                type: fc.constant("extends" as const),
                loc: fc.constant(dummySrcInfo),
            }),
            fc.record({
                kind: fc.constant("function_attribute" as const),
                type: fc.constant("virtual" as const),
                loc: fc.constant(dummySrcInfo),
            }),
            fc.record({
                kind: fc.constant("function_attribute" as const),
                type: fc.constant("abstract" as const),
                loc: fc.constant(dummySrcInfo),
            }),
            fc.record({
                kind: fc.constant("function_attribute" as const),
                type: fc.constant("override" as const),
                loc: fc.constant(dummySrcInfo),
            }),
            fc.record({
                kind: fc.constant("function_attribute" as const),
                type: fc.constant("inline" as const),
                loc: fc.constant(dummySrcInfo),
            }),
        ),
    );
}

export function generateAstFunctionDef(): fc.Arbitrary<AstFunctionDef> {
    return fc.record({
        kind: fc.constant("function_def"),
        attributes: fc.array(generateFunctionAttribute(), { maxLength: 3 }),
        name: generateAstId(),
        return: fc.oneof(fc.constant(null), generateAstType()),
        params: fc.array(
            fc.record({
                kind: fc.constant("typed_parameter"),
                name: generateAstId(),
                type: generateAstType(),
                id: fc.constant(0),
                loc: fc.constant(dummySrcInfo),
            }),
            { maxLength: 3 },
        ),
        statements: generateAstStatements(),
        id: fc.constant(0),
        loc: fc.constant(dummySrcInfo),
    });
}

export function generateAstImport(): fc.Arbitrary<AstImport> {
    return fc.record({
        kind: fc.constant("import"),
        path: fc.record({
            kind: fc.constant("string"),
            value: fc.string(),
            id: fc.constant(0),
            loc: fc.constant(dummySrcInfo),
        }),
        id: fc.constant(0),
        loc: fc.constant(dummySrcInfo),
    });
}

export function generateAstModule(): fc.Arbitrary<AstModule> {
    return fc.record({
        kind: fc.constant("module"),
        imports: fc.array(generateAstImport(), { maxLength: 5 }),
        items: fc.array(generateAstFunctionDef(), { maxLength: 5 }),
        id: fc.constant(0),
    });
}
