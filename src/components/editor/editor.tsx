import { FC } from "react";
import { Column } from "../column";
import { ImagePlaceholder } from "../image-placeholder";
import { Markdown } from "../markdown";
import { Row } from "../row";
import { Stage } from "../stage";
import { useState, useEffect } from "react";
import {
  Page,
  type Column as ColumnBlock,
  type TextBlock,
} from "../../types/content";
import { Icons } from "../icons";
import { findBlockById } from "../../utils/findBlockById";
import { findParentRowId } from "../../utils/findParentRowId";

export const Editor: FC = () => {
  const [content, setContent] = useState<Page>({ rows: [] });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("content", JSON.stringify(content));
  }, [content]);

  useEffect(() => {
    const savedContent = localStorage.getItem("content");
    if (savedContent) {
      setContent(JSON.parse(savedContent));
    }
  }, []);

  const selectedBlock = selectedBlockId
    ? findBlockById(content, selectedBlockId)
    : null;

  const selectedColumnContentType =
    selectedBlock?.type === "column"
      ? (selectedBlock as ColumnBlock).content?.type ?? null
      : null;

  const selectedTextBlock =
    selectedBlock?.type === "column"
      ? (selectedBlock as ColumnBlock).content?.type === "text"
        ? ((selectedBlock as ColumnBlock).content as TextBlock)
        : null
      : null;

  const selectedTextAlignment = selectedTextBlock?.alignment ?? null;

  const selectedColumnContent =
    selectedBlock?.type === "column"
      ? (selectedBlock as ColumnBlock).content
      : null;
  const selectedImageUrl =
    selectedColumnContent?.type === "image" ? selectedColumnContent.url : "";

  const handleSelectContent = (blockId?: string) => {
    setSelectedBlockId(blockId ?? null);
  };

  const handleAddRow = () => {
    const blockId = crypto.randomUUID();
    setContent(prev => {
      return {
        rows: [
          ...(prev.rows || []),
          { id: blockId, type: "row", columns: null },
        ],
      };
    });
    handleSelectContent(blockId);
  };

  const parentRowId = findParentRowId(content, selectedBlockId ?? undefined);

  const handleAddColumn = () => {
    if (!parentRowId) return;
    const blockId = crypto.randomUUID();
    setContent(prev => {
      return {
        rows: (prev.rows || []).map(row =>
          row.id === parentRowId
            ? {
                ...row,
                columns: [
                  ...(row.columns ?? []),
                  {
                    id: blockId,
                    type: "column" as const,
                    content: null,
                  },
                ],
              }
            : row
        ),
      };
    });
    handleSelectContent(blockId);
  };

  const handleAddContent = (contentType: "image" | "text") => {
    if (!selectedBlock) return;
    const blockId = crypto.randomUUID();
    setContent(prev => {
      return {
        rows: (prev.rows || []).map(row => ({
          ...row,
          columns: (row.columns || []).map(column =>
            column.id === selectedBlock.id
              ? contentType === "image"
                ? {
                    ...column,
                    content: {
                      id: blockId,
                      type: "image" as const,
                      url: "",
                    },
                  }
                : {
                    ...column,
                    content: {
                      id: blockId,
                      type: "text" as const,
                      text: "",
                      alignment: "center" as const,
                    },
                  }
              : column
          ),
        })),
      };
    });
  };

  const handleAlignmentChange = (alignment: "left" | "center" | "right") => {
    if (!selectedBlock || selectedBlock.type !== "column") return;
    setContent(prev => {
      return {
        rows: (prev.rows || []).map(row => ({
          ...row,
          columns: (row.columns || []).map(column =>
            column.id === selectedBlock.id && column.content?.type === "text"
              ? {
                  ...column,
                  content: {
                    ...column.content,
                    alignment,
                  },
                }
              : column
          ),
        })),
      };
    });
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedBlock || selectedBlock.type !== "column") return;
    const value = event.target.value;
    setContent(prev => ({
      rows: (prev.rows || []).map(row => {
        return {
          ...row,
          columns: (row.columns || []).map(column =>
            column.id === selectedBlock.id && column.content?.type === "text"
              ? {
                  ...column,
                  content: {
                    ...column.content,
                    text: value,
                  },
                }
              : column
          ),
        };
      }),
    }));
  };

  const handleImageUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedBlock || selectedBlock.type !== "column") return;
    const value = event.target.value;
    setContent(prev => {
      return {
        rows: (prev.rows || []).map(row => {
          return {
            ...row,
            columns: (row.columns || []).map(column =>
              column.id === selectedBlock.id && column.content?.type === "image"
                ? {
                    ...column,
                    content: {
                      ...column.content,
                      url: value,
                    },
                  }
                : column
            ),
          };
        }),
      };
    });
  };

  return (
    <div className="editor">
      <Stage onSelect={() => handleSelectContent()}>
        {content.rows?.map(row => (
          <Row
            key={row.id}
            selected={selectedBlockId === row.id}
            onSelect={() => handleSelectContent(row.id)}
          >
            {row.columns?.map(column => (
              <Column
                key={column.id}
                selected={selectedBlockId === column.id}
                onSelect={() => handleSelectContent(column.id)}
              >
                {column.content?.type === "image" &&
                  (column.content.url ? (
                    <img
                      src={column.content.url}
                      alt=""
                      className="column-image"
                    />
                  ) : (
                    <ImagePlaceholder />
                  ))}
                {column.content?.type === "text" && (
                  <div style={{ textAlign: column.content.alignment }}>
                    <Markdown>{column.content.text}</Markdown>
                  </div>
                )}
              </Column>
            ))}
          </Row>
        ))}
      </Stage>

      <div className="properties">
        <div className="section">
          <div className="section-header">Page</div>
          <div className="actions">
            <button className="action" onClick={() => handleAddRow()}>
              Add row
            </button>
          </div>
        </div>

        {parentRowId && (
          <div className="section">
            <div className="section-header">Row</div>
            <div className="actions">
              <button className="action" onClick={() => handleAddColumn()}>
                Add column
              </button>
            </div>
          </div>
        )}

        {selectedBlock && selectedBlock.type !== "row" && (
          <div className="section">
            <div className="section-header">Column</div>
            <div className="button-group-field">
              <label>Contents</label>
              <div
                className="button-group"
                role="radiogroup"
                aria-label="Contents"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedColumnContentType === "text"}
                  className={
                    selectedColumnContentType === "text" ? "selected" : ""
                  }
                  onClick={() => handleAddContent("text")}
                >
                  <Icons.Text />
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedColumnContentType === "image"}
                  className={
                    selectedColumnContentType === "image" ? "selected" : ""
                  }
                  onClick={() => handleAddContent("image")}
                >
                  <Icons.Image />
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedColumnContentType === "text" && (
          <div className="section">
            <div className="section-header">Text</div>
            <div className="button-group-field">
              <label>Alignment</label>
              <div
                className="button-group"
                role="radiogroup"
                aria-label="Alignment"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedTextAlignment === "left"}
                  className={selectedTextAlignment === "left" ? "selected" : ""}
                  onClick={() => handleAlignmentChange("left")}
                >
                  <Icons.TextAlignLeft />
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedTextAlignment === "center"}
                  className={
                    selectedTextAlignment === "center" ? "selected" : ""
                  }
                  onClick={() => handleAlignmentChange("center")}
                >
                  <Icons.TextAlignCenter />
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedTextAlignment === "right"}
                  className={
                    selectedTextAlignment === "right" ? "selected" : ""
                  }
                  onClick={() => handleAlignmentChange("right")}
                >
                  <Icons.TextAlignRight />
                </button>
              </div>
            </div>
            <div className="textarea-field">
              <textarea
                rows={8}
                placeholder="Enter text"
                value={selectedTextBlock?.text ?? ""}
                onChange={handleTextChange}
              />
            </div>
          </div>
        )}

        {selectedColumnContentType === "image" && (
          <div className="section">
            <div className="section-header">Image</div>
            <div className="text-field">
              <label htmlFor="image-url">URL</label>
              <input
                id="image-url"
                type="text"
                value={selectedImageUrl}
                onChange={handleImageUrlChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
