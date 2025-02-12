

export class NotFoundEnvVarError extends Error {
  constructor(envVar: string) {
    super(`Environment variable ${envVar} not found`)
  }
}