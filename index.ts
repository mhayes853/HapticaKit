declare global {
  interface SymbolConstructor {
    _hapticaPrivate: Symbol;
  }
}

Symbol._hapticaPrivate = Symbol("_hapticaPrivate");

function _hapticaInternalConstructorCheck(key: Symbol) {
  if (key !== Symbol._hapticaPrivate) {
    throw new TypeError("Illegal constructor");
  }
}

/**
 * An Error subclass thrown by APIs that serve haptica extensions.
 */
export class HapticaExtensionError extends Error {
  private constructor(message: string) {
    super(message);
  }

  /**
   * Thrown when registering a manifest more than once.
   */
  static MANIFEST_ALREADY_REGISTERED = new HapticaExtensionError(
    "A manifest has already been registered. You cannot register a manifest more than once. If you wish to reset the extension, call `extension.reset`.",
  );

  /**
   * Thrown when the manifest has not been registered.
   */
  static MANIFEST_NOT_REGISTERED = new HapticaExtensionError(
    "The manifest has not been registered.",
  );

  /**
   * Thrown when attempting to set a value for a non-existent setting name.
   */
  static settingNameNotFound(name: string, validNames: string[]) {
    return new HapticaExtensionError(
      `'${name}' is not a valid setting name. Valid names are ${validNames.join(", ")}.`,
    );
  }

  /**
   * Thrown when attempting to set a wrongly typed value for a setting name.
   */
  static invalidSettingNameType(
    name: string,
    type: string,
    expectedType: string,
  ) {
    return new HapticaExtensionError(
      `'${type}' is not a valid type for setting '${name}'. Expected '${expectedType}'.`,
    );
  }

  static patternWithIdNotFound(id: HapticaPatternID) {
    return new HapticaExtensionError(`Pattern with id '${id}' was not found.`);
  }
}

/**
 * Parameter ids that can be used for haptic events.
 */
const AHAP_HAPTIC_PARAMETER_IDS = [
  "HapticIntensity",
  "HapticSharpness",
  "AttackTime",
  "DecayTime",
  "ReleaseTime",
  "Sustained",
] as const;

/**
 * A parameter id that can be used for haptic events.
 */
export type AHAPHapticParameterID = (typeof AHAP_HAPTIC_PARAMETER_IDS)[number];

/**
 * Parameter ids that can be used for audio events.
 */
const AHAP_AUDIO_PARAMETER_IDS = [
  "AudioVolume",
  "AudioPan",
  "AudioPitch",
  "AudioBrightness",
] as const;

/**
 * A parameter id that can be used for audio events.
 */
export type AHAPAudioParameterID = (typeof AHAP_AUDIO_PARAMETER_IDS)[number];

/**
 * A parameter id for an {@link AHAPEvent}.
 */
export type AHAPEventParameterID = AHAPHapticParameterID | AHAPAudioParameterID;

/**
 * A parameter id with its associated value.
 */
export type AHAPEventParameter<ID extends AHAPEventParameterID> = {
  ParameterID: ID;
  ParameterValue: number;
};

type AHAPBaseEvent<Event> = Event & { Time: number };

/**
 * A haptic transient event from CoreHaptics.
 */
export type AHAPHapticTransientEvent = AHAPBaseEvent<{
  EventType: "HapticTransient";
  EventDuration?: number;
  EventParameters: AHAPEventParameter<AHAPHapticParameterID>[];
}>;

/**
 * A haptic continuous event from CoreHaptics.
 */
export type AHAPHapticContinuousEvent = AHAPBaseEvent<{
  EventType: "HapticContinuous";
  EventParameters: AHAPEventParameter<AHAPHapticParameterID>[];
  EventDuration: number;
}>;

/**
 * An audio custom event from CoreHaptics.
 */
export type AHAPAudioCustomEvent = AHAPBaseEvent<{
  EventType: "AudioCustom";
  EventWaveformPath: string;
  EventDuration?: number;
  EventWaveformLoopEnabled?: boolean;
  EventWaveformUseVolumeEnvelope?: boolean;
  EventParameters: AHAPEventParameter<AHAPAudioParameterID>[];
}>;

/**
 * An audio continuous event from CoreHaptics.
 */
export type AHAPAudioContinuousEvent = AHAPBaseEvent<{
  EventType: "AudioContinuous";
  EventDuration: number;
  EventWaveformUseVolumeEnvelope?: boolean;
  EventParameters: AHAPEventParameter<AHAPAudioParameterID>[];
}>;

