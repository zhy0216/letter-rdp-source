import {testRun} from "./utils";


test('literal 1', () => {
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
})

test('literal 2', () => {
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
})

test('literal 3', () => {
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
