import {testRun} from "./utils";

test("Simple assignment", () => {
  testRun(`x = 42;`, {
    type: 'Program', body: [{
      type: 'ExpressionStatement', expression: {
        type: 'AssignmentExpression', operator: '=', left: {
          type: 'Identifier', name: 'x',
        }, right: {
          type: 'NumericLiteral', value: 42,
        },
      },
    },],
  });
})

test("Chained assignment", () => {
  testRun(`x = y = 42;`, {
    type: 'Program', body: [{
      type: 'ExpressionStatement', expression: {
        type: 'AssignmentExpression', operator: '=', left: {
          type: 'Identifier', name: 'x',
        }, right: {
          type: 'AssignmentExpression', operator: '=', left: {
            type: 'Identifier', name: 'y',
          }, right: {
            type: 'NumericLiteral', value: 42,
          },
        },
      },
    },],
  });
})
