import { AHAPPattern } from "./ahap";
import native from "./native";

export type HapticaPatternID = string;
export type HapticaExtensionID = string;

export type HapticaPattern = {
  id: HapticaPatternID;
  name: string;
  ahapPattern: AHAPPattern;
  audioFiles: File[];
};

export type HapticaExtensionSettingsChange = {
  key: string;
  value: any;
};

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
  settingsSchema?: any;

  /**
   * A callback the runs whenever the user changes your extension's settings.
   *
   * This callback does not run when the settings are programatically changed by your extension's
   * code, only when the user changes the settings externally.
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

  /**
   * A callback that loads haptic patterns on the haptic patterns list screen.
   *
   * @returns A list of {@link HapticaPattern}s.
   */
  onLoadPatterns?: () => Promise<HapticaPattern[]>;
};

declare global {
  interface SymbolConstructor {
    _hapticaPrivate: Symbol;
  }
}

Symbol._hapticaPrivate = Symbol("_hapticaPrivate");

/**
 * An Error subclass thrown by APIs that serve haptica extensions.
 */
export class HapticaExtensionError extends Error {
  private constructor(message: string) {
    super(message);
  }

  /**
   * An error thrown when registering a manifest more than once.
   */
  static MANIFEST_ALREADY_REGISTERED = new HapticaExtensionError(
    "A manifest has already been registered. You cannot register a manifest more than once. If you wish to reset the extension, call `extension.reset`.",
  );
}

/**
 * A class representing a Haptica Extension.
 *
 * You do not construct instances of this class. Instead, use the global {@link extension} instance.
 */
export class HapticaExtension {
  private _manifest?: HapticaExtensionManifest;

  /**
   * The unique identifier for this extension.
   */
  get id(): HapticaExtensionID {
    return native._hapticaExtensionID();
  }

  /**
   * The registered {@link HapticaExtensionManifest}, if `registerManifest` has been called.
   */
  get manifest() {
    return this._manifest;
  }

  /**
   * True if an {@link HapticaExtensionManifest} has been registered.
   */
  get isManifestRegistered() {
    return !!this.manifest;
  }

  constructor(key: Symbol) {
    if (key !== Symbol._hapticaPrivate) {
      throw new TypeError("Illegal constructor");
    }
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
  }

  /**
   * Resets this extension.
   */
  reset() {
    this._manifest = undefined;
  }
}

/**
 * An object containing core properties to this extension.
 */
export const extension = new HapticaExtension(Symbol._hapticaPrivate);
