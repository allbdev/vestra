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

/**
 * Frequency types used in the database and application logic.
 * These values should correspond to the `frequency` field in the `TransactionTemplate` model.
 *
 * DO NOT EDIT THESE VALUES as they are persisted in the database.
 */
export enum FREQUENCY_TYPES {
  DAILY = 1,
  WEEKLY = 2,
  MONTHLY = 3,
}

export const storageKeys = {
  selectedWorkspaceId: "vestra_selected_workspace_id",
  sessionToken: "vestra_session_token",
};