// src/app/types/google.d.ts
interface GoogleAccounts {
  id: {
    initialize: (config: GoogleSignInConfig) => void;
    prompt: () => void;
  };
}

interface GoogleSignInConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface Google {
  accounts: GoogleAccounts;
}

declare global {
  interface Window {
    google?: Google;
  }
}