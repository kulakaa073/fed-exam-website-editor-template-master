import type { Page } from "../types/content";

export const findParentRowId = (
  page: Page,
  blockId?: string | null
): string | null => {
  if (blockId == null || !page.rows) return null;
  for (const row of page.rows) {
    if (row.id === blockId) return row.id;
    if (row.columns) {
      for (const col of row.columns) {
        if (col.id === blockId) return row.id;
        if (col.content?.id === blockId) return row.id;
      }
    }
  }
  return null;
};
