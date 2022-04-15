import {
  choice,
  many,
  sequenceOf,
  str,
  anyOfString,
  skip,
  recursiveParser, pipeParsers, possibly, many1,
} from "arcsecond"
import {
  betweenBraces,
  betweenParentheses,
  identifier,
  keywords,
  literal,
  semicolon,
  tag,
  whitespaceSurrounded
} from "./basic";

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
  returnStatement,
  expressionStatement,
  blockStatement,
  variableStatement,
  ifStatement,
  whileStatement,
  doWhileStatement,
  forStatement,
  emptyStatement,
  functionDeclaration,
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

const returnStatement = sequenceOf([
  whitespaceSurrounded(keywords.return),
  whitespaceSurrounded(possibly(expression)),
  whitespaceSurrounded(skip(semicolon)),
]).map(r => ({
  type: "ReturnStatement",
  argument: r[1],
}))

const functionDeclaration = sequenceOf([
  whitespaceSurrounded(keywords.def),
  whitespaceSurrounded(identifier),
  whitespaceSurrounded(betweenParentheses(many(identifier))),
  whitespaceSurrounded(blockStatement),
]).map(r => ({
  type: "FunctionDeclaration",
  name: r[1],
  params: r[2],
  body: r[3],
}))

const emptyStatement = semicolon.map(_ => ({type: "EmptyStatement"}))

export const parser = many(statement).map(tag("Program", undefined, "body"))
