import { createAuthClient } from '@neon/auth';
import { BetterAuthReactAdapter } from '@neon/auth/react/adapters';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL
  || 'https://ep-steep-moon-bec5otr3.neonauth.c-9.us-east-2.aws.neon.tech/neondb/auth';

export const authClient = createAuthClient(authUrl, {
  adapter: BetterAuthReactAdapter(),
});
