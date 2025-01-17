import {testRun} from "./utils";

test("==", () => {
  testRun('x > 0 == true;', {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '==',
          left: {
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
          right: {
            type: 'BooleanLiteral',
            value: true,
          },
        },
      },
    ],
  });
})

test("!=", () => {
  testRun('x >= 0 != false;', {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'BinaryExpression',
          operator: '!=',
          left: {
            type: 'BinaryExpression',
            operator: '>=',
            left: {
              type: 'Identifier',
              name: 'x',
            },
            right: {
              type: 'NumericLiteral',
              value: 0,
            },
          },
          right: {
            type: 'BooleanLiteral',
            value: false,
          },
        },
      },
    ],
  });
})
