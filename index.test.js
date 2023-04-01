const mockedEnv = require("mocked-env");
const fs = require("fs");

const run = require(".");

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
      `{"problemMatcher":[{"owner":"phpunit-failure","severity":"error","pattern":[{"regexp":"##teamcity\\\\[testFailed.+message='(.+)'.+details='(?:\\\\s|\\\\|n\\\\s)*(?:.+\\\\|n[^'])?/github/workspace/([^:]+):(\\\\d+)[^']+'","message":1,"file":2,"line":3}]}]}`    );
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
      `{"problemMatcher":[{"owner":"phpunit-failure","severity":"error","pattern":[{"regexp":"##teamcity\\\\[testFailed.+message='(.+)'.+details='(?:\\\\s|\\\\|n\\\\s)*(?:.+\\\\|n[^'])?/path/to/tests/in/container/([^:]+):(\\\\d+)[^']+'","message":1,"file":2,"line":3}]}]}`    );
  });
});
