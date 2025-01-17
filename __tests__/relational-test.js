import {testRun} from "./utils";

test(">", () => {
  testRun('x > 0;', {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '>',
          left: {
            type: 'Identifier',
            name: 'x',
          },
          right: {
            type: 'NumericLiteral',
            value: 0,
          },
        },
      },
    ],
  });
})
