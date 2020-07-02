const Checklist = require('./checklist')

const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path')

async function run() {
  try {

    const mappingFile = core.getInput('mappingFile')
    console.log('mappingFile: ' + mappingFile)

    const filePath = path.resolve(mappingFile)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const mappings = data.mappings
    console.log('keyword to comment mappings found: ')
    console.log(mappings)

    const token = process.env.GITHUB_TOKEN || ''
    const octokit = new github.GitHub(token)
    const context = github.context;

    const prResponse = await octokit.pulls.get({
      pull_number: context.payload.pull_request.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      headers: {accept: "application/vnd.github.v3.diff"}
    });
    const prDiff = prResponse.data;
    console.log('Pull request diff:')
    console.log(prDiff)
    console.log('----------------')

    const onlyAddedLines = Checklist.getOnlyAddedLines(prDiff);
    console.log('Newly added lines:')
    console.log(onlyAddedLines)

    const checklist = Checklist.getFinalChecklist(onlyAddedLines, mappings);

    if (checklist && checklist.trim().length > 0) {
      console.log('checklist: ' + checklist)
      octokit.issues.createComment({
        issue_number: context.payload.pull_request.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: checklist
      })
    } else {
      console.log("No dynamic checklist was created based on code difference and mapping file")
    }

    core.setOutput('checklist', checklist);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
