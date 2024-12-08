import native from "./native";
import { _hapticaInternalConstructorCheck } from "./utils";

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
    return native._hapticaKeyValueStorageValue(key);
  }

  /**
   * Sets the value for the specified key.
   */
  setValue(key: string, value: string) {
    native._hapticaKeyValueStorageSetValue(key, value);
  }

  /**
   * Removes the value for the specified key.
   */
  removeValue(key: string) {
    native._hapticaKeyValueStorageRemoveValue(key);
  }
}

/**
 * Key Value storage for your extension.
 *
 * The storage is unencrypted, and you should not use it to store sensitive values. If you need
 * encryption to store sensitive values, use `secureStorage` instead.
 */
export const keyValueStorage = new KeyValueStorage(Symbol._hapticaPrivate);

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
    return native._hapticaSecureStorageValue(key);
  }

  /**
   * Sets the value for the specified key.
   */
  setValue(key: string, value: string) {
    native._hapticaSecureStorageSetValue(key, value);
  }

  /**
   * Removes the value for the specified key.
   */
  removeValue(key: string) {
    native._hapticaSecureStorageRemoveValue(key);
  }
}

/**
 * Secure key value storage for your extension that uses the keychain to store sensitive values.
 */
export const secureStorage = new SecureStorage(Symbol._hapticaPrivate);
