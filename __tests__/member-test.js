import {testRun} from "./utils";


test("x.y", () => {
  testRun(
    `

    x.y;

    `,
    {
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'MemberExpression',
            computed: false,
            object: {
              type: 'Identifier',
              name: 'x',
            },
            property: {
              type: 'Identifier',
              name: 'y',
            },
          },
        },
      ],
    },
  );
})

test("x.y = 1", () => {
  testRun(
    `

    x.y = 1;

    `,
    {
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: {
              type: 'MemberExpression',
              computed: false,
              object: {
                type: 'Identifier',
                name: 'x',
              },
              property: {
                type: 'Identifier',
                name: 'y',
              },
            },
            right: {
              type: 'NumericLiteral',
              value: 1,
            },
          },
        },
      ],
    },
  );
})

test("x[0] = 1", () => {
  testRun(
    `

    x[0] = 1;

    `,
    {
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: {
              type: 'MemberExpression',
              computed: true,
              object: {
                type: 'Identifier',
                name: 'x',
              },
              property: {
                type: 'NumericLiteral',
                value: 0,
              },
            },
            right: {
              type: 'NumericLiteral',
              value: 1,
            },
          },
        },
      ],
    },
  );
})

test("a.b.c['d']", () => {
  testRun(
    `

    a.b.c['d'];

    `,
    {
      type: 'Program',
      body: [
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'MemberExpression',
            computed: true,
            object: {
              type: 'MemberExpression',
              computed: false,
              object: {
                type: 'MemberExpression',
                computed: false,
                object: {
                  type: 'Identifier',
                  name: 'a',
                },
                property: {
                  type: 'Identifier',
                  name: 'b',
                },
              },
              property: {
                type: 'Identifier',
                name: 'c',
              },
            },
            property: {
              type: 'StringLiteral',
              value: 'd',
            },
          },
        },
      ],
    },
  );
})
