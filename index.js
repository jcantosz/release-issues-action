import * as core from "@actions/core";
import { getInputs } from "./src/getInputs.js";
import { createOctokit } from "./src/auth.js";
import { getRelease } from "./src/getRelease.js";
import { parsePullRequestUrls } from "./src/parsePullRequestUrls.js";
import { getIssuesFromPullRequests } from "./src/getIssuesFromPullRequests.js";
import { updateReleaseDescription } from "./src/updateReleaseDescription.js";

const processedMarker = "<!--processed-->";

async function main() {
  try {
    core.info("Starting the process to update the release description with linked issues.");

    const { token, appId, privateKey, installationId, baseURL, owner, repo, releaseTag } = getInputs();
    core.debug(`Inputs received: owner=${owner}, repo=${repo}, releaseTag=${releaseTag}`);
    core.debug(
      `Auth received: token=${token}, appId=${appId}, privateKey=${privateKey} installationId=${installationId}, baseURL=${baseURL}`
    );

    const octokit = createOctokit({ token, appId, privateKey, installationId, baseURL });
    core.info("Octokit instance created.");

    const release = await getRelease(owner, repo, releaseTag, octokit);
    if (!release || !release.description) throw new Error("Failed to fetch release or release description is empty");
    core.info("Fetched release information.");

    if (release.description.includes(processedMarker)) {
      core.info(`Release ${releaseTag} description already processed. Skipping.`);
      core.notice(`Release ${releaseTag} already processed. Skipped`);
      return;
    }

    const pullRequestUrls = parsePullRequestUrls(release.description);
    if (!pullRequestUrls || pullRequestUrls.length === 0)
      throw new Error("No pull request URLs found in release description");
    core.info(`Found ${pullRequestUrls.length} pull request URLs in the release description.`);

    const issuesByPullRequest = await getIssuesFromPullRequests(pullRequestUrls, octokit);
    core.info("Fetched issues linked to pull requests.");

    let newBody = processedMarker + "\n\n" + release.description;
    pullRequestUrls.forEach((url, index) => {
      const issues = issuesByPullRequest[index];
      if (issues.length > 0) {
        const issueDescriptions = issues.map((issue) => `  * ${issue.title} (${issue.url})`).join("\n");
        newBody = newBody.replace(url, `${url}\n${issueDescriptions}`);
        core.debug(`Added linked issues for pull request URL: ${url}`);
      }
    });

    await updateReleaseDescription(octokit, owner, repo, release.databaseId, newBody);
    core.info("Release description updated successfully.");
    core.info(`See updated release here: ${release.url}`);
    core.summary.addRaw(`Updated release [${releaseTag}](${release.url}) with issue links.`);
    core.summary.write();
  } catch (error) {
    core.setFailed(`Error updating release description: ${error.message}`);
  }
}

main();
