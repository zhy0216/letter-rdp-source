import {Parser} from '../src/Parser'
import assert from "assert";

const parser = new Parser()

export function testRun(program, expected) {
  const ast = parser.parse(program);
  assert.deepEqual(ast, expected);
}
