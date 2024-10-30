import * as core from "@actions/core";

export function getInputs() {
  const token = core.getInput("github_token");
  const appId = core.getInput("github_app_id");
  const privateKey = core.getInput("github_private_key");
  const installationId = core.getInput("github_installation_id");
  const baseURL = core.getInput("github_api_url") || "https://api.github.com";
  const [owner, repo] = core.getInput("github_repository", { required: true }).split("/");
  const releaseTag = core.getInput("github_release_tag", { required: true }).split("/").pop();

  if (!token && (!appId || !privateKey || !installationId)) {
    throw new Error("Either a personal access token or GitHub App credentials must be provided");
  }
  if (!owner || !repo) {
    throw new Error("GITHUB_REPOSITORY is not set correctly");
  }
  if (!releaseTag) {
    throw new Error("GITHUB_REF is not set correctly");
  }

  return { token, appId, privateKey, installationId, baseURL, owner, repo, releaseTag };
}
