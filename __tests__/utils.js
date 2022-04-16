import {parser} from '../src/'
import {toValue} from "arcsecond"
import assert from "assert";

export function testRun(program, expected) {
  const ast = parser.run(program);
  let result
  try {
    result = toValue(ast);
  } catch (parseError) {
    console.error(parseError.message)
  }

  assert.deepEqual(result, expected);

}
