import {
  HapticaExtensionID,
  HapticaExtensionSettingsValue,
  DeviceHapticsHardwareCompatability,
  HapticaPatternsHandle,
  HapticaExtensionManifest,
  HapticaExtensionSettingsSchema,
  HapticaAudioFilesDirectoryTransaction,
  HapticaAppVersion,
} from "./index";

declare global {
  const HAPTICA_APP_VERSION: HapticaAppVersion;

  interface _HapticaPrimitives {
    appVersionString(): string;
    extensionID(): HapticaExtensionID;
    settingsValue(
      schema: HapticaExtensionSettingsSchema,
    ): HapticaExtensionSettingsValue | undefined;
    setSettingsValue(
      schema: HapticaExtensionSettingsSchema,
      value: HapticaExtensionSettingsValue,
    ): void;
    settingsResetValues(schemas: HapticaExtensionSettingsSchema[]): void;
    deviceName(): string;
    deviceOSVersion(): string;
    deviceHardwareHapticsCompatability(): DeviceHapticsHardwareCompatability;
    keyValueStorageValue(key: string): string | undefined;
    keyValueStorageSetValue(key: string, value: string): void;
    keyValueStorageRemoveValue(key: string): void;
    secureStorageValue(key: string): string | undefined;
    secureStorageSetValue(key: string, value: string): void;
    secureStorageRemoveValue(key: string): void;
    patternsWithTransaction<T>(
      fn: (handle: HapticaPatternsHandle) => T,
    ): Promise<T>;
    registerManifest(manifest: HapticaExtensionManifest): void;
    unregisterManifest(): void;
    audioDirectoryWithTransaction<T>(
      fn: (transaction: HapticaAudioFilesDirectoryTransaction) => T,
    ): T;
  }

  const _hapticaPrimitives: _HapticaPrimitives;
}
