export async function updateReleaseDescription(octokit, owner, repo, releaseId, newBody) {
  // No graphQL mutation to update a release, must use REST
  await octokit.request("PATCH /repos/{owner}/{repo}/releases/{release_id}", {
    owner: owner,
    repo: repo,
    release_id: releaseId,
    body: newBody,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}
