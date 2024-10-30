export async function getRelease(owner, repo, releaseTag, octokit) {
  const releaseResponse = await octokit.graphql(
    `
    query($owner: String!, $repo: String!, $releaseTag: String!) {
      repository(owner: $owner, name: $repo) {
        release(tagName: $releaseTag) {
          tagName
          description
          databaseId
          url
        }
      }
    }
  `,
    {
      owner,
      repo,
      releaseTag,
    }
  );

  return releaseResponse.repository.release;
}
