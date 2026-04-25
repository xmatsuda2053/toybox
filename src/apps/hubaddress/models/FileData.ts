export type Category = "staff" | "div";

export interface FileData {
  id?: number;
  category: Category;
  data: {
    [name: string]: string;
  };
  searchTerms: string[];
}
