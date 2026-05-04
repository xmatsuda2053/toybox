import { HTMLTemplateResult } from "lit";

export type sKey = "F1" | "F2" | "F3";

export interface AppItem {
  code: string;
  label: string;
  tag: HTMLTemplateResult;
  key: sKey;
}