/**
 * A type of haptic event to be played at a specified moment in time.
 */
export type AHAPEvent =
  | AHAPHapticTransientEvent
  | AHAPHapticContinuousEvent
  | AHAPAudioCustomEvent
  | AHAPAudioContinuousEvent;

/**
 * All possible paramater ids that can be used with an {@link AHAPParameterCurve}.
 */
const AHAP_CURVABLE_PARAMETER_IDS = [
  "HapticIntensityControl",
  "HapticSharpnessControl",
  "AudioVolumeControl",
  "AudioPanControl",
  "AudioPitchControl",
  "AudioBrightnessControl",
] as const;

/**
 * A parameter id for {@link AHAPParameterCurve}s.
 */
export type AHAPCurvableParameterID =
  (typeof AHAP_CURVABLE_PARAMETER_IDS)[number];

/**
 * All possible paramater ids that can be used with an {@link AHAPDynamicParameter}.
 */
const AHAP_DYNAMIC_PARAMETER_IDS = [
  ...AHAP_CURVABLE_PARAMETER_IDS,
  "HapticAttackTimeControl",
  "HapticDecayTimeControl",
  "HapticReleaseTimeControl",
  "AudioAttackTimeControl",
  "AudioDecayTimeControl",
  "AudioReleaseTimeControl",
] as const;

/**
 * A parameter id for {@link AHAPDynamicParameter}s.
 */
export type AHAPDynamicParameterID =
  (typeof AHAP_DYNAMIC_PARAMETER_IDS)[number];

/**
 * A value that alters the playback of haptic event parameters at a particular time.
 *
 * For interpolation of parameter values over time, see {@link AHAPParameterCurve}.
 */
export type AHAPDynamicParameter = {
  ParameterID: AHAPDynamicParameterID;
  ParameterValue: number;
  Time: number;
};

/**
 * A type that controls the change in a haptic parameter value using a key-frame system.
 *
 * For altering parameter values at a particular point see {@link AHAPDynamicParameter}.
 */
export type AHAPParameterCurve = {
  ParameterID: AHAPCurvableParameterID;
  Time: number;
  ParameterCurveControlPoints: AHAPParameterCurveControlPoint[];
};

/**
 * A control point for a {@link AHAPParameterCurve}.
 */
export type AHAPParameterCurveControlPoint = {
  ParameterValue: number;
  Time: number;
};

/**
 * An element in an {@link AHAPPattern}.
 */
export type AHAPPatternElement =
  | { Event: AHAPEvent }
  | { Parameter: AHAPDynamicParameter }
  | { ParameterCurve: AHAPParameterCurve };

/**
 * A type for a haptic pattern.
 *
 * Haptic patterns are composed of events and parameters. See {@link AHAPEvent},
 * {@link AHAPDynamicParameter}, and {@link AHAPParameterCurve} for more.
 */
export type AHAPPattern = {
  Version: 1;
  Metadata?: Record<string, any>;
  Pattern: AHAPPatternElement[];
};

export type DeviceHapticsHardwareCompatability = {
  isHapticsSupported: boolean;
  isAudioSupported: boolean;
};

export type HapticaPatternID = string;

export interface HapticaAudioFileConstructor {
  /**
   * Constructs an {@link HapticaAudioFile}.
   *
   * @param filename The name of the file.
   * @param data The audio data.
   */
  new (filename: string, data: Uint8Array): HapticaAudioFile;
}

export interface HapticaAudioFile {
  /**
   * The filename of this file.
   */
  get filename(): string;

  /**
   * Synchronously loads the bytes of this file.
   */
  bytes(): Uint8Array;
}

declare global {
  /**
   * An audio file from the app.
   */
  var HapticaAudioFile: HapticaAudioFileConstructor;
}

/**
 * A haptics pattern.
 */
export type HapticaPattern = {
  /**
   * The id of the pattern.
   */
  id: HapticaPatternID;

  /**
   * A name for the pattern.
   */
  name: string;

  /**
   * The AHAP Pattern data.
   */
  ahapPattern: AHAPPattern;

  /**
   * An array of audio waveform files that are played with the pattern.
   */
  audioFiles: HapticaAudioFile[];

  /**
   * The creation date of the pattern.
   */
  createdAt: Date;

  /**
   * The time that the pattern was last edited by the user.
   */
  lastEditedAt: Date;
};

