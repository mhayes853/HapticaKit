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
}
