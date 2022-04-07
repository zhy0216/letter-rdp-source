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

const tag = (type, mapF, valueKey) => r => ({
  type: type,
  [valueKey? valueKey: "value"]: mapF? mapF(r): r
})

const parseNumber = digits.map(tag("NumericLiteral", parseInt))

const parseString = lookAhead(anyOfString(`"'`))
  .chain(quote => sequenceOf([
    char(quote),
    letters, // todo
    char(quote)
  ]).map(tag("StringLiteral", r => r[1])))

const parseStatement = choice([
  parseNumber,
  parseString,
])
  .map(tag("ExpressionStatement", undefined, "expression"))

export const parser = many(parseStatement).map(tag("Program", undefined, "body"))
