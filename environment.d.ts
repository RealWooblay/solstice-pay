declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // Server
            PRIVY_APP_SECRET: string;
            
            X_API_KEY: string;
            X_API_SECRET: string;
            X_BEARER_TOKEN: string;

            // Client
            NEXT_PUBLIC_PRIVY_APP_ID: string;
            NEXT_PUBLIC_PRIVY_CLIENT_ID: string;
        }
    }
}

export { }