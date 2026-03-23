export const environment = {
    production: false,
//    webAPI: 'https://argozenware.com/dev/backend/api/',
webAPI: 'https://localhost:7050/api/',

    msalConfig: {
         auth: {
            clientId: 'b65e275c-ca73-4aac-b3e3-fd74c0658fd8',
            authority: 'https://login.microsoftonline.com/02157777-a391-40f4-b293-125e2aee9f72'
        }
/*
        auth: {
            clientId: '4ef23981-3c3f-49a5-8e58-419ed530d5bb',
            authority: 'https://login.microsoftonline.com/02157777-a391-40f4-b293-125e2aee9f72'
        }*/
    },
    apiConfig: {
        scopes: ['user.read'],
        uri: 'https://graph.microsoft.com/v1.0/me'
    },
    CLOUD_NAME: "walla-pe",
    UPLOAD_PRESET: "zenware",
};
