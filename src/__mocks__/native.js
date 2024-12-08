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

let keyValueStorage = new Map();
module.exports._hapticaKeyValueStorageValue = (key) => {
  return keyValueStorage.get(key) ?? undefined;
};
module.exports._hapticaKeyValueStorageSetValue = (key, value) => {
  keyValueStorage.set(key, value);
};
module.exports._hapticaKeyValueStorageRemoveValue = (key) => {
  keyValueStorage.delete(key);
};

let secureStorage = new Map();
module.exports._hapticaSecureStorageValue = (key) => {
  return secureStorage.get(key) ?? undefined;
};
module.exports._hapticaSecureStorageSetValue = (key, value) => {
  secureStorage.set(key, value);
};
module.exports._hapticaSecureStorageRemoveValue = (key) => {
  secureStorage.delete(key);
};
