/**
 * Maps an optional foreign key from a source row to a cloned row using old-id → new-id maps.
 * Returns null when the source key is missing or not present in the map (orphan-safe).
 */
export function mapOptionalForeignKey(
  oldId: string | null | undefined,
  idMap: Map<string, string>
): string | null {
  if (!oldId) {
    return null;
  }
  return idMap.get(oldId) ?? null;
}
