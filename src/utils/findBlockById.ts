import type { ContentBlock, Page } from "../types/content";

export const findBlockById = (page: Page, id?: string): ContentBlock | null => {
  if (!id) return null;
    if (page.rows) {
        for (const row of page.rows) {
            if (row.id === id) return row;
            if (row.columns) {
                for (const col of row.columns) {
                    if (col.id === id) return col;

                    if (col.content?.id === id) return col.content;
                }
            }
        }
    }

  return null;
}