import {testRun} from "./utils";

test("block 1", () => {
  testRun(
    `

    {
      42;

      "hello";
    }

  `,
    {
      type: 'Program',
      body: [
        {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'NumericLiteral',
                value: 42,
              },
            },

            {
              type: 'ExpressionStatement',
              expression: {
                type: 'StringLiteral',
                value: 'hello',
              },
            },
          ],
        },
      ],
    },
  );
})

// Empty block:
test("block 2", () => {

  testRun(
    `

    {

    }

  `,
    {
      type: 'Program',
      body: [
        {
          type: 'BlockStatement',
          body: [],
        },
      ],
    },
  );
})


test("block 3", () => {

  // Nested blocks:
  testRun(
    `
  
      {
        42;
        {
          "hello";
        }
      }
  
    `,
    {
      type: 'Program',
      body: [
        {
          type: 'BlockStatement',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'NumericLiteral',
                value: 42,
              },
            },
            {
              type: 'BlockStatement',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'StringLiteral',
                    value: 'hello',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  );
})
