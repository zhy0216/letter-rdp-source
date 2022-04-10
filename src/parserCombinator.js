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
  optionalWhitespace, recursiveParser, pipeParsers, possibly, sepBy1, many1, sepBy,
} from "arcsecond"

const tag = (type, mapF, valueKey) => r => ({
  type: type,
  [valueKey ? valueKey : "value"]: mapF ? mapF(r) : r
})

const keywords = {
  let: str("let")
}

const whitespaceSurrounded = parser => between(optionalWhitespace)(optionalWhitespace)(parser)
const betweenParentheses = parser =>
  between(whitespaceSurrounded(char('(')))(whitespaceSurrounded(char(')')))(parser);

const semicolon = str(";")

const number = digits.map(tag("NumericLiteral", parseInt))

const string = lookAhead(anyOfString(`"'`))
  .chain(quote => sequenceOf([
    char(quote),
    letters, // todo
    char(quote)
  ]).map(tag("StringLiteral", r => r[1])))

const literal = choice([
  number,
  string,
])

const identifier = letters.map(tag("Identifier", undefined, "name"))

const expression = recursiveParser(() => choice([
  binaryExpression,
  assignmentExpression,
  literal,
]))

// ignore precedence for now....
const binaryExpression = sequenceOf([
  whitespaceSurrounded(literal),
  many1(sequenceOf([
    anyOfString("+-*/"),
    whitespaceSurrounded(literal)
  ]))
])
  .map(([initialTerm, rest]) => {
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
])))

const blockStatement = pipeParsers([
  between(
    whitespaceSurrounded(str("{"))
  )(
    whitespaceSurrounded(str("}"))
  )(many(statement)),
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

const emptyStatement = semicolon.map(_ => ({type: "EmptyStatement"}))

export const parser = many(statement).map(tag("Program", undefined, "body"))
