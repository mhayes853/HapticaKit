import {
  HapticaExtensionID,
  HapticaExtensionSettingsValue,
  DeviceHapticsHardwareCompatability,
  HapticaPatternsHandle,
  HapticaExtensionManifest,
} from "./index";

declare global {
  interface _HapticaPrimitives {
    extensionID(): HapticaExtensionID;
    settingsValue(key: string): HapticaExtensionSettingsValue | undefined;
    setSettingsValue(key: string, value: HapticaExtensionSettingsValue): void;
    settingsResetValues(): void;
    deviceName(): string;
    deviceOSVersion(): string;
    deviceHardwareHapticsCompatability(): DeviceHapticsHardwareCompatability;
    keyValueStorageValue(key: string): string | undefined;
    keyValueStorageSetValue(key: string, value: string): void;
    keyValueStorageRemoveValue(key: string): void;
    secureStorageValue(key: string): string | undefined;
    secureStorageSetValue(key: string, value: string): void;
    secureStorageRemoveValue(key: string): void;
    patternsWithTransaction<T>(fn: (handle: HapticaPatternsHandle) => T): T;
    registerManifest(manifest: HapticaExtensionManifest): void;
    unregisterManifest(): void;
  }

  const _hapticaPrimitives: _HapticaPrimitives;
}
