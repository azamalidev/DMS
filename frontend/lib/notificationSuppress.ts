const suppressed = {
  upload: new Set<string>(),
  update: new Set<string>(),
  delete: new Set<string>(),
};

type NType = "upload" | "update" | "delete";

export const suppress = (type: NType, id: string, ttl = 3000) => {
  suppressed[type].add(id);
  setTimeout(() => suppressed[type].delete(id), ttl);
};

export const isSuppressed = (type: NType, id: string) => {
  return suppressed[type].has(id);
};

export default { suppress, isSuppressed };
