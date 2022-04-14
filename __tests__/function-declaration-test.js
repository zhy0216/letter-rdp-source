import {testRun} from "./utils";

test("def 1", () => {
  testRun(
    `

    def square(x) {
      return x * x;
    }


    `,
    {
      type: 'Program',
      body: [
        {
          type: 'FunctionDeclaration',
          name: {
            type: 'Identifier',
            name: 'square',
          },
          params: [
            {
              type: 'Identifier',
              name: 'x',
            },
          ],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: {
                  type: 'BinaryExpression',
                  operator: '*',
                  left: {
                    type: 'Identifier',
                    name: 'x',
                  },
                  right: {
                    type: 'Identifier',
                    name: 'x',
                  },
                },
              },
            ],
          },
        },
      ],
    },
  );
})

test("def 2", () => {
  testRun(
    `

    def empty() {
      return;
    }


    `,
    {
      type: 'Program',
      body: [
        {
          type: 'FunctionDeclaration',
          name: {
            type: 'Identifier',
            name: 'empty',
          },
          params: [],
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ReturnStatement',
                argument: null,
              },
            ],
          },
        },
      ],
    },
  );
})
