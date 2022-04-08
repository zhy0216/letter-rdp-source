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
  optionalWhitespace, recursiveParser, pipeParsers,
} from "arcsecond"

const tag = (type, mapF, valueKey) => r => ({
  type: type,
  [valueKey? valueKey: "value"]: mapF? mapF(r): r
})
const whitespaceSurrounded = parser => between (optionalWhitespace) (optionalWhitespace) (parser)
const semicolon = str(";")

const number = digits.map(tag("NumericLiteral", parseInt))

const string = lookAhead(anyOfString(`"'`))
  .chain(quote => sequenceOf([
    char(quote),
    letters, // todo
    char(quote)
  ]).map(tag("StringLiteral", r => r[1])))

const statement = recursiveParser(() => whitespaceSurrounded(choice([
  expressionStatement,
  blockStatement
])))

const blockStatement = pipeParsers([
  between(
    whitespaceSurrounded(str("{"))
  )(
    whitespaceSurrounded(str("}"))
  )(many(statement)),
]).map(tag("BlockStatement", undefined, "body"))

const expressionStatement = pipeParsers([
  choice([
    number,
    string,
  ]),
  skip(semicolon),
]).map(tag("ExpressionStatement", undefined, "expression"))

export const parser = many(statement).map(tag("Program", undefined, "body"))
