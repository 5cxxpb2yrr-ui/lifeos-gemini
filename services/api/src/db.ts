export interface Config { port: number; host: string; token: string; origins: string[]; surrealUrl: string }

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 8787),
    host: env.HOST ?? '0.0.0.0',
    token: env.API_TOKEN ?? '',
    origins: (env.ALLOWED_ORIGIN ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    surrealUrl: env.SURREAL_URL ?? 'surrealkv://./data/lifeos',
  };
}
