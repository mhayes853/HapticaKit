import {
  DeviceHapticsHardwareCompatability,
  HapticaExtensionID,
  HapticaExtensionSettingsValue,
  HapticaPatternsHandle,
} from "./src";

export * from "./src";

declare global {
  class _HapticaPrimitives {
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
  }

  const _hapticaPrimitives: _HapticaPrimitives;
}
