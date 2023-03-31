const mockedEnv = require("mocked-env");
const fs = require("fs");

const index = require(".");
const run = index.run;

let restore;
afterEach(() => {
  jest.clearAllMocks();
  restore();
});

describe("with default GITHUB_WORKSPACE", () => {
  beforeEach(() => {
    restore = mockedEnv({
      GITHUB_WORKSPACE: "/github/workspace",
    });
  });

  test("adds all matchers", () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => true);
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    jest.spyOn(console, "log").mockImplementation();
    run();
    expect(console.log).toBeCalledWith(
      "::add-matcher::.github/phpunit-failure.json"
    );
  });

  test("replaces {{ github_workspace }} correctly", () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => true);
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    jest.spyOn(console, "log").mockImplementation();
    run();
    expect(fs.writeFileSync).toBeCalledWith(
      ".github/phpunit-failure.json",
      `{"problemMatcher":[{"owner":"phpunit-failure","severity":"error","pattern":[{"regexp":"##teamcity\\\\[testFailed.+message='(.+)'.+details='(?:\\\\s|\\\\|n\\\\s)*(?:.+\\\\|n[^'])?/github/workspace/([^:]+):(\\\\d+)[^']+'","message":1,"file":2,"line":3}]}]}`
    );
  });

  test("creates the .github directory if it doesn't exist", () => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    jest.spyOn(fs, "existsSync").mockImplementation(() => false);
    jest.spyOn(fs, "mkdirSync").mockImplementation();
    jest.spyOn(console, "log").mockImplementation();
    run();
    expect(fs.mkdirSync).toBeCalledWith(".github");
  });

  test("does not create the .github directory if it exists", () => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    jest.spyOn(fs, "existsSync").mockImplementation(() => true);
    jest.spyOn(fs, "mkdirSync").mockImplementation();
    jest.spyOn(console, "log").mockImplementation();
    run();
    expect(fs.mkdirSync).not.toBeCalled();
  });
});

describe("with a custom base path", () => {
  beforeEach(() => {
    restore = mockedEnv({
      INPUT_BASE_PATH: "/path/to/tests/in/container",
    });
  });

  test("replaces {{ github_workspace }} correctly", () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => true);
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    jest.spyOn(console, "log").mockImplementation();
    run();
    expect(fs.writeFileSync).toBeCalledWith(
      ".github/phpunit-failure.json",
      `{"problemMatcher":[{"owner":"phpunit-failure","severity":"error","pattern":[{"regexp":"##teamcity\\\\[testFailed.+message='(.+)'.+details='(?:\\\\s|\\\\|n\\\\s)*(?:.+\\\\|n[^'])?/path/to/tests/in/container/([^:]+):(\\\\d+)[^']+'","message":1,"file":2,"line":3}]}]}`
    );
  });
});

describe("regex matches", () => {
  const matchers = index.matchers;
  const phpunitMatcher = matchers["phpunit-failure"];
  const regex = new RegExp(
    phpunitMatcher.regexp.replace("{{GITHUB_WORKSPACE}}", "/path/to")
  );

  [
    {
      name: "passes default output",
      output: `##teamcity[testFailed name='testPushAndPop' message='Failed asserting that 0 matches expected 1.' details=' /path/to/test/ExampleTest.php:16|n ' duration='2' type='comparisonFailure' actual='0' expected='1' flowId='21788']`,
      expected: {
        message: "Failed asserting that 0 matches expected 1.",
        file: "test/ExampleTest.php",
        line: "16",
      },
    },
    {
      name: "passes when message does not have preceding space (PR #16)",
      output: `##teamcity[testFailed name='testName' message='Failed asserting that null is not null.' details='/path/to/test.php:36|n' duration='5' flowId='24753']`,
      expected: {
        message: "Failed asserting that null is not null.",
        file: "test.php",
        line: "36",
      },
    },
    {
      name: "passes when there are multiple files in the details (PR #6)",
      output: `##teamcity[testFailed name='test_users_can_authenticate_using_the_login_screen' message='The user is authenticated|nFailed asserting that true is false.' details=' /path/to/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/InteractsWithAuthentication.php:62|n /path/to/tests/Feature/AuthenticationTest.php:30|n ' duration='207' flowId='2873']`,
      expected: {
        message:
          "The user is authenticated|nFailed asserting that true is false.",
        file: "tests/Feature/AuthenticationTest.php",
        line: "30",
      },
    },
    {
      name: "passes when there is a single file (PR #6)",
      output: `##teamcity[testFailed name='test_users_can_not_authenticate_with_invalid_password' message='The user is not authenticated|nFailed asserting that false is true.' details=' /path/to/tests/Feature/AuthenticationTest.php:43|n ' duration='113' flowId='2873']`,
      expected: {
        message:
          "The user is not authenticated|nFailed asserting that false is true.",
        file: "tests/Feature/AuthenticationTest.php",
        line: "43",
      },
    },
  ].forEach(function (t) {
    test(t.name, () => {
      const actual = t.output.match(regex);

      expect(actual[1]).toBe(t.expected.message);
      expect(actual[2]).toBe(t.expected.file);
      expect(actual[3]).toBe(t.expected.line);
    });
  });
});
