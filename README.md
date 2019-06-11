# Sonarqube CSV result exporter

## What is this?

This is a NodeJS script that groups all the issues in SonarQube result file (json) based on the message 
and occurrencies on components.

## Usage

Export SonarQube results in a json file running sonar scanner with following parameters.

```
-Dsonar.analysis.mode=preview -Dsonar.report.export.path=sonar-report.json
```

The report file is saved under .scannerwork folder

Export the csv

node path/to/sonar-report.json > sonar-report.csv
