import { HapticaExtensionError } from "./error";
import { _hapticaInternalConstructorCheck } from "./utils";

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
    private readonly schemas: HapticaExtensionSettingsSchema[],
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
    if (nativeValue) return nativeValue;
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
    _hapticaPrimitives.setSettingsValue(settingName, value);
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
   */
  reset() {
    _hapticaPrimitives.settingsResetValues();
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
