import { _hapticaInternalConstructorCheck } from "./utils";

export type DeviceHapticsHardwareCompatability = {
  isHapticsSupported: boolean;
  isAudioSupported: boolean;
};

/**
 * A class for retrieving device info.
 *
 * You can access an instance of this class via the `device` property.
 */
export class Device {
  /**
   * The model name of the user's device.
   */
  get name() {
    return _hapticaPrimitives.deviceName();
  }

  /**
   * The os version of the user's device.
   */
  get osVersion() {
    return _hapticaPrimitives.deviceOSVersion();
  }

  /**
   * The hardware haptic compatability of the user's device.
   */
  get hapticHardwareCompatability(): DeviceHapticsHardwareCompatability {
    return _hapticaPrimitives.deviceHardwareHapticsCompatability();
  }

  constructor(key: Symbol) {
    _hapticaInternalConstructorCheck(key);
  }
}

/**
 * The user's device.
 */
export const device = new Device(Symbol._hapticaPrivate);
