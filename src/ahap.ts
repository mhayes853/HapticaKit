/**
 * Parameter ids that can be used for haptic events.
 */
export const AHAP_HAPTIC_PARAMETER_IDS = [
  "HapticIntensity",
  "HapticSharpness",
  "AttackTime",
  "DecayTime",
  "ReleaseTime",
  "Sustained",
] as const;

/**
 * A parameter id that can be used for haptic events.
 */
export type AHAPHapticParameterID = (typeof AHAP_HAPTIC_PARAMETER_IDS)[number];

/**
 * Parameter ids that can be used for audio events.
 */
export const AHAP_AUDIO_PARAMETER_IDS = [
  "AudioVolume",
  "AudioPan",
  "AudioPitch",
  "AudioBrightness",
] as const;

/**
 * A parameter id that can be used for audio events.
 */
export type AHAPAudioParameterID = (typeof AHAP_AUDIO_PARAMETER_IDS)[number];

/**
 * A parameter id for an {@link AHAPEvent}.
 */
export type AHAPEventParameterID = AHAPHapticParameterID | AHAPAudioParameterID;

/**
 * A parameter id with its associated value.
 */
export type AHAPEventParameter<ID extends AHAPEventParameterID> = {
  ParameterID: ID;
  ParameterValue: number;
};

type AHAPBaseEvent<Event> = Event & { Time: number };

/**
 * A haptic transient event from CoreHaptics.
 */
export type AHAPHapticTransientEvent = AHAPBaseEvent<{
  EventType: "HapticTransient";
  EventDuration?: number;
  EventParameters: AHAPEventParameter<AHAPHapticParameterID>[];
}>;

/**
 * A haptic continuous event from CoreHaptics.
 */
export type AHAPHapticContinuousEvent = AHAPBaseEvent<{
  EventType: "HapticContinuous";
  EventParameters: AHAPEventParameter<AHAPHapticParameterID>[];
  EventDuration: number;
}>;

/**
 * An audio custom event from CoreHaptics.
 */
export type AHAPAudioCustomEvent = AHAPBaseEvent<{
  EventType: "AudioCustom";
  EventWaveformPath: string;
  EventDuration?: number;
  EventWaveformLoopEnabled?: boolean;
  EventWaveformUseVolumeEnvelope?: boolean;
  EventParameters: AHAPEventParameter<AHAPAudioParameterID>[];
}>;

/**
 * An audio continuous event from CoreHaptics.
 */
export type AHAPAudioContinuousEvent = AHAPBaseEvent<{
  EventType: "AudioContinuous";
  EventDuration: number;
  EventWaveformUseVolumeEnvelope?: boolean;
  EventParameters: AHAPEventParameter<AHAPAudioParameterID>[];
}>;

/**
 * A type of haptic event to be played at a specified moment in time.
 */
export type AHAPEvent =
  | AHAPHapticTransientEvent
  | AHAPHapticContinuousEvent
  | AHAPAudioCustomEvent
  | AHAPAudioContinuousEvent;

/**
 * All possible paramater ids that can be used with an {@link AHAPParameterCurve}.
 */
export const AHAP_CURVABLE_PARAMETER_IDS = [
  "HapticIntensityControl",
  "HapticSharpnessControl",
  "AudioVolumeControl",
  "AudioPanControl",
  "AudioPitchControl",
  "AudioBrightnessControl",
] as const;

/**
 * A parameter id for {@link AHAPParameterCurve}s.
 */
export type AHAPCurvableParameterID =
  (typeof AHAP_CURVABLE_PARAMETER_IDS)[number];

/**
 * All possible paramater ids that can be used with an {@link AHAPDynamicParameter}.
 */
export const AHAP_DYNAMIC_PARAMETER_IDS = [
  ...AHAP_CURVABLE_PARAMETER_IDS,
  "HapticAttackTimeControl",
  "HapticDecayTimeControl",
  "HapticReleaseTimeControl",
  "AudioAttackTimeControl",
  "AudioDecayTimeControl",
  "AudioReleaseTimeControl",
] as const;

/**
 * A parameter id for {@link AHAPDynamicParameter}s.
 */
export type AHAPDynamicParameterID =
  (typeof AHAP_DYNAMIC_PARAMETER_IDS)[number];

/**
 * A value that alters the playback of haptic event parameters at a particular time.
 *
 * For interpolation of parameter values over time, see {@link AHAPParameterCurve}.
 */
export type AHAPDynamicParameter = {
  ParameterID: AHAPDynamicParameterID;
  ParameterValue: number;
  Time: number;
};

/**
 * A type that controls the change in a haptic parameter value using a key-frame system.
 *
 * For altering parameter values at a particular point see {@link AHAPDynamicParameter}.
 */
export type AHAPParameterCurve = {
  ParameterID: AHAPCurvableParameterID;
  Time: number;
  ParameterCurveControlPoints: AHAPParameterCurveControlPoint[];
};

/**
 * A control point for a {@link AHAPParameterCurve}.
 */
export type AHAPParameterCurveControlPoint = {
  ParameterValue: number;
  Time: number;
};

/**
 * An element in an {@link AHAPPattern}.
 */
export type AHAPPatternElement =
  | { Event: AHAPEvent }
  | { Parameter: AHAPDynamicParameter }
  | { ParameterCurve: AHAPParameterCurve };

/**
 * A type for a haptic pattern.
 *
 * Haptic patterns are composed of events and parameters. See {@link AHAPEvent},
 * {@link AHAPDynamicParameter}, and {@link AHAPParameterCurve} for more.
 */
export type AHAPPattern = {
  Version: 1;
  Metadata?: Record<string, any>;
  Pattern: AHAPPatternElement[];
};
