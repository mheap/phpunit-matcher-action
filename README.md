# phpunit-matcher-action

This action uses the built in PHPUnit `--teamcity` formatter to add annotations to your Github Actions builds.

![PHPUnit Action Matcher Logs Example](https://github.com/mheap/phpunit-matcher-action/blob/master/phpunit-matcher-logs.png?raw=true)

![PHPUnit Action Matcher Context Example](https://github.com/mheap/phpunit-matcher-action/blob/master/phpunit-matcher-context.png?raw=true)

## Usage

To configure these matchers, add the following step to your workflow YAML file before running PHPUnit with the `--teamcity` flag.

```yaml
- name: Configure matchers
  uses: mheap/phpunit-matcher-action@master
```

Here's a complete workflow example (located at `.github/workflows/phpunit.yml`) that runs your tests and adds annotations for failures

```yaml
name: PHPUnit
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Composer dependencies
      run: composer install --no-ansi --no-interaction --no-scripts --no-suggest --no-progress --prefer-dist
    - name: Configure matchers
      uses: mheap/phpunit-matcher-action@v1
    - name: Run Tests
      run: ./vendor/bin/phpunit --teamcity test
```

## How this works

[Problem matchers](https://github.com/actions/toolkit/blob/master/docs/problem-matchers.md) work by defining a regular expression to extract information such as the file, line number and severity from any output logs. Each matcher has to be registered with Github Actions by adding `::add-matcher::/path/to/matcher.json` to the output.

This action generates regular expressions based on the Github workspace, writes out matcher files and then registers them with the Action runner.

It uses the Teamcity output as it contains all of the required information (file path, failure message and line number).
