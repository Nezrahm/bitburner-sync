interface BitburnerConfig {
    schema: string;
    url: string;
    port: number;
    fileURI: string;
    validFileExtensions: string[];
    authToken: string;
}

interface SyncConfig {
    bitburner: BitburnerConfig;
    scriptRoot: string;
    allowDelete: boolean;
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
    bitburner: BitburnerConfig;
}

interface DeletePayload {
    filename: string;
    bitburner: BitburnerConfig;
}

interface BitburnerFiles {
    filename: string;
    code: string;
    ramUsage: number;
}
