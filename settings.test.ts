import { HapticaExtensionError } from "./error";
import { extension } from "./haptica-extension";
import { HapticaExtensionSettings } from "./settings";

describe("HapticaExtensionSettings tests", () => {
  let settings: HapticaExtensionSettings;
  beforeEach(() => {
    extension.reset();
    extension.registerManifest({
      name: "Test",
      settingsSchemas: [
        { type: "toggle", name: "test", defaultValue: true },
        { type: "text-field", name: "blob", defaultValue: "hello world" },
      ],
    });
    settings = extension.settings();
  });

  it("should use the default value when no value for setting", () => {
    expect(settings.value("blob")).toEqual("hello world");
  });

  it("should use the set value when overriding value for setting", () => {
    settings.setValue("blob", "test");
    expect(settings.value("blob")).toEqual("test");
  });

  it("should not set a value for a setting that is not in the schema", () => {
    expect(() => settings.setValue("slkjslkjs", "test")).toThrow(
      HapticaExtensionError.settingNameNotFound("slkjslkjs", ["test", "blob"]),
    );
    expect(() => settings.value("slkjslkjs")).toThrow(
      HapticaExtensionError.settingNameNotFound("slkjslkjs", ["test", "blob"]),
    );
  });

  it("should be able to tell when a value is not in the schema", () => {
    expect(settings.has("slkjslkjs")).toEqual(false);
  });

  it("should be able to tell when a value is in the schema", () => {
    expect(settings.has("blob")).toEqual(true);
  });

  it("should reset all settings values to their defaults when resetting", () => {
    settings.setValue("blob", "test");
    settings.setValue("test", false);
    settings.reset();
    expect(settings.value("blob")).toEqual("hello world");
    expect(settings.value("test")).toEqual(true);
  });

  it("should throw an error when attempting to set an invalid typed value for setting", () => {
    expect(() => settings.setValue("blob", 10)).toThrow(
      HapticaExtensionError.invalidSettingNameType(
        "blob",
        "number",
        "string | undefined",
      ),
    );
  });
});
