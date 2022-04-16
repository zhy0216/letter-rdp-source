import {
  anyOfString,
  choice,
  many,
  many1,
  pipeParsers,
  possibly,
  recursiveParser,
  sequenceOf, skip,
  str,
  tapParser
} from "arcsecond";
import {betweenParentheses, betweenSquareBrackets, identifier, keywords, literal, whitespaceSurrounded} from "./basic";

export const expression = recursiveParser(() => choice([
  unaryExpression,
  logicalExpression,
  relationExpression,
  binaryExpression,
  assignmentExpression,
  newExpression,
  callExpression,
  memberExpression,
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

const thisExpression = str("this").map(r => ({type: "ThisExpression"}))
const superExpression = str("super").map(r => ({type: "Super"}))

const memberExpression = sequenceOf([
  whitespaceSurrounded(choice([
    thisExpression,
    identifier
  ])),
  many1(choice([
    sequenceOf([
      str("."),
      identifier,
    ]),
    sequenceOf([betweenSquareBrackets(literal)]),
  ]))
]).map(r => {
  const isDot = r[1][0][0] === "."
  let result = {
    type: "MemberExpression",
    computed: !isDot,
    object: r[0],
    property: isDot ? r[1][0][1] : r[1][0][0],
  }

  for (const seq of r[1].slice(1)) {
    const isDot = seq[0] === "."
    result = {
      type: "MemberExpression",
      computed: !isDot,
      object: result,
      property: isDot ? seq[1] : seq[0],
    }
  }

  return result
})

const callExpression = sequenceOf([
  whitespaceSurrounded(choice([
    superExpression,
    memberExpression,
    identifier
  ])),
  many1(whitespaceSurrounded(betweenParentheses(possibly(sequenceOf([
    whitespaceSurrounded(identifier),
    many(pipeParsers([
      str(","),
      whitespaceSurrounded(identifier),
    ]))
  ]))))),
]).map(r => {
  let result = {
    type: "CallExpression",
    callee: r[0],
    arguments: r[1][0]? [r[1][0][0]].concat(r[1][0][1]): []
  }

  for(const nextCalleeArg of r[1].slice(1)) {
    result = {
      type: "CallExpression",
      callee: result,
      arguments: nextCalleeArg? [nextCalleeArg[0]].concat(nextCalleeArg[1]): []
    }
  }

  return result
})

const makeBinaryExpression = operator => sequenceOf([
  whitespaceSurrounded(choice([callExpression, memberExpression, literal, identifier])),
  many1(sequenceOf([
    operator,
    whitespaceSurrounded(choice([memberExpression, literal, identifier])),
  ])),
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
  whitespaceSurrounded(choice([memberExpression, identifier])),
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

const newExpression = sequenceOf([
  whitespaceSurrounded(keywords.new),
  identifier,
  betweenParentheses(possibly(sequenceOf([
    whitespaceSurrounded(choice([identifier, literal])),
    many(pipeParsers([
      whitespaceSurrounded(str(",")),
      whitespaceSurrounded(choice([identifier, literal])),
    ]))
  ]))),
]).map(r => ({
  type: "NewExpression",
  callee: r[1],
  arguments: r[2]? [r[2][0]].concat(r[2][1]): []
}))
