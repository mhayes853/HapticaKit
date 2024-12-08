const crypto = require("crypto");

const extensionId = crypto.randomUUID();
module.exports._hapticaExtensionID = () => extensionId;

let settings = new Map();
module.exports._hapticaSettingsValue = (key) => settings.get(key);
module.exports._hapticaSetSettingsValue = (key, value) => {
  settings.set(key, value);
};
module.exports._hapticaSettingsResetValues = () => (settings = new Map());

module.exports._hapticaDeviceName = () => "jest-testing-device";
module.exports._hapticaDeviceOSVersion = () => "jest";
