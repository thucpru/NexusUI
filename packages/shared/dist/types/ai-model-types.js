/** Supported AI provider integrations */
export var AIModelProvider;
(function (AIModelProvider) {
    AIModelProvider["ANTHROPIC"] = "ANTHROPIC";
    AIModelProvider["OPENAI"] = "OPENAI";
    AIModelProvider["GOOGLE"] = "GOOGLE";
    AIModelProvider["MISTRAL"] = "MISTRAL";
    AIModelProvider["CUSTOM"] = "CUSTOM";
})(AIModelProvider || (AIModelProvider = {}));
/** Availability status for an AI model */
export var AIModelStatus;
(function (AIModelStatus) {
    AIModelStatus["ACTIVE"] = "ACTIVE";
    AIModelStatus["INACTIVE"] = "INACTIVE";
    AIModelStatus["DEPRECATED"] = "DEPRECATED";
})(AIModelStatus || (AIModelStatus = {}));
//# sourceMappingURL=ai-model-types.js.map