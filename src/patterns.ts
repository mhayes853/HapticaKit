import { AHAPPattern } from "./ahap";
import native from "./native";
import { _hapticaInternalConstructorCheck } from "./utils";

export type HapticaPatternID = string;

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
  audioFiles: File[];

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
 * Properties for saving an {@link HapticaPattern}.
 */
export type HapticaPatternSave = Omit<
  Partial<HapticaPattern>,
  "createdAt" | "lastEditedAt"
>;

/**
 * An interface for fetching, editing, and deleting haptic patterns owned by your extension.
 *
 * You get an instance of this interface by calling `withTransaction` on {@link HapticaPatterns}.
 */
export interface HapticsPatternsHandle {
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
   * Saves and returns the updated {@link HapticaPattern}.
   *
   * If the id of the pattern is undefined, then a new pattern is created.
   *
   * @param pattern An {@link HapticaPatternSave}.
   */
  save(pattern: HapticaPatternSave): HapticaPattern;

  /**
   * Deletes the pattern with the specified id.
   *
   * @param id The id of the pattern to delete.
   */
  deletePattern(id: HapticaPatternID): void;
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
  async withTransaction<T>(fn: (handle: HapticsPatternsHandle) => T) {
    return await native._hapticaPatternsWithTransaction(fn);
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
export const patterns = new HapticaPatterns(Symbol._hapticaPrivate);
