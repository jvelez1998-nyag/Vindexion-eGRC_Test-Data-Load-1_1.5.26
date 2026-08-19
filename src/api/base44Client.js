import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "692986447eb88b2b4e8cb53f", 
  requiresAuth: true // Ensure authentication is required for all operations
});
