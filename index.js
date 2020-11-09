const fs = require('fs');

const matchers = {
  "phpunit-failure": {
      "regexp": "##teamcity\\[testFailed.+message='(.+)'.+details='\\s+{{GITHUB_WORKSPACE}}/([^:]+):(\\d+)[^']+'",
      "defaultSeverity": "error",
      "message": 1,
      "file": 2,
      "line": 3
  }
};

for (let matcher in matchers) {
    const details = matchers[matcher];
    const problemMatcher = {
      "problemMatcher": [ {
        "owner": matcher,
        "severity": details.defaultSeverity,
        "pattern": [{
          "regexp": details.regexp.replace("{{GITHUB_WORKSPACE}}", process.env.GITHUB_WORKSPACE || ''),
          "message": details.message,
          "file": details.file,
          "line": details.line
        }]
      }]
    }

  fs.writeFileSync(`.github/${matcher}.json`, JSON.stringify(problemMatcher));
  console.log(`::add-matcher::.github/${matcher}.json`);
}
