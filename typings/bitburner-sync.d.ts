interface SyncConfig {
    scriptRoot: string;
    authToken: string;
    allowDelete: boolean;
    serverUrl: string;
}

interface ConfigResult {
    config: SyncConfig;
    doWatch: boolean;
    doGet: boolean;
    isDryRun: boolean;
}

interface UploadPayload {
    action: 'CREATE' | 'UPDATE' | 'UPSERT';
    filename: string;
    code: string;
    authToken: string;
}

interface DeletePayload {
    filename: string;
    authToken: string;
}

interface BitburnerFiles {
    filename: string;
    code: string;
    ramUsage: number;
}
