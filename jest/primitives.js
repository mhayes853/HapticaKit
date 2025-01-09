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

  settingsValue(schema) {
    return this.#settings.get(schema.key);
  }

  setSettingsValue(schema, value) {
    this.#settings.set(schema.key, value);
  }

  settingsResetValues(schemas) {
    schemas.forEach((s) => this.#settings.delete(s.key));
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

  registerManifest(manifest) {}
  unregisterManifest() {}

  audioDirectoryWithTransaction(fn) {
    return fn(new MockAudioDirectoryTransaction(this.#audioDirectory));
  }

  reset() {
    this.#settings = new Map();
    this.#keyValueStorage = new Map();
    this.#secureStorage = new Map();
    this.#patterns = [];
    this.#audioDirectory = new Map();
  }
}

const primitives = new MockHapticaPrimitives();

class MockAudioDirectoryTransaction {
  #files;

  constructor(files) {
    this.#files = files;
  }

  savedFiles() {
    return Array.from(this.#files.values()).sort(
      (a, b) => b.lastEditedAt.getTime() - a.lastEditedAt.getTime(),
    );
  }

  savedFilesForPattern(pattern) {
    const paths = new Set(waveformPaths(pattern));
    return this.savedFiles().filter((f) => paths.has(f.filename));
  }

  checkFile(file) {
    if (!this.#files.has(file.filename)) {
      throw HapticaExtensionError.audioFileNotFound(file.filename);
    }
  }

  setFile(file) {
    this.#files.set(file.filename, file);
  }

  deleteFile(file) {
    this.checkFile(file);
    this.#files.delete(file.filename);
  }
}

const waveformPaths = (pattern) => {
  return pattern.Pattern.map((e) => {
    if (!("Event" in e)) return undefined;
    if (e.Event.EventType !== "AudioCustom") return undefined;
    return e.Event.EventWaveformPath;
  }).filter((p) => !!p);
};

class MockAudioFile {
  filename;
  #bytes;
  lastEditedAt;

  get writeScope() {
    return { type: "extension", id: EXTENSION_ID };
  }

  constructor(filename) {
    this.filename = filename;
    this.lastEditedAt = new Date();
  }

  bytes(tx) {
    tx.checkFile(this);
    return this.#bytes;
  }

  save(data, tx) {
    this.#bytes = data;
    this.lastEditedAt = new Date();
    tx.setFile(this);
  }

  delete(tx) {
    tx.deleteFile(this);
  }
}

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

global._hapticaPrimitives = primitives;
global.HapticaAudioFile = MockAudioFile;
global.HAPTICA_APP_VERSION = {
  majorVersion: 1,
  minorVersion: 0,
  patchVersion: 0,
};

beforeEach(() => global._hapticaPrimitives.reset());
