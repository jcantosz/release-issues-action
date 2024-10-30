# GitHub Action: Update Release Description with Linked Issues

This GitHub Action updates the release description with issues linked to pull requests. It fetches all pull requests associated with a release, finds all issues linked to each of those pull requests, and rewrites the release description with the issues associated with each pull request.

## Features

- Fetches all pull requests associated with a release.
- Finds all issues linked to each pull request.
- Updates the release description with the issues associated with each pull request.
- Skips processing if the release description has already been processed.

## Usage

**Note**: Using the GitHub Actions token is generally sufficient to link issue to the pull request. It will handle linking issues from the current repositories as well as issues from other public repositories. If you want to link issues from another private or internal repository, you will need to provide a PAT or GitHub App for authentication

### Inputs

- `github-token`: GitHub token for authentication (optional).
- `github-app-id`: GitHub App ID for authentication (optional).
- `github-private-key`: GitHub Private Key for authentication (optional).
- `github-installation-id`: GitHub Installation ID for authentication (optional).
- `github-repository`: GitHub repository in the format `owner/repo` (required).
- `github_release_tag`: GitHub ref for the release (required).
- `github_api_url`: GitHub API base url (optional).

### Example Workflow

Create a workflow file (e.g., `.github/workflows/update-release.yml`) in your repository:

```yaml
name: Update Release Description

on:
  release:
    types: [created]

permissions:
  contents: write
  issues: read

jobs:
  update-release-description:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Update Release Description with Linked Issues
        uses: jcantosz/release-issues-action@main # Use the action defined in the repository
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          github_repository: ${{ github.repository }}
          github_release_tag: ${{ github.ref }}
```

## Local Development

Setup:

1. `npm install`
1. Copy `local.env.tmpl` to `local.env` and update the values
1. `. ./local.env && node index.`

Packaging:

- `npm build`