/**
 * Properties for creating an {@link HapticaPattern}.
 */
export type HapticaPatternCreate = Omit<
  HapticaPattern,
  "id" | "createdAt" | "lastEditedAt"
>;

/**
 * Properties for saving an {@link HapticaPattern}.
 */
export type HapticaPatternUpdate = Partial<HapticaPatternCreate> & {
  id: HapticaPatternID;
};

/**
 * An interface for fetching, editing, and deleting haptic patterns owned by your extension.
 *
 * You get an instance of this interface by calling `withTransaction` on {@link HapticaPatterns}.
 */
export interface HapticaPatternsHandle {
  /**
   * Loads the stored patterns of this extension.
   *
   * @param predicate A function to filter each pattern.
   * @returns All the patterns stored by this extension.
   */
  fetchPatterns(
    predicate?: (pattern: HapticaPattern) => boolean,
  ): HapticaPattern[];

  /**
   * Creates and returns a new {@link HapticaPattern}.
   *
   * @param pattern An {@link HapticaPatternCreate}.
   */
  create(pattern: HapticaPatternCreate): HapticaPattern;

  /**
   * Saves and returns the updated {@link HapticaPattern}.
   *
   * @param pattern An {@link HapticaPatternUpdate}.
   */
  update(pattern: HapticaPatternUpdate): HapticaPattern;

  /**
   * Deletes the pattern with the specified id.
   *
   * @param id The id of the pattern to delete.
   */
  deletePattern(id: HapticaPatternID): void;

  /**
   * Returns true if a pattern with the specified id is stored.
   *
   * @param id The id of the pattern.
   */
  containsPatternWithId(id: HapticaPatternID): boolean;
}

class _PatternHandle implements HapticaPatternsHandle {
  constructor(private readonly primitiveHandle: HapticaPatternsHandle) {}

  fetchPatterns(
    predicate?: (pattern: HapticaPattern) => boolean,
  ): HapticaPattern[] {
    return this.primitiveHandle.fetchPatterns(predicate);
  }

  create(pattern: HapticaPatternCreate): HapticaPattern {
    return this.primitiveHandle.create(pattern);
  }

  update(pattern: HapticaPatternUpdate): HapticaPattern {
    if (!this.containsPatternWithId(pattern.id)) {
      throw HapticaExtensionError.patternWithIdNotFound(pattern.id);
    }
    return this.primitiveHandle.update(pattern);
  }

  deletePattern(id: HapticaPatternID): void {
    return this.primitiveHandle.deletePattern(id);
  }

  containsPatternWithId(id: HapticaPatternID): boolean {
    return this.primitiveHandle.containsPatternWithId(id);
  }
}

/**
 * A class for your extension's haptic pattern storage.
 *
 * Do not construct instances of this class. Instead, use the `patterns` property.
 */
export class HapticaPatterns {
  constructor(key: Symbol) {
    _hapticaInternalConstructorCheck(key);
  }

  /**
   * Runs a transaction with the scope of the specified function.
   *
   * Do not escape `handle` from the context of the lambda function, doing so causes undefined behavior.
   *
   * @param fn A function to run with exclusive access to the patterns storage.
   * @returns Whatever `fn` returns.
   */
  async withTransaction<T>(fn: (handle: HapticaPatternsHandle) => T) {
    return await _hapticaPrimitives.patternsWithTransaction((nativeHandle) => {
      return fn(new _PatternHandle(nativeHandle));
    });
  }
}

/**
 * Haptic pattern storage for your extension.
 *
 * Your extension has the ability to save and edit haptic patterns for your users, and your users
 * will know that the patterns are owned by your extension.
 *
 * Your extension can only access or edit haptic patterns that it stores on behalf of users, it
 * *does not* get access to all of the user's haptic patterns.
 *
 * You access your extension's pattern storage by calling `withTransaction`, which gives you an
 * exclusive transaction to load, edit, and save haptic patterns.
 * ```ts
 * await patterns.withTransaction((handle) => {
 *   // No id was specified, this will create a new haptic pattern.
 *   const pattern = handle.save({
 *     name: "My Haptic Pattern",
 *     ahapPattern: ahapPatternData
 *   })
 *   handle.save({
 *     id: pattern.id, // Specifying an ID  will edit the existing pattern.
 *     name: "Updated Haptic Pattern"
 *   })
 *   return handle.fetchPatterns() // Returns all patterns that your extension owns.
 * })
 * ```
 */
