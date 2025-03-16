export class ActionError extends Error {
  constructor (action: string, message: string) {
    super(`${action} failed: ${message}`)
  }
}

export class ApiKeyNotFoundError extends ActionError {
  constructor (message: string) {
    super('api-key-not-found', message)
    this.name = 'ApiKeyNotFoundError'
  }
}

export class NoAuthorizedApiKeyError extends ActionError {
  constructor (message: string) {
    super('no-authorized-api-key', message)
    this.name = 'NoAuthorizedApiKeyError'
  }
}

export class GithubTokenNotFoundError extends ActionError {
  constructor (message: string) {
    super('github-token-not-found', message)
    this.name = 'GithubTokenNotFoundError'
  }
}

export class GithubRepoNameNotFoundError extends ActionError {
  constructor (message: string) {
    super('github-repo-name-not-found', message)
    this.name = 'GithubRepoNameNotFoundError'
  }
}

export class GithubCommitShaNotFoundError extends ActionError {
  constructor (message: string) {
    super('github-commit-sha-not-found', message)
    this.name = 'GithubCommitShaNotFoundError'
  }
}

export class GithubAssigneeNotFoundError extends ActionError {
  constructor (message: string) {
    super('github-assignee-not-found', message)
    this.name = 'GithubAssigneeNotFoundError'
  }
}
