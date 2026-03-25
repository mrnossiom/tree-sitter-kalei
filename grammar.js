/**
 * @file Kalei grammar for tree-sitter
 * @author Milo Moisson <milo@wiro.world>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  assign: 0,
  short_circuit_or: 1,
  short_circuit_and: 2,
  equality: 3,
  comparison: 4,
  bitwise_or: 5,
  bitwise_xor: 6,
  bitwise_and: 7,
  shift: 8,
  additive: 9,
  multiplicative: 10,
  unary: 11,
  postfix: 12,
  call: 13,
};

module.exports = grammar({
  name: "kalei",

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,

  conflicts: $ => [
    [$.path_segment],
  ],

  rules: {
    source_file: $ => seq(
      repeat($.attribute_parent),
      repeat($.item)
    ),

    item: $ => seq(
      repeat($.attribute_next),
      choice(
        $.function_definition,
        $.unsafe_extern_block,
        $.struct_definition,
        $.enum_definition,
        $.trait_definition,
        $.trait_implementation,
        $.type_alias
      )
    ),

    attribute_parent: $ => seq(
      "##",
      $.path,
      optional($.attribute_meta)
    ),

    attribute_next: $ => seq(
      "#",
      $.path,
      optional($.attribute_meta)
    ),

    attribute_meta: $ => choice(
      seq("(", sepBy(",", $.expr), ")"),
      seq("{", sepBy(",", $.expr), "}"),
      seq("[", sepBy(",", $.expr), "]")
    ),

    function_definition: $ => seq(
      "fn",
      field("name", $.identifier),
      optional($.generics),
      $.fn_decl,
      choice(
        field("body", $.block),
        ";"
      )
    ),

    fn_decl: $ => seq(
      "(",
      sepBy(",", $.param),
      ")",
      optional(field("return_type", $.type))
    ),

    param: $ => seq(
      field("name", $.identifier),
      ":",
      field("type", $.type)
    ),

    generics: $ => seq(
      "<",
      sepBy(",", $.identifier),
      ">"
    ),

    unsafe_extern_block: $ => seq(
      "unsafe",
      "extern",
      "{",
      repeat($.item),
      "}"
    ),

    struct_definition: $ => seq(
      "struct",
      field("name", $.identifier),
      optional($.generics),
      choice(
        field("body", $.struct_block),
        field("body", $.tuple_fields),
        ";"
      )
    ),

    struct_block: $ => seq(
      "{",
      sepBy(",", $.field_def),
      optional(","),
      "}"
    ),

    field_def: $ => seq(
      field("name", $.identifier),
      ":",
      field("type", $.type)
    ),

    tuple_fields: $ => seq(
      "(",
      sepBy(",", $.type),
      optional(","),
      ")"
    ),

    enum_definition: $ => seq(
      "enum",
      field("name", $.identifier),
      optional($.generics),
      "{",
      sepBy(",", $.variant),
      optional(","),
      "}"
    ),

    variant: $ => seq(
      field("name", $.identifier),
      optional(choice(
        $.struct_block,
        $.tuple_fields
      ))
    ),

    trait_definition: $ => seq(
      "trait",
      field("name", $.identifier),
      optional($.generics),
      "{",
      repeat($.item),
      "}"
    ),

    trait_implementation: $ => seq(
      "for",
      field("type", $.path),
      "impl",
      field("trait", $.path),
      "{",
      repeat($.item),
      "}"
    ),

    type_alias: $ => seq(
      "type",
      field("name", $.identifier),
      choice(
        seq("=", field("type", $.type), ";"),
        ";"
      )
    ),

    type: $ => choice(
      $.path,
      $.pointer_type
    ),

    pointer_type: $ => seq("*", $.type),

    path: $ => seq(
      $.path_segment,
      repeat(seq("::", $.path_segment))
    ),

    path_segment: $ => seq(
      $.identifier,
      optional($.generic_params)
    ),

    generic_params: $ => seq(
      "<",
      sepBy(",", $.type),
      optional(","),
      ">"
    ),

    block: $ => seq(
      "{",
      repeat($.stmt),
      "}"
    ),

    stmt: $ => choice(
      $.empty_stmt,
      $.let_stmt,
      $.expr_stmt,
      $.expr_ret_stmt
    ),

    empty_stmt: $ => ";",

    let_stmt: $ => seq(
      "let",
      optional("mut"),
      field("name", $.identifier),
      optional(seq(":", field("type", $.type))),
      optional(seq("=", field("value", $.expr))),
      ";"
    ),

    expr_stmt: $ => prec(1, seq($.expr, ";")),

    expr_ret_stmt: $ => prec(0, $.expr),

    expr: $ => choice(
      $.binary_expr,
      $.assignment_expr,
      $.short_circuit_expr,
      $.unary_expr,
      $.postfix_expr,
      $.primary_expr
    ),

    unary_expr: $ => prec(PREC.unary, choice(
      seq("not", $.expr),
      seq("-", $.expr)
    )),

    binary_expr: $ => {
      const table = [
        [PREC.multiplicative, choice("*", "/", "%")],
        [PREC.additive, choice("+", "-")],
        [PREC.shift, choice("<<", ">>")],
        [PREC.bitwise_and, "&"],
        [PREC.bitwise_xor, "^"],
        [PREC.bitwise_or, "|"],
        [PREC.comparison, choice(">", ">=", "<", "<=")],
        [PREC.equality, choice("==", "!=")],
      ];

      return choice(...table.map(([p, ops]) => prec.left(p, seq($.expr, ops, $.expr))));
    },

    short_circuit_expr: $ => choice(
      prec.left(PREC.short_circuit_and, seq($.expr, "and", $.expr)),
      prec.left(PREC.short_circuit_or, seq($.expr, "or", $.expr))
    ),

    assignment_expr: $ => prec.right(PREC.assign, seq(
      field("left", $.expr),
      "=",
      field("right", $.expr)
    )),

    postfix_expr: $ => choice(
      prec.left(PREC.postfix, seq(field("object", $.expr), ".", field("field", $.identifier))), // field
      prec.left(PREC.postfix, seq(field("object", $.expr), ".", field("method", $.identifier), "(", field("arguments", sepBy(",", $.expr)), ")")), // method call
      prec.left(PREC.postfix, seq(field("object", $.expr), ".", "*")), // deref
      prec.left(PREC.postfix, seq(field("object", $.expr), ".", "match", "{", repeat($.match_arm), "}")), // match
      prec.left(PREC.call, seq(field("function", $.expr), "(", field("arguments", sepBy(",", $.expr)), ")")) // call
    ),

    match_arm: $ => "todo",

    primary_expr: $ => choice(
      $.path,
      $.string_literal,
      $.int_literal,
      $.float_literal,
      seq("(", $.expr, ")"),
      $.if_expr,
      $.while_expr,
      $.loop_expr,
      $.return_expr,
      $.break_expr,
      $.continue_expr
    ),

    if_expr: $ => seq(
      "if",
      field("condition", $.expr),
      field("consequence", $.block),
      optional(seq("else", field("alternative", $.block)))
    ),

    while_expr: $ => seq(
      "while",
      field("condition", $.expr),
      field("body", $.block)
    ),

    loop_expr: $ => seq(
      "loop",
      field("body", $.block)
    ),

    return_expr: $ => prec.left(seq("return", optional($.expr))),

    break_expr: $ => prec.left(seq(
      "break",
      optional($.label),
      optional($.expr)
    )),

    continue_expr: $ => prec.left(seq(
      "continue",
      optional($.label)
    )),

    label: $ => seq("'", $.identifier),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    string_literal: $ => /"([^"\\]|\\.)*"/,

    int_literal: $ => /[0-9]+/,

    float_literal: $ => /[0-9]+\.[0-9]+/,

    comment: $ => token(choice(
      seq("//", /[^\n]*/),
      seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
    )),
  }
});

function sepBy1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}

function sepBy(sep, rule) {
  return optional(sepBy1(sep, rule));
}
