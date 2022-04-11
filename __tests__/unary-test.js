import {testRun} from "./utils";

test("unary -", () => {
  testRun('-x;', {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'UnaryExpression',
          operator: '-',
          argument: {
            type: 'Identifier',
            name: 'x',
          },
        },
      },
    ],
  });
})

test("unary !", () => {
  testRun('!x;', {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'UnaryExpression',
          operator: '!',
          argument: {
            type: 'Identifier',
            name: 'x',
          },
        },
      },
    ],
  });
})
