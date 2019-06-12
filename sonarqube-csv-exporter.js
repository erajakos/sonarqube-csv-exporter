"use strict";

const fs = require("fs");
const { Parser } = require("json2csv");

const args = process.argv.slice(2);

if (args.length == 0) {
  console.error("Provide filepath to SonarQube json result file");
  process.exit(1);
}

const filePath = args[0];

fs.readFile(filePath, (err, data) => {
  if (err) {
    throw err;
  }

  const results = JSON.parse(data);

  if (!results.issues) {
    throw "No issues were found in the json file.";
  }

  const severityRank = ["INFO", "MINOR", "MAJOR", "CRITICAL", "BLOCKER"];
  const issues = results.issues.sort((a, b) => {
    const severityA = severityRank.indexOf(a.severity);
    const severityB = severityRank.indexOf(b.severity);

    if (severityB === severityA) {
      return a.rule.toLowerCase() > b.rule.toLowerCase() ? 1 : -1;
    } else {
      return severityB > severityA ? 1 : -1;
    }
  });
  const groupedIssues = groupIssuesByRule(issues);
  const resultset = generateResultset(groupedIssues);

  const fields = ["rule", "exampleMessage", "component", "severity"];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(resultset);
  process.stdout.write(csv);
  process.exit();
});

function groupIssuesByRule(issues) {
  return issues.reduce((r, a) => {
    r[a.rule] = r[a.rule] || [];
    r[a.rule].push(a);
    return r;
  }, Object.create(null));
}

function generateResultset(groupedIssues) {
  const rules = Object.keys(groupedIssues);
  const resultset = rules.map(rule => {
    return {
      rule,
      component: findComponentOccurrences(groupedIssues[rule]),
      severity: groupedIssues[rule][0].severity,
      exampleMessage: groupedIssues[rule][0].message
    };
  });
  return resultset;
}

function findComponentOccurrences(issues) {
  let occurrences = {};
  issues.forEach(issue => {
    if (!occurrences[issue.component]) {
      occurrences[issue.component] = [issue.line];
    } else {
      occurrences[issue.component].push(issue.line);
    }
  });

  const lines = Object.keys(occurrences).map(occurrence => {
    const lineNumbers = occurrences[occurrence].join(", ");
    const filename = occurrence.split(":")[1];
    return `* ${filename} : [${lineNumbers}]`;
  });

  return lines.join("\n");
}
