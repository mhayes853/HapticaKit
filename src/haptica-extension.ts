import { HapticaExtensionError } from "./error";
import { HapticaPattern } from "./patterns";
import {
  HapticaExtensionSettings,
  HapticaExtensionSettingsChange,
  HapticaExtensionSettingsSchema,
} from "./settings";
import { _hapticaInternalConstructorCheck } from "./utils";

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
    this._manifest = undefined;
    this._settings?.reset();
  }
}

/**
 * An object containing core properties to this extension.
 */
export const extension = new HapticaExtension(Symbol._hapticaPrivate);
