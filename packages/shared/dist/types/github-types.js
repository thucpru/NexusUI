/** Direction of code synchronisation between NexusUI and GitHub */
export var SyncDirection;
(function (SyncDirection) {
    SyncDirection["PUSH"] = "PUSH";
    SyncDirection["PULL"] = "PULL";
    SyncDirection["BIDIRECTIONAL"] = "BIDIRECTIONAL";
})(SyncDirection || (SyncDirection = {}));
/** Current state of a sync operation */
export var SyncStatus;
(function (SyncStatus) {
    SyncStatus["IDLE"] = "IDLE";
    SyncStatus["SYNCING"] = "SYNCING";
    SyncStatus["SUCCESS"] = "SUCCESS";
    SyncStatus["CONFLICT"] = "CONFLICT";
    SyncStatus["FAILED"] = "FAILED";
})(SyncStatus || (SyncStatus = {}));
//# sourceMappingURL=github-types.js.map