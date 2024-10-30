import * as core from "@actions/core";
import { parsePullRequestUrl } from "./parsePullRequestUrls.js";

export async function getIssuesFromPullRequests(pullRequestUrls, octokit) {
  let issuesByPullRequest = [];

  for (const url of pullRequestUrls) {
    const [, prOwner, prRepo, prNumber] = parsePullRequestUrl(url);

    core.info(`Fetching issues linked to pull request: ${url}`);

    const pullResponse = await octokit.graphql(
      `
      query($prOwner: String!, $prRepo: String!, $prNumber: Int!) {
        repository(owner: $prOwner, name: $prRepo) {
          pullRequest(number: $prNumber) {
            closingIssuesReferences(first: 10) {
              nodes {
                number
                title
                url
              }
            }
          }
        }
      }
    `,
      {
        prOwner,
        prRepo,
        prNumber: parseInt(prNumber),
      }
    );

    issuesByPullRequest.push(pullResponse.repository.pullRequest.closingIssuesReferences.nodes);
    core.debug(
      `Found ${pullResponse.repository.pullRequest.closingIssuesReferences.nodes.length} issues for pull request ${prNumber}`
    );
  }

  return issuesByPullRequest;
}
