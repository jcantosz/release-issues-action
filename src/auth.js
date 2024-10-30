import * as core from "@actions/core";
import { Octokit } from "@octokit/core";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { paginateGraphQL } from "@octokit/plugin-paginate-graphql";
import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";
import { createAppAuth } from "@octokit/auth-app";

const MyOctokit = Octokit.plugin(paginateGraphQL, paginateRest, retry, throttling);

export function createOctokit({ token, appId, privateKey, installationId, baseURL }) {
  if (!token && (!appId || !privateKey || !installationId)) {
    throw new Error("Either a personal access token or GitHub App credentials must be provided");
  }

  const auth = token
    ? { auth: token }
    : {
        authStrategy: createAppAuth,
        auth: {
          appId,
          privateKey,
          installationId,
        },
      };

  // use spread operator to merge JSON
  return new MyOctokit({
    ...auth,
    ...{
      baseUrl: baseURL,
      userAgent: "changelogs-issue-action/v1.0.0",
      log: core.isDebug() ? console : null,
      throttle: {
        onRateLimit: (retryAfter, options, octokit, retryCount) => {
          octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);

          if (retryCount < 1) {
            // only retries once
            octokit.log.info(`Retrying after ${retryAfter} seconds!`);
            return true;
          }
        },
        onSecondaryRateLimit: (retryAfter, options, octokit) => {
          // does not retry, only logs a warning
          octokit.log.warn(`SecondaryRateLimit detected for request ${options.method} ${options.url}`);
        },
        onAbuseLimit: (retryAfter, options) => {
          console.warn(`Abuse detected for request ${options.method} ${options.url}`);
          return true;
        },
      },
    },
  });
}
