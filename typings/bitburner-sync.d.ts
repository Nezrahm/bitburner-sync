interface SyncConfig {
    scriptRoot: string;
    authToken: string;
}

interface UploadPayload {
    action: 'CREATE' | 'UPDATE' | 'UPSERT' | 'DELETE';
    filename: string;
    code?: string;
    authToken: string;
}

interface ConfigResult {
    opts: SyncConfig;
    doWatch: boolean;
    isDryRun: boolean;
}
