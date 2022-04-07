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
  lookAhead, anyOfString
} from "arcsecond"

const parseNumber = digits.map(r => ({
  type: "NumericLiteral",
  value: parseInt(r)
}))

const parseString = lookAhead(anyOfString(`"'`))
  .chain(quote => sequenceOf([
    char(quote),
    letters, // todo
    char(quote)
  ]).map(r => ({
    type: "StringLiteral",
    value: r[1]
  })))

const parseStatement = choice([
  parseNumber,
  parseString,
])
  .map(rs => ({
    type: "ExpressionStatement",
    expression: rs
  }))

export const parser = many(parseStatement).map(r => ({
  type: "Program",
  body: r
}))
