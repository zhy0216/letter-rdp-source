import {testRun} from "./utils";

test("foo(x)", () => {
  testRun(
    `foo(x);`,

    {
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'foo',
            },
            arguments: [
              {
                type: 'Identifier',
                name: 'x',
              },
            ],
          },
        },
      ],
    },
  );
})

test("foo(x)()", () => {
  testRun(
    `foo(x)();`,

    {
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'foo',
              },
              arguments: [
                {
                  type: 'Identifier',
                  name: 'x',
                },
              ],
            },
            arguments: [],
          },
        },
      ],
    },
  );
})

test("console.log(x, y)", () => {
  testRun(
    `console.log(x, y);`,

    {
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: {
                type: 'Identifier',
                name: 'console',
              },
              property: {
                type: 'Identifier',
                name: 'log',
              },
            },
            arguments: [
              {
                type: 'Identifier',
                name: 'x',
              },
              {
                type: 'Identifier',
                name: 'y',
              },
            ],
          },
        },
      ],
    },
  );
})
