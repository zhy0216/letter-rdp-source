import {
  letters,
  digits,
  choice,
  many,
  between,
  sequenceOf,
  char,
  anyChar,
  anythingExcept,
  str,
  lookAhead, anyOfString,
  skip,
  optionalWhitespace, recursiveParser, pipeParsers, possibly, sepBy1, many1, sepBy, tapParser,
} from "arcsecond"

const tag = (type, mapF, valueKey) => r => ({
  type: type,
  [valueKey ? valueKey : "value"]: mapF ? mapF(r) : r
})

const keywords = {
  let: str("let"),
  if: str("if"),
  else: str("else"),
  while: str("while"),
  do: str("do"),
  for: str("for"),
}

const whitespaceSurrounded = between(optionalWhitespace)(optionalWhitespace)
const betweenParentheses = between(whitespaceSurrounded(char('(')))(whitespaceSurrounded(char(')')))
const betweenBraces = between(whitespaceSurrounded(char('{')))(whitespaceSurrounded(char('}')))

const semicolon = str(";")

const number = digits.map(tag("NumericLiteral", parseInt))

const string = lookAhead(anyOfString(`"'`))
  .chain(quote => sequenceOf([
    char(quote),
    letters, // todo
    char(quote)
  ]).map(tag("StringLiteral", r => r[1])))

const boolean = choice([str("true"), str("false")])
  .map(tag("BooleanLiteral", r => r === "true"))

const literal = choice([
  number,
  string,
  boolean,
])

const identifier = letters.map(tag("Identifier", undefined, "name"))

const expression = recursiveParser(() => choice([
  unaryExpression,
  logicalExpression,
  relationExpression,
  binaryExpression,
  assignmentExpression,
  literal,
  identifier,
]))

const logicOperator = choice([
  str("&&"),
  str("||"),
])

const binaryOperator = choice([
  anyOfString("+-*/"),
])

const relationOperator = choice([
  str(">="),
  str("<="),
  str("<"),
  str(">"),
  str("=="),
  str("!="),
])

const makeBinaryExpression = operator => sequenceOf([
  whitespaceSurrounded(choice([literal, identifier])),
  many1(sequenceOf([
    operator,
    whitespaceSurrounded(choice([literal, identifier])),
  ]))
]).map(([initialTerm, rest]) => {
  let left = initialTerm

  for (const items of rest) {
    const [operator, right] = items
    left = {
      type: "BinaryExpression",
      left,
      operator,
      right
    }
  }

  return left
})


// ignore precedence for now....
const binaryExpression = makeBinaryExpression(binaryOperator)

const relationExpression = makeBinaryExpression(relationOperator)

const logicalExpression = sequenceOf([
  whitespaceSurrounded(relationExpression),
  whitespaceSurrounded(logicOperator),
  whitespaceSurrounded(expression),
]).map(r => ({
  type: "LogicalExpression",
  operator: r[1],
  left: r[0],
  right: r[2],
}))

const unaryExpression = sequenceOf([
  anyOfString("-!"),
  choice([literal, identifier]),
]).map(r => ({
  type: "UnaryExpression",
  operator: r[0],
  argument: r[1],
}))

const assignmentOperator = choice([
  str("="),
  str("-="),
  str("+=")
])

const assignmentExpression = sequenceOf([
  whitespaceSurrounded(identifier),
  assignmentOperator,
  whitespaceSurrounded(
    expression
  ),
])
  .map((r) => ({
    type: "AssignmentExpression",
    left: r[0],
    operator: r[1],
    right: r[2],
  }))

/** statement **/
const statement = recursiveParser(() => whitespaceSurrounded(choice([
  expressionStatement,
  blockStatement,
  variableStatement,
  ifStatement,
  whileStatement,
  doWhileStatement,
  forStatement,
  emptyStatement,
])))

const blockStatement = pipeParsers([
  betweenBraces(many(statement)),
]).map(tag("BlockStatement", undefined, "body"))

const whileStatement = sequenceOf([
  whitespaceSurrounded(keywords.while),
  whitespaceSurrounded(betweenParentheses(relationExpression)),
  whitespaceSurrounded(blockStatement)
]).map(r => ({
  type: "WhileStatement",
  test: r[1],
  body: r[2],
}))

const doWhileStatement = sequenceOf([
  whitespaceSurrounded(keywords.do),
  whitespaceSurrounded(blockStatement),
  whitespaceSurrounded(keywords.while),
  whitespaceSurrounded(betweenParentheses(relationExpression)),
  skip(semicolon),
]).map(r => ({
  type: "DoWhileStatement",
  body: r[1],
  test: r[3],
}))

const expressionStatement =
  pipeParsers([
    expression,
    skip(semicolon),
  ]).map(tag("ExpressionStatement", undefined, "expression"))

const variableDeclaration = sequenceOf([
  whitespaceSurrounded(identifier),
  possibly(pipeParsers([
    whitespaceSurrounded(str("=")),
    whitespaceSurrounded(literal),
  ]))
]).map(r => {
  return {
    id: r[0],
    init: r[1],
    type: "VariableDeclaration",
  }
})

const variableStatement = sequenceOf([
  whitespaceSurrounded(keywords.let),
  variableDeclaration,
  many(pipeParsers([whitespaceSurrounded(str(",")), variableDeclaration])),
  skip(semicolon),
]).map(r => ({
  type: "VariableStatement",
  declarations: [r[1], ...r[2]]
}))

const forStatement = sequenceOf([
  whitespaceSurrounded(keywords.for),
  betweenParentheses(sequenceOf([
    choice([whitespaceSurrounded(variableStatement), whitespaceSurrounded(skip(semicolon))]),
    possibly(whitespaceSurrounded(relationExpression)),
    whitespaceSurrounded(semicolon),
    possibly(whitespaceSurrounded(assignmentExpression)),
  ])),
  whitespaceSurrounded(blockStatement),
]).map(r => ({
    type: "ForStatement",
    init: r[1][0] || null,
    test: r[1][1] || null,
    update: r[1][3] || null,
    body: r[2],
}))

const ifStatement = sequenceOf([
  whitespaceSurrounded(keywords.if),
  betweenParentheses(whitespaceSurrounded(identifier)),
  blockStatement,
  possibly(pipeParsers([
    whitespaceSurrounded(keywords.else),
    blockStatement,
  ]))
]).map(r => ({
  type: "IfStatement",
  test: r[1],
  consequent: r[2],
  alternate: r[3] || null,
}))

const emptyStatement = semicolon.map(_ => ({type: "EmptyStatement"}))

export const parser = many(statement).map(tag("Program", undefined, "body"))
