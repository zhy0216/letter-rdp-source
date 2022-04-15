import {anyOfString, choice, many1, recursiveParser, sequenceOf, str} from "arcsecond";
import {identifier, literal, whitespaceSurrounded} from "./basic";

export const expression = recursiveParser(() => choice([
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

export const relationExpression = makeBinaryExpression(relationOperator)

export const logicalExpression = sequenceOf([
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

export const assignmentExpression = sequenceOf([
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
