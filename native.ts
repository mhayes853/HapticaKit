import { HapticaExtensionID } from "./haptica-extension";
import { HapticaExtensionSettingsValue } from "./settings";

export default {
  _hapticaExtensionID(): HapticaExtensionID {
    throw new Error("Unimplemented");
  },
  _hapticaSettingsValue(
    key: string,
  ): HapticaExtensionSettingsValue | undefined {
    throw new Error("Unimplemented");
  },
  _hapticaSetSettingsValue(key: string, value: HapticaExtensionSettingsValue) {
    throw new Error("Unimplemented");
  },
  _hapticaSettingsResetValues() {
    throw new Error("Unimplemented");
  },
  _hapticaDeviceName(): string {
    throw new Error("Unimplemented");
  },
  _hapticaDeviceOSVersion(): string {
    throw new Error("Unimplemented");
  },
  _hapticaDeviceHardwareHapticsCompatability() {
    throw new Error("Unimplemented");
  },
};