const patterns = new HapticaPatterns(Symbol._hapticaPrivate);

/**
 * A class for retrieving device info.
 *
 * You can access an instance of this class via the `device` property.
 */
export class Device {
  /**
   * The model name of the user's device.
   */
  get name() {
    return _hapticaPrimitives.deviceName();
  }

  /**
   * The os version of the user's device.
   */
  get osVersion() {
    return _hapticaPrimitives.deviceOSVersion();
  }

  /**
   * The hardware haptic compatability of the user's device.
   */
  get hapticHardwareCompatability(): DeviceHapticsHardwareCompatability {
    return _hapticaPrimitives.deviceHardwareHapticsCompatability();
  }

  constructor(key: Symbol) {
    _hapticaInternalConstructorCheck(key);
  }
}

/**
 * The user's device.
 */
const device = new Device(Symbol._hapticaPrivate);

/**
 * A class for extension key value storage.
 *
 * Do not construct instances of this class, use the `keyValueStorage` property instead.
 */
export class KeyValueStorage {
  constructor(key: Symbol) {
    _hapticaInternalConstructorCheck(key);
  }

  /**
   * Returns the value for the specified key or undefined if no value exists.
   */
  value(key: string) {
    return _hapticaPrimitives.keyValueStorageValue(key);
  }

  /**
   * Sets the value for the specified key.
   */
  setValue(key: string, value: string) {
    _hapticaPrimitives.keyValueStorageSetValue(key, value);
  }

  /**
   * Removes the value for the specified key.
   */
  removeValue(key: string) {
    _hapticaPrimitives.keyValueStorageRemoveValue(key);
  }
}

/**
 * Key Value storage for your extension.
 *
 * The storage is unencrypted, and you should not use it to store sensitive values. If you need
 * encryption to store sensitive values, use `secureStorage` instead.
 */
const keyValueStorage = new KeyValueStorage(Symbol._hapticaPrivate);

/**
 * A class for encrypted key value storage.
 *
 * Do not construct instances of this class, use the `secureStorage` property instead.
 */
export class SecureStorage {
  constructor(key: Symbol) {
    _hapticaInternalConstructorCheck(key);
  }

  /**
   * Returns the value for the specified key or undefined if no value exists.
   */
  value(key: string) {
    return _hapticaPrimitives.secureStorageValue(key);
  }

  /**
   * Sets the value for the specified key.
   */
  setValue(key: string, value: string) {
    _hapticaPrimitives.secureStorageSetValue(key, value);
  }

  /**
   * Removes the value for the specified key.
   */
  removeValue(key: string) {
    _hapticaPrimitives.secureStorageRemoveValue(key);
  }
}

/**
 * Secure key value storage for your extension that uses the keychain to store sensitive values.
 */
const secureStorage = new SecureStorage(Symbol._hapticaPrivate);

export type HapticaExtensionSettingsValue =
  | string
  | number
  | boolean
  | undefined
  | string[]
  | Record<string, string>;

/**
 * A change in a settings value.
 */
export type HapticaExtensionSettingsChange = {
  /**
   * The name of the changed settings value.
   */
  name: string;

  /**
   * The new value.
   */
  newValue: HapticaExtensionSettingsValue;

  /**
   * The previous value.
   */
  previousValue: HapticaExtensionSettingsValue;
};

export type HapticaExtensionSettingsValidationResult =
  | { status: "success" }
  | { status: "error"; message: string };

type BaseSettingsSchema<Value extends HapticaExtensionSettingsValue> = {
  /**
   * The unique name of the settings value.
   */
  name: string;

  /**
   * A display name for the settings value that gets displayed on the extension settings screen.
   */
  displayName?: string;

  /**
   * A title that gets displayed for the form section of this setting on the extension settings
   * screen.
   */
  displayTitle?: string;

  /**
   * A description for this setting that gets displayed on the extension settings screen.
   */
  description?: string;

  /**
   * The default value for this setting.
   */
  defaultValue: Value;

  /**
   * A function to validate the settings value when the user decides to change it.
   *
   * @param value The new prospective value.
   * @returns An {@link HapticaExtensionSettingsValidationResult}.
   */
  validate?: (value: Value) => HapticaExtensionSettingsValidationResult;
};

