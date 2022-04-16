import {
  choice,
  many,
  sequenceOf,
  str,
  skip,
  recursiveParser, pipeParsers, possibly, tapParser,
} from "arcsecond"
import {
  betweenBrackets,
  betweenParentheses,
  identifier,
  keywords,
  literal,
  semicolon,
  tag,
  whitespaceSurrounded
} from "./basic";

import {assignmentExpression, expression, relationExpression} from "./expression"

const statement = recursiveParser(() => whitespaceSurrounded(choice([
  returnStatement,
  expressionStatement,
  classDeclaration,
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
  betweenBrackets(many(statement)),
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
  whitespaceSurrounded(betweenParentheses(possibly(
    sequenceOf([
      identifier,
      many(pipeParsers([
        whitespaceSurrounded(str(",")),
        identifier,
      ]))
    ])
  ))),
  whitespaceSurrounded(blockStatement),
]).map(r => ({
  type: "FunctionDeclaration",
  name: r[1],
  params: r[2]? [r[2][0]].concat(r[2][1]): [],
  body: r[3],
}))

const classDeclaration = sequenceOf([
  whitespaceSurrounded(keywords.class),
  whitespaceSurrounded(identifier),
  possibly(pipeParsers([
    whitespaceSurrounded(str("extends")),
    whitespaceSurrounded(identifier)
  ])),
  whitespaceSurrounded(blockStatement),
]).map(r => {

  return {
    type: "ClassDeclaration",
    id: r[1],
    superClass: r[2],
    body: r[3]
  }
})

const emptyStatement = semicolon.map(_ => ({type: "EmptyStatement"}))

export const parser = many(statement).map(tag("Program", undefined, "body"))
