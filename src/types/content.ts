export interface ContentBlock {
  id: string;
  type: string;
}

export interface ImageBlock extends ContentBlock {
  type: "image";
  url: string;
}

export interface TextBlock extends ContentBlock {
  type: "text";
  text: string;
  alignment: "left" | "center" | "right";
}

export interface Column extends ContentBlock {
  type: "column";
  content: ImageBlock | TextBlock | null;
}

export interface Row extends ContentBlock {
  type: "row";
  columns: Column[] | null;
}

export interface Page {
  rows: Row[] | null;
}
