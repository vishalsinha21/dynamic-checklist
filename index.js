const Checklist = require('./checklist')

const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path')

async function run() {
  try {

    const mappingFile = core.getInput('mappingFile')
    core.info('mappingFile: ' + mappingFile)

    const filePath = path.resolve(mappingFile)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const mappings = data.mappings
    core.info('keyword to comment mappings found:')
    core.info(mappings)

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
    core.debug('Pull request diff:')
    core.debug('----------------')
    core.debug(prDiff)
    core.debug('----------------')

    const onlyAddedLines = Checklist.getOnlyAddedLines(prDiff);
    core.debug('Newly added lines:')
    core.debug('----------------')
    core.debug(onlyAddedLines)
    core.debug('----------------')

    const checklist = Checklist.getFinalChecklist(onlyAddedLines, mappings);
    if (checklist && checklist.trim().length > 0) {
      octokit.issues.createComment({
        issue_number: context.payload.pull_request.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: checklist
      })
    } else {
      core.info("No dynamic checklist was created based on code difference and mapping file")
    }

    core.setOutput('checklist', checklist);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
