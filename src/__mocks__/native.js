const crypto = require("crypto");
const { HapticaExtensionError } = require("../error");

const extensionId = crypto.randomUUID();
module.exports._hapticaExtensionID = () => extensionId;

let settings = new Map();
module.exports._hapticaSettingsValue = (key) => settings.get(key);
module.exports._hapticaSetSettingsValue = (key, value) => {
  settings.set(key, value);
};
module.exports._hapticaSettingsResetValues = () => (settings = new Map());

module.exports._hapticaDeviceName = () => "test-device";
module.exports._hapticaDeviceOSVersion = () => "test";

let keyValueStorage = new Map();
beforeEach(() => (keyValueStorage = new Map()));
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
beforeEach(() => (secureStorage = new Map()));
module.exports._hapticaSecureStorageValue = (key) => {
  return secureStorage.get(key) ?? undefined;
};
module.exports._hapticaSecureStorageSetValue = (key, value) => {
  secureStorage.set(key, value);
};
module.exports._hapticaSecureStorageRemoveValue = (key) => {
  secureStorage.delete(key);
};

let _patterns = [];
beforeEach(() => (_patterns = []));

const DEFAULT_PATTERN = {
  name: "",
  ahapPattern: { Version: 1, Pattern: [] },
  audioFiles: [],
};

const mockPatternsHandle = () => {
  let patterns = structuredClone(_patterns);
  return {
    patterns: patterns,
    fetchPatterns: (predicate) => {
      return patterns.filter((p) => {
        return typeof predicate === "function" ? predicate(p) : true;
      });
    },
    save: (patternSave) => {
      const now = new Date();
      if (!patternSave.id) {
        const pattern = {
          ...DEFAULT_PATTERN,
          ...patternSave,
          id: crypto.randomUUID(),
          createdAt: now,
          lastEditedAt: now,
        };
        patterns.push(pattern);
        return pattern;
      } else {
        const patternIndex = patterns.findIndex((p) => p.id === patternSave.id);
        if (patternIndex === -1) {
          throw HapticaExtensionError.patternWithIdNotFound(patternSave.id);
        }
        patterns[patternIndex] = {
          ...patterns[patternIndex],
          ...patternSave,
          lastEditedAt: now,
        };
        return patterns[patternIndex];
      }
    },
    deletePattern: (id) => {
      patterns = patterns.filter((p) => p.id !== id);
    },
  };
};

module.exports._hapticaPatternsWithTransaction = (fn) => {
  const handle = mockPatternsHandle();
  const value = fn(handle);
  _patterns = handle.patterns;
  return value;
};
