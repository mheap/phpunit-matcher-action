const fs = require("fs");

const matchers = {
  "phpunit-failure": {
    regexp:
      "##teamcity\\[testFailed.+message='(.+)'.+details='(?:\\s|\\|n\\s)*(?:.+\\|n[^'])?{{GITHUB_WORKSPACE}}/([^:]+):(\\d+)[^']+'",
    defaultSeverity: "error",
    message: 1,
    file: 2,
    line: 3,
  },
  "php-native-error": {
    regexp:
      "##teamcity\\[testFailed.+message='Test code or tested code printed unexpected output:(?:\\s|\\|n\\s)*(.*error):\\s+(.+) in {{GITHUB_WORKSPACE}}/(.+) on line (\\d+)",
    defaultSeverity: "error",
    code: 1,
    message: 2,
    file: 3,
    line: 4,
  },
  "php-native-warning": {
    regexp:
      "##teamcity\\[testFailed.+message='Test code or tested code printed unexpected output:(?:\\s|\\|n\\s)*(.*Warning|.*Deprecated|.*Notice):\\s+(.+) in {{GITHUB_WORKSPACE}}/(.+) on line (\\d+)",
    defaultSeverity: "warning",
    code: 1,
    message: 2,
    file: 3,
    line: 4,
  },    
};

function run() {
  const workspaceRoot =
    process.env.INPUT_BASE_PATH || process.env.GITHUB_WORKSPACE || "";

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
}

if (require.main === module) {
  run();
}

module.exports = {
  matchers,
  run,
};
