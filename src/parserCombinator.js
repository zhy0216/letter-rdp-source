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
  optionalWhitespace,
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

const expressionStatement = sequenceOf([
  choice([
    number,
    string,
  ]),
  semicolon,
]).map(tag("ExpressionStatement", r => r[0], "expression"))

const statement = choice([
  whitespaceSurrounded(expressionStatement)
])


export const parser = many(statement).map(tag("Program", undefined, "body"))
