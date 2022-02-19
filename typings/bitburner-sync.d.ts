interface SyncConfig {
    scriptRoot: String;
    authToken: String;
}

interface UploadPayload {
    action: 'CREATE' | 'UPDATE' | 'UPSERT' | 'DELETE';
    filename: String;
    code?: String;
    authToken: String;
}
