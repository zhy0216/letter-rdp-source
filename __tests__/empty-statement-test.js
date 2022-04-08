import {testRun} from "./utils";

test("empty statement", () => {
  testRun(';', {
      type: 'Program',
      body: [
        {
          type: 'EmptyStatement',
        },
      ],
    });
})
