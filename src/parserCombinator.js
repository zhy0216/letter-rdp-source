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
  logicalExpression,
  equalityExpression,
  binaryExpression,
  assignmentExpression,
  literal,
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

const equalityExpression = makeBinaryExpression(relationOperator)

const logicalExpression = sequenceOf([
  whitespaceSurrounded(equalityExpression),
  whitespaceSurrounded(logicOperator),
  whitespaceSurrounded(expression),
])


const assignmentExpression = sequenceOf([
  whitespaceSurrounded(identifier),
  str("="),
  whitespaceSurrounded(
    expression
  ),
])
  .map(([left, operator, right]) => ({
    type: "AssignmentExpression",
    left,
    operator,
    right,
  }))

/** statement **/
const statement = recursiveParser(() => whitespaceSurrounded(choice([
  expressionStatement,
  blockStatement,
  emptyStatement,
  variableStatement,
  ifStatement,
])))

const blockStatement = pipeParsers([
  betweenBraces(many(statement)),
]).map(tag("BlockStatement", undefined, "body"))

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
