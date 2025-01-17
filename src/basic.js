import {
  anyOfString,
  between,
  char,
  choice, digit,
  digits,
  letter,
  letters,
  lookAhead, many,
  optionalWhitespace,
  sequenceOf,
  str
} from "arcsecond";

export const tag = (type, mapF, valueKey) => r => ({
  type: type,
  [valueKey ? valueKey : "value"]: mapF ? mapF(r) : r
})

export const keywords = {
  let: str("let"),
  if: str("if"),
  else: str("else"),
  while: str("while"),
  do: str("do"),
  for: str("for"),
  def: str("def"),
  return: str("return"),
  class: str("class"),
  new: str("new"),
}

export const whitespaceSurrounded = between(optionalWhitespace)(optionalWhitespace)
export const betweenParentheses = between(whitespaceSurrounded(char('(')))(whitespaceSurrounded(char(')')))
export const betweenBrackets = between(whitespaceSurrounded(char('{')))(whitespaceSurrounded(char('}')))
export const betweenSquareBrackets = between(whitespaceSurrounded(char('[')))(whitespaceSurrounded(char(']')))


export const semicolon = str(";")

export const number = digits.map(tag("NumericLiteral", parseInt))

export const string = lookAhead(anyOfString(`"'`))
  .chain(quote => sequenceOf([
    char(quote),
    letters, // todo
    char(quote)
  ]).map(tag("StringLiteral", r => r[1])))

export const boolean = choice([str("true"), str("false")])
  .map(tag("BooleanLiteral", r => r === "true"))

export const literal = choice([
  number,
  string,
  boolean,
])

export const identifier = sequenceOf([
  letter,
  many(choice([digit, letter])),

]).map(r => ({
  type: "Identifier",
  name: [r[0]].concat(r[1]).join("")
}))
