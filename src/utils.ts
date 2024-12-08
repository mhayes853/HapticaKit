declare global {
  interface SymbolConstructor {
    _hapticaPrivate: Symbol;
  }
}

Symbol._hapticaPrivate = Symbol("_hapticaPrivate");

export const _hapticaInternalConstructorCheck = (key: Symbol) => {
  if (key !== Symbol._hapticaPrivate) {
    throw new TypeError("Illegal constructor");
  }
};
