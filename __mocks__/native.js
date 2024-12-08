const crypto = require("crypto");

let extensionId = crypto.randomUUID();
module.exports._hapticaExtensionID = () => extensionId;
