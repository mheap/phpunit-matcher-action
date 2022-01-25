const fs = require("fs");

module.exports = function () {
  const workspaceRoot =
    process.env.INPUT_BASE_PATH || process.env.GITHUB_WORKSPACE || "";
  const matchers = {
    "phpunit-failure": {
      regexp:
        "##teamcity\\[testFailed.+message='(.+)'.+details='\\s+{{GITHUB_WORKSPACE}}/([^:]+):(\\d+)[^']+'",
      defaultSeverity: "error",
      message: 1,
      file: 2,
      line: 3,
    },
  };

  for (let matcher in matchers) {
    const details = matchers[matcher];
    const problemMatcher = {
      problemMatcher: [
        {
          owner: matcher,
          severity: details.defaultSeverity,
          pattern: [
            {
              regexp: details.regexp.replace(
                "{{GITHUB_WORKSPACE}}",
                workspaceRoot
              ),
              message: details.message,
              file: details.file,
              line: details.line,
            },
          ],
        },
      ],
    };

    if (!fs.existsSync(".github")) {
      fs.mkdirSync(".github");
    }

    fs.writeFileSync(`.github/${matcher}.json`, JSON.stringify(problemMatcher));
    console.log(`::add-matcher::.github/${matcher}.json`);
  }
};

if (require.main === module) {
  module.exports();
}
