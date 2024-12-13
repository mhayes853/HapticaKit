const crypto = require("crypto");
const { HapticaExtensionError } = require("../index");

const DEFAULT_PATTERN = {
  name: "",
  ahapPattern: { Version: 1, Pattern: [] },
  audioFiles: [],
};

class MockPatternsHandle {
  patterns;

  constructor(patterns) {
    this.patterns = structuredClone(patterns);
  }

  fetchPatterns(predicate) {
    return this.patterns.filter((p) => {
      return typeof predicate === "function" ? predicate(p) : true;
    });
  }

  save(patternSave) {
    const now = new Date();
    if (!patternSave.id) {
      const pattern = {
        ...DEFAULT_PATTERN,
        ...patternSave,
        id: crypto.randomUUID(),
        createdAt: now,
        lastEditedAt: now,
      };
      this.patterns.push(pattern);
      return pattern;
    } else {
      const patternIndex = this.patterns.findIndex(
        (p) => p.id === patternSave.id,
      );
      if (patternIndex === -1) {
        throw HapticaExtensionError.patternWithIdNotFound(patternSave.id);
      }
      this.patterns[patternIndex] = {
        ...this.patterns[patternIndex],
        ...patternSave,
        lastEditedAt: now,
      };
      return this.patterns[patternIndex];
    }
  }

  deletePattern(id) {
    this.patterns = this.patterns.filter((p) => p.id !== id);
  }
}

class _HapticaPrimitives {
  #extensionId = crypto.randomUUID();
  #settings = new Map();
  #keyValueStorage = new Map();
  #secureStorage = new Map();
  #patterns = [];

  extensionID() {
    return this.#extensionId;
  }

  settingsValue(key) {
    return this.#settings.get(key);
  }

  setSettingsValue(key, value) {
    this.#settings.set(key, value);
  }

  settingsResetValues() {
    this.#settings = new Map();
  }

  deviceName() {
    return "test-device";
  }

  deviceOSVersion() {
    return "test";
  }

  deviceHardwareHapticsCompatability() {
    return { isHapticsSupported: true, isAudioSupported: true };
  }

  keyValueStorageValue(key) {
    return this.#keyValueStorage.get(key) ?? undefined;
  }

  keyValueStorageSetValue(key, value) {
    this.#keyValueStorage.set(key, value);
  }

  keyValueStorageRemoveValue(key) {
    this.#keyValueStorage.delete(key);
  }

  secureStorageValue(key) {
    return this.#secureStorage.get(key) ?? undefined;
  }

  secureStorageSetValue(key, value) {
    this.#secureStorage.set(key, value);
  }

  secureStorageRemoveValue(key) {
    this.#secureStorage.delete(key);
  }

  patternsWithTransaction(fn) {
    const handle = new MockPatternsHandle(this.#patterns);
    const value = fn(handle);
    this.#patterns = handle.patterns;
    return value;
  }

  reset() {
    this.#settings = new Map();
    this.#keyValueStorage = new Map();
    this.#secureStorage = new Map();
    this.#patterns = [];
  }

  registerManifest(manifest) {}
  unregisterManifest() {}
}

global._hapticaPrimitives = new _HapticaPrimitives();

beforeEach(() => global._hapticaPrimitives.reset());
