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
  HapticaAccessPermissionsRequest,
  HapticaAccessPermissions,
  HapticaAudioFileCreate,
  HapticaAudioFile,
  HapticaAudioFileID,
  HapticaAudioFileLabel,
  HapticaAudioFileRename,
  HapticaAudioFileRenameResult,
} from "./index";

declare global {
  type _HapticaKVSSource = "normal" | "secure";

  interface _HapticaPrimitives {
    appVersion: HapticaSemanticVersion;
    extensionID: HapticaExtensionID;
    deviceMetadata: HapticaDeviceMetadata;

    extensionManifest: HapticaExtensionManifest | undefined;
    registerExtensionManifest(manifest: HapticaExtensionManifest): void;
    unregisterExtensionManifest(): void;

    settingsValue(key: string): HapticaExtensionSettingsValue;
    settingsHasValue(key: string): boolean;
    setSettingsValue(key: string, value: HapticaExtensionSettingsValue): void;

    keyValueStorageValue(
      key: string,
      storageSource: _HapticaKVSSource,
    ): string | undefined;
    keyValueStorageSetValue(
      key: string,
      value: string,
      storageSource: _HapticaKVSSource,
    ): void;
    keyValueStorageRemoveValue(
      key: string,
      storageSource: _HapticaKVSSource,
    ): void;

    requestAccessPermissions(
      request: HapticaAccessPermissionsRequest,
    ): Promise<Set<HapticaAccessPermissions>>;
    accessPermissions(): Promise<Set<HapticaAccessPermissions>>;

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
