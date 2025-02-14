declare global {
  interface SymbolConstructor {
    _hapticaPrivate: Symbol;
  }
}

Symbol._hapticaPrivate = Symbol("_hapticaPrivate");

const _hapticaInternalConstructorCheck = (key: Symbol) => {
  if (key !== Symbol._hapticaPrivate) {
    throw new TypeError("Illegal constructor");
  }
};

export const _hapticaAHAPJSONParseReviver = (key: string, object: any) => {
  if (key === "EventWaveformPath") {
    return HapticaAudioFileID.parse(object) ?? object;
  }
  return object;
};

export const _hapticaAHAPJSONStringifyReplacer = (key: string, object: any) => {
  if (key === "EventWaveformPath" && typeof object === "string") {
    return new HapticaAudioFileID(object).toJSON();
  }
  return object;
};

/**
 * A data type describing a version of the app.
 *
 * You can get the current app version using the {@link HAPTICA_APP_VERSION} constant.
 */
export type HapticaAppVersion = {
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
};

export type HapticaExtensionErrorCode =
  | "ManifestAlreadyRegistered"
  | "ManifestNotRegistered"
  | "SettingNameNotFound"
  | "InvalidSettingValue"
  | "PatternWithIdNotFound"
  | "AudioFileNotFound"
  | "InvalidResourcePermissions";

/**
 * An Error subclass thrown by APIs that serve haptica extensions.
 */
export class HapticaExtensionError extends Error {
  /**
   * The error code associated with this error.
   */
  code: HapticaExtensionErrorCode;

  constructor(code: HapticaExtensionErrorCode, message: string) {
    super(message);
    this.code = code;
  }

  /**
   * Thrown when registering a manifest more than once.
   */
  static MANIFEST_ALREADY_REGISTERED = new HapticaExtensionError(
    "ManifestAlreadyRegistered",
    "A manifest has already been registered. You cannot register a manifest more than once. If you wish to reset the extension, call `extension.reset`.",
  );

  /**
   * Thrown when the manifest has not been registered.
   */
  static MANIFEST_NOT_REGISTERED = new HapticaExtensionError(
    "ManifestNotRegistered",
    "The manifest has not been registered.",
  );

  /**
   * Thrown when attempting to set a value for a non-existent setting name.
   */
  static settingNameNotFound(name: string, validNames: string[]) {
    return new HapticaExtensionError(
      "SettingNameNotFound",
      `'${name}' is not a valid setting name. Valid names are ${validNames.join(", ")}.`,
    );
  }

  /**
   * Thrown when attempting to set a wrongly typed value for a setting name.
   */
  static invalidSetting(name: string, errorMessage: string) {
    return new HapticaExtensionError(
      "InvalidSettingValue",
      `Invalid value passed for setting ${name}: ${errorMessage}`,
    );
  }

  /**
   * Thrown when attempting to operate on an {@link HapticaPattern} with an ID that does not exist.
   */
  static patternWithIdNotFound(id: HapticaPatternID) {
    return new HapticaExtensionError(
      "PatternWithIdNotFound",
      `Pattern with id '${id}' was not found.`,
    );
  }

  /**
   * Thrown when attempting to delete an {@link HapticaAudioFile} that does not exist in the
   * file system
   */
  static audioFileNotFound(name: string) {
    return new HapticaExtensionError(
      "AudioFileNotFound",
      `Audio file named ${name} was not found.`,
    );
  }

  /**
   * Thrown when attempting to modify or delete an {@link HapticaAudioFile} that this extension is
   * not permitted to modify.
   */
  static audioFileInvalidPermissions(
    name: string,
    owner: HapticaResourceOwner,
  ) {
    if (owner.type === "main-application") {
      return new HapticaExtensionError(
        "InvalidResourcePermissions",
        `Cannot save or delete ${name} from this extension. ${name} is owned by the main application; your extension only has read-only access to the file.`,
      );
    }
    return new HapticaExtensionError(
      "InvalidResourcePermissions",
      `Cannot save or delete ${name} from this extension. ${name} is owned by another extension with id ${owner.id}; your extension only has read-only access to the file.`,
    );
  }

