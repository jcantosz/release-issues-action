export function parsePullRequestUrls(description) {
  return description.match(/https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/\d+/g);
}

export function parsePullRequestUrl(url) {
  return url.match(/https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
}
