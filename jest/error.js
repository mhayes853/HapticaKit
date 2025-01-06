class MockHapticaExtensionError extends Error {
  #code;

  get code() {
    return this.#code;
  }

  constructor(code, message) {
    super(message);
    this.#code = code;
  }
}

global.HapticaExtensionError = MockHapticaExtensionError;
