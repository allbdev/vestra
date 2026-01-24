/**
 * Category types used in the database and application logic.
 * These values should correspond to the `type` field in the `Category` model.
 *
 * DO NOT EDIT THESE VALUES as they are persisted in the database.
 */
export enum CATEGORY_TYPES {
  INCOME = 1,
  EXPENSE = 2,
}

export const storageKeys = {
  sessionToken: "sessionToken",
  // Inferred from usage in workspace.ts
  selectedWorkspaceId: "selectedWorkspaceId",
};