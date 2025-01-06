const uuid = require("uuid");

const EXTENSION_ID = uuid.v7();

class MockHapticaPrimitives {
  #settings = new Map();
  #keyValueStorage = new Map();
  #secureStorage = new Map();
  #patterns = [];
  #audioDirectory = new Map();

  extensionID() {
    return EXTENSION_ID;
  }

  settingsValue(key) {
    return this.#settings.get(key);
  }

  setSettingsValue(key, value) {
    this.#settings.set(key, value);
  }

  settingsResetValues(keys) {
    keys.forEach((k) => this.#settings.delete(k));
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
    this.#audioDirectory = new Map();
  }

  registerManifest(manifest) {}
  unregisterManifest() {}

  audioDirectoryFiles() {
    return Array.from(this.#audioDirectory.values());
  }

  _saveAudioFile(file) {
    this.#audioDirectory.set(file.filename, file);
  }

  _deleteAudioFile(file) {
    if (!this.#audioDirectory.has(file.filename)) {
      throw HapticaExtensionError.audioFileNotFound(file.filename);
    }
    this.#audioDirectory.delete(file.filename);
  }

  audioDirectoryFilesForPattern(pattern) {
    const paths = new Set(waveformPaths(pattern));
    return this.audioDirectoryFiles().filter((f) => paths.has(f.filename));
  }
}

const waveformPaths = (pattern) => {
  return pattern.Pattern.map((e) => {
    if (!("Event" in e)) return undefined;
    if (e.Event.EventType !== "AudioCustom") return undefined;
    return e.Event.EventWaveformPath;
  }).filter((p) => !!p);
};

const primitives = new MockHapticaPrimitives();

const DEFAULT_PATTERN = {
  name: "",
  ahapPattern: { Version: 1, Pattern: [] },
};

class MockPatternsHandle {
  patterns;

  constructor(patterns) {
    this.patterns = structuredClone(patterns);
  }

  fetchPatterns(predicate) {
    return this.patterns
      .filter((p) => {
        return typeof predicate === "function" ? predicate(p) : true;
      })
      .map((p) => ({
        ...p,
        audioFiles: primitives.audioDirectoryFilesForPattern(p.ahapPattern),
      }));
  }

  create(patternCreate) {
    const now = new Date();
    const pattern = {
      ...DEFAULT_PATTERN,
      ...patternCreate,
      id: uuid.v7(),
      createdAt: now,
      lastEditedAt: now,
    };
    this.patterns.push(pattern);
    return {
      ...pattern,
      audioFiles: primitives.audioDirectoryFilesForPattern(pattern.ahapPattern),
    };
  }

  update(patternUpdate) {
    const patternIndex = this.patterns.findIndex(
      (p) => p.id === patternUpdate.id,
    );
    if (patternIndex === -1) {
      return undefined; // NB: _PatternHandle handles the case where the pattern is not found.
    }
    this.patterns[patternIndex] = {
      ...this.patterns[patternIndex],
      ...patternUpdate,
      lastEditedAt: new Date(),
    };
    const pattern = this.patterns[patternIndex];
    return {
      ...pattern,
      audioFiles: primitives.audioDirectoryFilesForPattern(pattern.ahapPattern),
    };
  }

  deletePattern(id) {
    this.patterns = this.patterns.filter((p) => p.id !== id);
  }

  containsPatternWithId(id) {
    return this.patterns.findIndex((p) => p.id === id) !== -1;
  }
}

class MockAudioFile {
  filename;
  #bytes;

  get writeScope() {
    return { type: "extension", id: EXTENSION_ID };
  }

  constructor(filename, bytes) {
    this.filename = filename;
    this.#bytes = bytes;
  }

  bytes() {
    return this.#bytes;
  }

  save() {
    primitives._saveAudioFile(this);
  }

  delete() {
    primitives._deleteAudioFile(this);
  }
}

global._hapticaPrimitives = primitives;
global.HapticaAudioFile = MockAudioFile;

beforeEach(() => global._hapticaPrimitives.reset());
