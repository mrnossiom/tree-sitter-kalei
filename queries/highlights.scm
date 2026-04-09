[
  "and"
  "break"
  "continue"
  "def"
  "else"
  "enum"
  "extern"
  "for"
  "if"
  "impl"
  "let"
  "loop"
  "match"
  "mut"
  "not"
  "or"
  "return"
  "struct"
  "trait"
  "type"
  "unsafe"
  "while"
] @keyword

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ","
  "."
  ":"
  ";"
  "#"
  "##"
  "::"
] @punctuation.delimiter

[
  "*"
  "+"
  "-"
  "/"
  "%"
  "&"
  "|"
  "^"
  "<<"
  ">>"
  ">"
  ">="
  "<"
  "<="
  "=="
  "!="
  "="
] @operator

(identifier) @variable

(function_definition
  name: (identifier) @function)

(fn_decl
  (param
    name: (identifier) @variable.parameter))

(struct_definition
  name: (identifier) @type)

(enum_definition
  name: (identifier) @type)

(trait_definition
  name: (identifier) @type)

(type_alias
  name: (identifier) @type)

(field_def
  name: (identifier) @property)

(variant
  name: (identifier) @constant)

(path_segment (identifier) @type)

(postfix_expr
  function: (_) @function)

(postfix_expr
  (identifier) @property)

(attribute_parent (path (path_segment (identifier) @attribute)))
(attribute_next (path (path_segment (identifier) @attribute)))

(string_literal) @string
(int_literal) @number
(float_literal) @number
(comment) @comment
