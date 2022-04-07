import {testRun} from "./utils";

test("statement list", () => {
  testRun(
      `
      "hello";
  
      42;
  
    `,
      {
        type: 'Program',
        body: [
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'StringLiteral',
              value: 'hello',
            },
          },
          {
            type: 'ExpressionStatement',
            expression: {
              type: 'NumericLiteral',
              value: 42,
            },
          },
        ],
      },
    );
})
