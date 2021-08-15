export declare function toEpochTimestamp(date: number | Date | undefined): number | undefined;
export declare function normalizeKey<ObjT, KeyT extends keyof ObjT>(fn: (ex: ObjT[KeyT]) => ObjT[KeyT], key: KeyT, obj: ObjT): ObjT;
export declare function ensureArray<T>(val: T | T[] | undefined): T[] | undefined;
