import {
  HapticaExtensionID,
  HapticaExtensionSettingsValue,
  HapticaExtensionManifest,
  HapticaSemanticVersion,
  HapticaDeviceMetadata,
  HapticaPatternsQuery,
  HapticaPattern,
  HapticaPatternInsert,
  HapticaPatternUpdate,
  HapticaPatternID,
  HapticaAuthorizationRequest,
  HapticaAudioFileCreate,
  HapticaAudioFile,
  HapticaAudioFileID,
  HapticaAudioFileLabel,
  HapticaAudioFileRename,
  HapticaAudioFileRenameResult,
  HapticaAuthorizationStatus,
} from "./index";

declare global {
  type _HapticaKVSSource = "normal" | "secure";

  interface _HapticaPrimitives {
    appVersion: HapticaSemanticVersion;
    extensionID: HapticaExtensionID;
    deviceMetadata: HapticaDeviceMetadata;

    extensionManifest: HapticaExtensionManifest | undefined;
    registerExtensionManifest(manifest: HapticaExtensionManifest): void;

    settingsValue(key: string): Promise<HapticaExtensionSettingsValue>;
    settingsHasValue(key: string): Promise<boolean>;
    setSettingsValue(
      key: string,
      value: HapticaExtensionSettingsValue,
    ): Promise<void>;

    keyValueStorageValue(
      key: string,
      storageSource: _HapticaKVSSource,
    ): Promise<string | undefined>;
    keyValueStorageSetValue(
      key: string,
      value: string,
      storageSource: _HapticaKVSSource,
    ): Promise<void>;
    keyValueStorageRemoveValue(
      key: string,
      storageSource: _HapticaKVSSource,
    ): Promise<void>;

    requestAuthorization(): Promise<HapticaAuthorizationStatus>;
    authorizationStatus(): Promise<HapticaAuthorizationStatus>;

    patterns(query: HapticaPatternsQuery): Promise<HapticaPattern[]>;
    patternById(id: HapticaPatternID): Promise<HapticaPattern | undefined>;
    insertPatterns(
      inserts: HapticaPatternInsert[],
    ): Promise<HapticaPatternID[]>;
    updatePatterns(
      updates: HapticaPatternUpdate[],
    ): Promise<HapticaPatternID[]>;
    deletePatterns(ids: HapticaPatternID[]): Promise<void>;

    audioDirectoryCreateNewFiles(
      creates: HapticaAudioFileCreate[],
    ): Promise<HapticaAudioFile[]>;
    audioDirectoryFilesForIds(
      ids: HapticaAudioFileID[],
    ): Promise<(HapticaAudioFile | undefined)[]>;
    audioDirectoryFilesForLabels(
      labels: HapticaAudioFileLabel[],
    ): Promise<(HapticaAudioFile | undefined)[]>;
    audioDirectoryFiles(): Promise<HapticaAudioFile[]>;
    audioDirectoryRenameFiles(
      renames: HapticaAudioFileRename[],
    ): Promise<HapticaAudioFileRenameResult[]>;
    audioDirectoryDeleteFilesByIds(ids: HapticaAudioFileID[]): Promise<void>;
  }

  const _hapticaPrimitives: _HapticaPrimitives;
}
