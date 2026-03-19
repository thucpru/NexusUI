/** Direction of code synchronisation between NexusUI and GitHub */
export declare enum SyncDirection {
    PUSH = "PUSH",
    PULL = "PULL",
    BIDIRECTIONAL = "BIDIRECTIONAL"
}
/** Current state of a sync operation */
export declare enum SyncStatus {
    IDLE = "IDLE",
    SYNCING = "SYNCING",
    SUCCESS = "SUCCESS",
    CONFLICT = "CONFLICT",
    FAILED = "FAILED"
}
/** A user's GitHub App installation connection */
export interface GitHubConnection {
    id: string;
    userId: string;
    projectId: string;
    /** GitHub App installation ID */
    installationId: string;
    /** GitHub repository full name (owner/repo) */
    repoFullName: string;
    /** Branch to sync from/to */
    defaultBranch: string;
    syncDirection: SyncDirection;
    status: SyncStatus;
    lastSyncedAt?: Date;
    lastSyncError?: string;
    createdAt: Date;
    updatedAt: Date;
}
/** Summary of a single sync event */
export interface SyncEvent {
    id: string;
    connectionId: string;
    direction: SyncDirection;
    status: SyncStatus;
    filesChanged: number;
    commitSha?: string;
    errorMessage?: string;
    createdAt: Date;
}
//# sourceMappingURL=github-types.d.ts.map