/**
 * A schema for describing settings value.
 *
 * Users change the settings for your extension on the extensions settings screen. You can use this
 * type to determine the UI and type for a settings value.
 */
export type HapticaExtensionSettingsSchema =
  | ({
      type: "toggle";
    } & BaseSettingsSchema<boolean>)
  | ({ type: "text-field" } & BaseSettingsSchema<string | undefined>)
  | ({ type: "number" } & BaseSettingsSchema<number>)
  | ({ type: "list" } & BaseSettingsSchema<string[]>)
  | ({ type: "dictionary" } & BaseSettingsSchema<Record<string, string>>);

/**
 * A class for reading and editing the settings for your extension.
 *
 * You don't construct instances of this class, instead you call `extension.settings()` to retrieve
 * the settings for your extension.
 */
export class HapticaExtensionSettings {
  constructor(
    readonly schemas: HapticaExtensionSettingsSchema[],
    key: Symbol,
  ) {
    _hapticaInternalConstructorCheck(key);
  }

  /**
   * Returns the value for the settings name.
   *
   * @param settingName The settings name that was used in the `settingsSchemas` of your extension's manifest.
   * @returns The value for the settings name.
   */
  value(settingName: string): HapticaExtensionSettingsValue {
    this.checkSettingName(settingName);
    const nativeValue = _hapticaPrimitives.settingsValue(settingName);
    if (nativeValue !== undefined) return nativeValue;
    return this.schemas.find((s) => s.name === settingName)?.defaultValue;
  }

  /**
   * Sets the value for the settings name.
   *
   * @param settingName The settings name that was used in the `settingsSchemas` of your extension's manifest.
   * @param value The value to set for the setting.
   */
  setValue(settingName: string, value: HapticaExtensionSettingsValue) {
    const schema = this.checkSettingName(settingName);
    this.checkValueType(settingName, schema.type, value);
    _hapticaPrimitives.setSettingsValue(settingName, value, schema.type);
  }

  /**
   * Returns true if the setting name is in the `settingsSchemas` of your extension's manifest.
   *
   * @param settingName A setting name.
   */
  has(settingName: string) {
    return !!this.schemas.find((s) => s.name === settingName);
  }

  /**
   * Resets all settings to their default values.
   *
   * @param Specific keys or keys to reset. By default, all keys are reset.
   */
  reset(keys?: string | string[]) {
    const keysToReset =
      typeof keys === "undefined"
        ? this.schemas.map((s) => s.name)
        : typeof keys === "string"
          ? [keys]
          : keys;
    _hapticaPrimitives.settingsResetValues(keysToReset);
  }

  private checkSettingName(name: string) {
    const schema = this.schemas.find((s) => s.name === name);
    if (schema) return schema;
    throw HapticaExtensionError.settingNameNotFound(
      name,
      this.schemas.map((s) => s.name),
    );
  }

  private checkValueType(
    name: string,
    type: HapticaExtensionSettingsSchema["type"],
    value: HapticaExtensionSettingsValue,
  ) {
    if (type === "number" && typeof value !== "number") {
      throw HapticaExtensionError.invalidSettingNameType(
        name,
        typeof value,
        "number",
      );
    } else if (
      type === "text-field" &&
      !(typeof value === "string" || typeof value === "undefined")
    ) {
      throw HapticaExtensionError.invalidSettingNameType(
        name,
        typeof value,
        "string | undefined",
      );
    } else if (type === "list" && Array.isArray(value)) {
      throw HapticaExtensionError.invalidSettingNameType(
        name,
        typeof value,
        "string[]",
      );
    } else if (type === "toggle" && typeof value !== "boolean") {
      throw HapticaExtensionError.invalidSettingNameType(
        name,
        typeof value,
        "boolean",
      );
    } else if (type === "dictionary" && typeof value !== "object") {
      throw HapticaExtensionError.invalidSettingNameType(
        name,
        typeof value,
        "Record<string, string>",
      );
    }
  }
}

export type HapticaExtensionID = string;

/**
 * A type describing the capabilities of a Haptica Extension.
 *
 * You register instances of this object like so:
 * ```ts
 * extension.registerManifest({
 *   name: "My Extension",
 *   description: "This is a cool extension",
 *   onLoadPatterns: async () => {
 *     // Fetch haptic patterns to display in the app...
 *   }
 * })
 * ```
 */
