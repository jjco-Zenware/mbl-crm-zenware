export const environment = {
    production: true,
    /*PRODUCCIÓN*/
    //webAPI: 'https://sigzenware.com/bac/api/',

    /*DESARROLLO*/
    //webAPI: 'https://zenwareadmin-001-site3.rtempurl.com/bac/api/',
    webAPI: 'https://localhost:7050/api/',
    msalConfig: {
        /*PRODUCCIÓN*/
        // auth: {
        //     clientId: 'b65e275c-ca73-4aac-b3e3-fd74c0658fd8',
        //     authority: 'https://login.microsoftonline.com/02157777-a391-40f4-b293-125e2aee9f72'
        // }
        
        /*DESARROLLO*/
        auth: {
            clientId: 'ffe8b473-e4f7-4107-9f29-6ae05838f1e2',
            authority: 'https://login.microsoftonline.com/02157777-a391-40f4-b293-125e2aee9f72'
        }
       
    },
    apiConfig: {
        scopes: ['user.read'],
        uri: 'https://graph.microsoft-ppe.com/v1.0/me'
    },
    CLOUD_NAME: "walla-pe",
    UPLOAD_PRESET: "zenware",
};
