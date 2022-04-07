import {testRun} from "./utils";


test('literal', () => {
  testRun(`42;`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'NumericLiteral',
          value: 42,
        },
      },
    ],
  });

  // StringLiteral
  testRun(`"hello";`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'StringLiteral',
          value: 'hello',
        },
      },
    ],
  });

  // StringLiteral
  testRun(`'hello';`, {
    type: 'Program',
    body: [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'StringLiteral',
          value: 'hello',
        },
      },
    ],
  });
});
