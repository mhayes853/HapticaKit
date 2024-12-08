import { HapticaExtensionError } from "./error";
import { extension } from "./haptica-extension";

describe("HapticExtension tests", () => {
  beforeEach(() => extension.reset());

  it("should use a uuid for the mocked extension id", () => {
    expect(isUUIDv4(extension.id)).toEqual(true);
  });

  it("should throw an error when trying to get settings for unregistered extension", () => {
    expect(() => extension.settings()).toThrow(
      HapticaExtensionError.MANIFEST_NOT_REGISTERED,
    );
  });

  it("should not indicate that a manifest has been registered by default", () => {
    expect(extension.manifest).toEqual(undefined);
    expect(extension.isManifestRegistered).toEqual(false);
  });

  it("should indicate that a manifest has been registered", () => {
    const manifest = { name: "Test" };
    extension.registerManifest(manifest);
    expect(extension.manifest).toEqual(manifest);
    expect(extension.isManifestRegistered).toEqual(true);
  });

  it("should throw an error when trying to register a manifest after it has been registered", () => {
    extension.registerManifest({ name: "Test" });
    expect(() => extension.registerManifest({ name: "Another" })).toThrow(
      HapticaExtensionError.MANIFEST_ALREADY_REGISTERED,
    );
  });

  const isUUIDv4 = (uuid: string) => {
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(uuid);
  };
});