export type HapticaExtensionManifest = {
  /**
   * The name of this extension.
   */
  name: string;

  /**
   * A description of this extension.
   */
  description?: string;

  /**
   * The author of this extension.
   */
  author?: string;

  /**
   * A description of the settings of this extension.
   */
  settingsSchemas?: HapticaExtensionSettingsSchema[];

  /**
   * A callback the runs whenever the user changes your extension's settings.
   *
   * @param changes A list of {@link HapticaExtensionSettingsChange}s.
   */
  onSettingsChanged?: (
    changes: HapticaExtensionSettingsChange[],
  ) => Promise<void>;

  /**
   * A callback that runs whenever the extension has been loaded by the app.
   */
  onExtensionLoaded?: () => Promise<void>;

  /**
   * A callback that runs when your extension has been deleted by the user.
   *
   * You can use this callback to perform any cleanup work that your extension needs on deletion.
   */
  onExtensionDeleted?: () => Promise<void>;

  /**
   * A callback that runs whenever the user creates a new haptic pattern.
   *
   * @param pattern The name and id of the newly created pattern.
   */
  onPatternCreated?: (
    pattern: Pick<HapticaPattern, "id" | "name">,
  ) => Promise<void>;

  /**
   * A callback the runs when the user shares a haptic pattern with your extension.
   *
   * @param pattern An {@link HapticaPattern}.
   */
  onPatternShared?: (pattern: HapticaPattern) => Promise<void>;

  /**
   * A callback that runs whenever the user has deleted a haptic pattern.
   *
   * @param pattern An {@link HapticaPattern}.
   */
  onPatternDeleted?: (pattern: HapticaPattern) => Promise<void>;
};

/**
 * A class representing a Haptica Extension.
 *
 * You do not construct instances of this class. Instead, use the global {@link extension} instance.
 */
export class HapticaExtension {
  private _manifest?: HapticaExtensionManifest;
  private _settings?: HapticaExtensionSettings;

  /**
   * The unique identifier for this extension.
   */
  get id(): HapticaExtensionID {
    return _hapticaPrimitives.extensionID();
  }

  /**
   * The registered {@link HapticaExtensionManifest}, if `registerManifest` has been called.
   */
  get manifest() {
    return this._manifest;
  }

  /**
   * The {@link HapticaExtensionSettings} for your extension.
   */
  get settings() {
    if (!this._settings) {
      throw HapticaExtensionError.MANIFEST_NOT_REGISTERED;
    }
    return this._settings;
  }

  /**
   * True if an {@link HapticaExtensionManifest} has been registered.
   */
  get isManifestRegistered() {
    return !!this.manifest;
  }

  constructor(key: Symbol) {
    _hapticaInternalConstructorCheck(key);
  }

  /**
   * Registers the manifest for this extension.
   *
   * A manifest can only be registered once. If you attempt to register a manifest twice, then
   * {@link HapticaExtensionError.MANIFEST_ALREADY_REGISTERED} will be thrown.
   *
   * If you wish to replace the manifest, you can call `reset` to unregister the current
   * manifest, and then you can register the new manifest by calling this method again.
   *
   * @param manifest See {@link HapticaExtensionManifest}.
   */
  registerManifest(manifest: HapticaExtensionManifest) {
    if (this.isManifestRegistered) {
      throw HapticaExtensionError.MANIFEST_ALREADY_REGISTERED;
    }
    _hapticaPrimitives.registerManifest(manifest);
    this._manifest = manifest;
    this._settings = new HapticaExtensionSettings(
      manifest.settingsSchemas ?? [],
      Symbol._hapticaPrivate,
    );
  }

  /**
   * Resets this extension.
   */
  reset() {
    _hapticaPrimitives.unregisterManifest();
    this._manifest = undefined;
    this._settings?.reset();
  }
}

/**
 * An object containing core properties to this extension.
 */
const extension = new HapticaExtension(Symbol._hapticaPrivate);

export {
  device,
  patterns,
  keyValueStorage,
  secureStorage,
  extension,
  AHAP_AUDIO_PARAMETER_IDS,
  AHAP_HAPTIC_PARAMETER_IDS,
  AHAP_DYNAMIC_PARAMETER_IDS,
  AHAP_CURVABLE_PARAMETER_IDS,
};
