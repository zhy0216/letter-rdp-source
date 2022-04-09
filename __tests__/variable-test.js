import {testRun} from "./utils";

test("Simple variable declaration", () => {
    testRun(`let x = 42;`, {
      type: 'Program',
      body: [
        {
          type: 'VariableStatement',
          declarations: [
            {
              type: 'VariableDeclaration',
              id: {
                type: 'Identifier',
                name: 'x',
              },
              init: {
                type: 'NumericLiteral',
                value: 42,
              },
            },
          ],
        },
      ],
    });
})

test("Variable declaration, no init", () => {
  testRun(`let x;`, {
    type: 'Program',
    body: [
      {
        type: 'VariableStatement',
        declarations: [
          {
            type: 'VariableDeclaration',
            id: {
              type: 'Identifier',
              name: 'x',
            },
            init: null,
          },
        ],
      },
    ],
  });
})

test("Multiple variable declarations, no init", () => {
  testRun(`let x, y;`, {
    type: 'Program',
    body: [
      {
        type: 'VariableStatement',
        declarations: [
          {
            type: 'VariableDeclaration',
            id: {
              type: 'Identifier',
              name: 'x',
            },
            init: null,
          },
          {
            type: 'VariableDeclaration',
            id: {
              type: 'Identifier',
              name: 'y',
            },
            init: null,
          },
        ],
      },
    ],
  });
})

test("Multiple variable declarations", () => {
  testRun(`let x, y = 42;`, {
    type: 'Program',
    body: [
      {
        type: 'VariableStatement',
        declarations: [
          {
            type: 'VariableDeclaration',
            id: {
              type: 'Identifier',
              name: 'x',
            },
            init: null,
          },
          {
            type: 'VariableDeclaration',
            id: {
              type: 'Identifier',
              name: 'y',
            },
            init: {
              type: 'NumericLiteral',
              value: 42,
            },
          },
        ],
      },
    ],
  });
})