  /**
   * Thrown when attempting to modify or delete an {@link HapticaPattern} that this extension is
   * not permitted to modify.
   */
  static hapticPatternInvalidPermissions(
    name: string,
    owner: HapticaResourceOwner,
  ) {
    if (owner.type === "main-application") {
      return new HapticaExtensionError(
        "InvalidResourcePermissions",
        `Cannot update or delete ${name} from this extension. ${name} is owned by the main application; your extension only has read-only access to the pattern.`,
      );
    }
    return new HapticaExtensionError(
      "InvalidResourcePermissions",
      `Cannot update or delete ${name} from this extension. ${name} is owned by another extension with id ${owner.id}; your extension only has read-only access to the pattern.`,
    );
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

export type AHAPWaveformPath = string | HapticaAudioFileID;

/**
 * An audio custom event from CoreHaptics.
 */
export type AHAPAudioCustomEvent = AHAPBaseEvent<{
  EventType: "AudioCustom";
  EventWaveformPath: AHAPWaveformPath;
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

/**
 * A type for describing a device's hardware support for haptics.
 */
export type DeviceHapticsHardwareCompatability = {
  /**
   * Whether or not haptic feedback is supported by the hardware.
   */
  isFeedbackSupported: boolean;

  /**
   * Whether or not the haptics engine can play audio alongside feedback.
   */
  isAudioSupported: boolean;
};

/**
 * A descriptor for the level of access that this extension has for a resource.
 */
enum HapticaResourceAccessLevel {
  NoAccess = 0,
  ReadOnly = 1,
  ReadWrite = 2,
}

export type HapticaPatternID = string;

export interface HapticaAudioFileConstructor {
  /**
   * Constructs an {@link HapticaAudioFile}.
   *
   * @param filename The name or {@link HapticaAudioFileID} of the file.
   */
  new (filename: string | HapticaAudioFileID): HapticaAudioFile;
}

/**
 * An owner of a resource managed by the app.
 */
export type HapticaResourceOwner =
  | {
      /**
       * The resource is owned by the main application.
       */
      type: "main-application";
    }
  | {
      /**
       * The resource is owned by an extension.
       */
      type: "extension";

      /**
       * The id of the extension that owns the resource.
       */
      id: HapticaExtensionID;
    };

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
   * The creation date of the pattern.
   */
  createdAt: Date;

  /**
   * The time that the pattern was last edited by the user.
   */
  lastEditedAt: Date;

  /**
   * The level of access that this extension has to the resource.
   */
  accessLevel: HapticaResourceAccessLevel;

  /**
   * The owner of the pattern.
   */
  owner: HapticaResourceOwner;
};

/**
 * Properties for creating an {@link HapticaPattern}.
 */
export type HapticaPatternCreate = Pick<HapticaPattern, "name" | "ahapPattern">;

/**
 * Properties for saving an {@link HapticaPattern}.
 */
export type HapticaPatternUpdate = Partial<HapticaPatternCreate> & {
  id: HapticaPatternID;
};

/**
 * An interface for fetching, editing, and deleting haptic patterns the have been shared with
 * your extension.
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
   * Your extension must be the owner of the pattern, otherwise a permissions error will be thrown.
   *
   * @param pattern An {@link HapticaPatternUpdate}.
   */
  update(pattern: HapticaPatternUpdate): HapticaPattern;

  /**
   * Deletes the pattern with the specified id.
   *
   * Your extension must be the owner of the pattern, otherwise a permissions error will be thrown.
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

class _HapticaPatternsHandle implements HapticaPatternsHandle {
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
   * The transaction has a timeout of 1 second. Any accesses to the patterns storage after the 1
   * second mark without starting a new transaction will result in an error being thrown.
   *
   * @param fn A function to run with exclusive access to the patterns storage.
   * @returns Whatever `fn` returns.
   */
  async withTransaction<T>(fn: (handle: HapticaPatternsHandle) => T) {
    return await _hapticaPrimitives.patternsWithTransaction((nativeHandle) => {
      return fn(new _HapticaPatternsHandle(nativeHandle));
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
 * A transaction for the audio files directory.
 */
export interface HapticaAudioFilesDirectoryTransaction {
  /**
   * Loads all saved {@link HapticaAudioFile}s that this extension has access to.
   */
  savedFiles(): HapticaAudioFile[];

  /**
   * Loads all {@link HapticaAudioFile}s specified as waveform paths in `pattern`.
   *
   * @param pattern An {@link AHAPPattern}.
   * @returns All {@link HapticaAudioFile}s associated with `pattern`.
   */
  savedFilesForPattern(pattern: AHAPPattern): HapticaAudioFile[];
}

/**
 * A class for managing the extension's stored audio files.
 */
export class HapticaAudioFilesDirectory {
  constructor(key: Symbol) {
    _hapticaInternalConstructorCheck(key);
  }

  /**
   * Runs a transaction on the audio files directory.
   *
   * The transaction has a timeout of 1 second. Any accesses to the directory after the 1 second
   * mark without starting a new transaction will result in an error being thrown.
   *
   * @param fn The function to run the transaction with exclusive access to the audio files directory.
   * @returns Whatever `fn` returns.
   */
  async withTransaction<T>(
    fn: (transaction: HapticaAudioFilesDirectoryTransaction) => T,
  ) {
    return await _hapticaPrimitives.audioDirectoryWithTransaction(fn);
  }
}

/**
 * The directory of audio files for your extension.
 *
 * The directory allows you to query {@link HapticaAudioFile}s that have been shared with or
 * created by your extension.
 *
 * Your extension can create, and save audio files in the directory like so:
 * ```ts
 * const file = new HapticaAudioFile("sound.caf", soundBytes)
 * file.save()
 *
 * const files = audioDirectory.files() // Contains the saved file
 * ```
 *
 * Files can be deleted from the directory by calling `delete` on {@link HapticaAudioFile}.
 * ```ts
 * const file = new HapticaAudioFile("sound.caf", soundBytes)
 * file.save()
 * file.delete()
 *
 * const files = audioDirectory.files() // Empty Array
 * ```
 */
const audioFilesDirectory = new HapticaAudioFilesDirectory(
  Symbol._hapticaPrivate,
);

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

export type HapticaExtensionSettingsValue = string | number | boolean | Date;

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

/**
 * A attribute for a setting value.
 *
 * Attributes affect how the app treats the setting value. For instance, the `"secure"` attribute
 * will ensure that the setting value is persisted in secure storage (ie. Keychain).
 */
export type HapticaSettingAttribute = { type: "secure" };

type BaseSettingsSchema<Value extends HapticaExtensionSettingsValue> = {
  /**
   * The unique name of the settings value.
   */
  key: string;

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
   * The setting's attributes.
   */
  attributes?: HapticaSettingAttribute[];

  /**
   * A function to validate the settings value when the user decides to change it.
   *
   * @param value The new prospective value.
   * @returns An {@link HapticaExtensionSettingsValidationResult}.
   */
  validate?: (value: Value) => HapticaExtensionSettingsValidationResult;
};

type BaseNumericalSettingsSchema = BaseSettingsSchema<number> & {
  format?: (value: number) => string;
  step: number;
};

/**
 * The type of keyboard to use for a text field.
 */
export type TextFieldKeyboardType =
  | "default"
  | "asciiCapable"
  | "numbersAndPunctuation"
  | "URL"
  | "numberPad"
  | "phonePad"
  | "namePhonePad"
  | "emailAddress"
  | "decimalPad"
  | "twitter"
  | "webSearch"
  | "asciiCapableNumberPad";

/**
 * A style for a date picker.
 */
export type DatePickerStyle =
  | "automatic"
  | "compact"
  | "field"
  | "graphical"
  | "stepperField"
  | "wheel";

/**
 * Which components to display for a date picker.
 */
export type DatePickerDisplayedComponents = "date" | "hourAndMinute";

/**
 * An option to display in a picker.
 */
export type PickerOption = { displayName: string; value: string };

/**
 * A schema for describing settings value.
 *
 * Users change the settings for your extension on the extensions settings screen. You can use this
 * type to determine the UI and type for a settings value.
 */
export type HapticaExtensionSettingsSchema =
  | ({ type: "toggle" } & BaseSettingsSchema<boolean>)
  | ({ type: "text-field" } & BaseSettingsSchema<string> & {
        placeholder?: string;
        lineLimit?: number;
        autoCorrectionDisabled?: boolean;
        keyboardType?: TextFieldKeyboardType;
      })
  | ({ type: "stepper" } & BaseNumericalSettingsSchema & {
        min?: number;
        max?: number;
      })
  | ({ type: "slider" } & BaseNumericalSettingsSchema & {
        min: number;
        max: number;
        includeStepper?: boolean;
      })
  | ({ type: "date-picker" } & BaseSettingsSchema<Date> & {
        min?: Date;
        max?: Date;
        style?: DatePickerStyle;
        displayedComponents?: DatePickerDisplayedComponents[];
      })
  | ({ type: "picker" } & BaseSettingsSchema<string> & {
        options: PickerOption[];
      });

export type HapticaValidateSettingResult<
  Value extends HapticaExtensionSettingsValue,
> = { status: "success"; value: Value } | { status: "error"; message: string };

/**
 * Validates the specified {@link HapticaExtensionSettingsValue} against the schema.
 *
 * @param schema The schema to validate against.
 * @param value The value to validate.
 * @returns An {@link HapticaValidateSettingResult}.
 */
export const hapticaValidateSetting = <
  S extends HapticaExtensionSettingsSchema,
>(
  schema: S,
  value: HapticaExtensionSettingsValue,
): HapticaValidateSettingResult<S["defaultValue"]> => {
  const typeErrorMessage = _hapticaSettingTypeErrorMessage(schema, value);
  if (typeErrorMessage) {
    return { status: "error", message: typeErrorMessage };
  }
  const validateResult = schema.validate?.(value as never); // NB: Runtime typecheck above.
  if (validateResult?.status === "error") {
    return validateResult;
  }
  const rangeErrorMessage = _hapticaSettingRangeCheckErrorMessage(
    schema,
    value,
  );
  if (rangeErrorMessage) {
    return { status: "error", message: rangeErrorMessage };
  }
  return { status: "success", value: value as S["defaultValue"] };
};

const _hapticaSettingRangeCheckErrorMessage = (
  schema: HapticaExtensionSettingsSchema,
  value: HapticaExtensionSettingsValue,
): string | undefined => {
  if (
    schema.type !== "stepper" &&
    schema.type !== "slider" &&
    schema.type !== "date-picker"
  ) {
    return undefined;
  }
  if (!(value instanceof Date) && !(typeof value === "number")) {
    return undefined;
  }
  if (schema.type === "date-picker" && value instanceof Date) {
    const min = schema.min ?? new Date(-8.64e15);
    const max = schema.max ?? new Date(8.64e15);
    if (value < min) {
      return `The received value (${value.toISOString()}) is below the minimum value of ${min.toISOString()}.`;
    } else if (value > max) {
      return `The received value (${value.toISOString()}) is above the maximum value of ${max.toISOString()}.`;
    } else {
      return undefined;
    }
  }
  const min = schema.min ?? -Infinity;
  const max = schema.max ?? Infinity;
  if (value < min) {
    return `The received value (${value}) is below the minimum value of ${min}.`;
  } else if (value > max) {
    return `The received value (${value}) is above the maximum value of ${max}.`;
  } else {
    return undefined;
  }
};

const _hapticaSettingTypeErrorMessage = (
  schema: HapticaExtensionSettingsSchema,
  value: HapticaExtensionSettingsValue,
): string | undefined => {
  const schemaType = _hapticaSettingSchemaTypeName(schema);
  const valueType = _hapticaSettingValueTypeName(value);
  if (schemaType !== valueType) {
    return `Expected type '${schemaType}', but received '${valueType}'.`;
  }
  return undefined;
};

const _hapticaSettingSchemaTypeName = (
  schema: HapticaExtensionSettingsSchema,
) => {
  const map = {
    toggle: "boolean",
    "text-field": "string",
    stepper: "number",
    slider: "number",
    picker: "string",
    "date-picker": "Date",
  };
  return map[schema.type];
};

const _hapticaSettingValueTypeName = (value: HapticaExtensionSettingsValue) => {
  if (
    typeof value === "object" &&
    "constructor" in value &&
    "name" in value.constructor
  ) {
    return value.constructor.name;
  }
  return typeof value;
};

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
    const schema = this.checkSettingName(settingName);
    const nativeValue = _hapticaPrimitives.settingsValue(schema);
    if (nativeValue !== undefined) return nativeValue;
    return schema.defaultValue;
  }

  /**
   * Sets the value for the settings name.
   *
   * @param settingName The settings name that was used in the `settingsSchemas` of your extension's manifest.
   * @param value The value to set for the setting.
   */
  setValue(settingName: string, value: HapticaExtensionSettingsValue) {
    const schema = this.checkSettingName(settingName);
    _hapticaPrimitives.setSettingsValue(schema, value);
  }

  /**
   * Returns true if the setting name is in the `settingsSchemas` of your extension's manifest.
   *
   * @param settingName A setting name.
   */
  has(settingName: string) {
    return !!this.schemas.find((s) => s.key === settingName);
  }

  /**
   * Resets all settings to their default values.
   *
   * @param Specific keys or keys to reset. By default, all keys are reset.
   */
  reset(keys?: string | string[]) {
    const schemas =
      typeof keys === "undefined"
        ? this.schemas
        : typeof keys === "string"
          ? this.schemas.filter((s) => s.key === keys)
          : this.schemas.filter((s) => keys.includes(s.key));
    _hapticaPrimitives.settingsResetValues(schemas);
  }

  private checkSettingName(name: string) {
    const schema = this.schemas.find((s) => s.key === name);
    if (schema) return schema;
    throw HapticaExtensionError.settingNameNotFound(
      name,
      this.schemas.map((s) => s.key),
    );
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
   * The updated settings will have already been applied to the settings storage when this callback
   * is invoked.
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
   *
   * This callback runs regardless of whether or not the extension has been enabled.
   */
  onExtensionDeleted?: () => Promise<void>;

  /**
   * A callback that runs when your extension has been disabled by the user.
   *
   * When your extension is disabled, the app will not invoke the callbacks that you define in
   * your extension manifest, except for `onExtensionDeleted`.
   */
  onExtensionDisabled?: () => Promise<void>;

  /**
   * A callback the runs when the user shares a haptic pattern with your extension.
   *
   * @param pattern An {@link HapticaPattern}.
   */
  onPatternShared?: (pattern: HapticaPattern) => Promise<void>;

  /**
   * A callback that runs whenever the user has updated a haptic pattern.
   *
   * The update will have already been applied to the persisted location of the pattern when this
   * callback is invoked.
   *
   * The user must have previously shared the haptic pattern with your extension, or this extension
   * must be the owner of the haptic pattern in order for this callback to be invoked.
   *
   * @param pattern
   */
  onPatternUpdated?: (pattern: HapticaPattern) => Promise<void>;

  /**
   * A callback that runs whenever the user has deleted a haptic pattern.
   *
   * The pattern will have already been deleted from storage when this callback is invoked.
   *
   * The user must have previously shared the haptic pattern with your extension, or this extension
   * must be the owner of the haptic pattern in order for this callback to be invoked.
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
   * The {@link HapticaResourceOwner} value for this extension.
   */
  get owner(): HapticaResourceOwner {
    return { type: "extension", id: this.id };
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

/**
 * An identifier for an {@link HapticaAudioFile}.
 *
 * Audio files are identified by both their name and owner. 2 separate owners can have a file
 * with the same name, but the file names belonging to each owner must be unique. In other words,
 * if extension A has a file named "foo.caf", then extension B can also have a file named
 * "foo.caf". However, extension A or B cannot have a second file named "foo.caf".
 *
 * This class implements `toJSON`, so you can safely serialize it as a part of an AHAP-compatible
 * JSON pattern.
 */
export class HapticaAudioFileID {
  constructor(
    readonly name: string,
    readonly owner: HapticaResourceOwner = extension.owner,
  ) {}

  static __HAPTICA_UUID_V7_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  /**
   * Attempts to parse a {@link HapticaAudioFileID} from a string.
   *
   * The string must be in the same format that `toString` and `toJSON` return.
   *
   * @param str The string to parse.
   * @returns A {@link HapticaAudioFileID} if successful, `undefined` otherwise.
   */
  static parse(str: string): HapticaAudioFileID | undefined {
    const splits = str.toString().split("|", 2);
    if (splits.length < 2) return undefined;
    if (splits[0] == "main-application") {
      return new HapticaAudioFileID(splits[1], { type: "main-application" });
    }
    const extensionPrefix = "extension-";
    if (!splits[0].startsWith(extensionPrefix)) return undefined;
    const uuid = splits[0].substring(extensionPrefix.length);
    return HapticaAudioFileID.__HAPTICA_UUID_V7_REGEX.test(uuid)
      ? new HapticaAudioFileID(splits[1], { type: "extension", id: uuid })
      : undefined;
  }

  toString() {
    return this.toJSON();
  }

  toJSON() {
    return `${this.ownerString()}|${this.name}`;
  }

  private ownerString() {
    if (this.owner.type === "main-application") {
      return this.owner.type;
    }
    return `${this.owner.type}-${this.owner.id}`;
  }
}

export interface HapticaAudioFile {
  /**
   * The {@link HapticaAudioFileID} for this file.
   */
  get id(): HapticaAudioFileID;

  /**
   * The filename of this file.
   */
  get filename(): string;

  /**
   * The owner this audio file.
   *
   * If the owner type is `"main"`, then this file is owned by the main application.
   * If the owner type is `"extension"`, then this file is owned by an extension.
   *
   * The owner type must be `"extension"` and the corresponding `id` field must be equal to this
   * extension's ID if you want to call `save` or `delete`. Files that are not owned by this
   * extension are read-only, and cannot be saved or deleted. Calling `save` or `delete` on a file
   * this this extension does not own will result in a permissions error being thrown.
   */
  get owner(): HapticaResourceOwner;

  /**
   * The access level that this extension has to this audio file within the specified transaction.
   *
   * You can use this access level to determine what operations you can perform on this file.
   */
  accessLevel(
    tx: HapticaAudioFilesDirectoryTransaction,
  ): HapticaResourceAccessLevel;

  /**
   * Returns true if this file exists in the specified directory.
   */
  exists(tx: HapticaAudioFilesDirectoryTransaction): boolean;

  /**
   * Loads the bytes of this file.
   */
  bytes(tx: HapticaAudioFilesDirectoryTransaction): Uint8Array;

  /**
   * Saves this audio file.
   *
   * If this audio file does not belong to this extension, then this method will throw a
   * permissions error.
   */
  save(data: Uint8Array, tx: HapticaAudioFilesDirectoryTransaction): void;

  /**
   * Deletes this audio file.
   *
   * If this audio file does not belong to this extension, then this method will throw a
   * permissions error.
   */
  delete(tx: HapticaAudioFilesDirectoryTransaction): void;
}

declare global {
  /**
   * An audio file from the app.
   */
  var HapticaAudioFile: HapticaAudioFileConstructor;
}

export {
  device,
  patterns,
  keyValueStorage,
  secureStorage,
  extension,
  audioFilesDirectory,
  HapticaResourceAccessLevel,
  AHAP_AUDIO_PARAMETER_IDS,
  AHAP_HAPTIC_PARAMETER_IDS,
  AHAP_DYNAMIC_PARAMETER_IDS,
  AHAP_CURVABLE_PARAMETER_IDS,
};
