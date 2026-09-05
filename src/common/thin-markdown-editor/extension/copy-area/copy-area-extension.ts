import { TokenizerAndRendererExtension, Tokens } from "marked";
import "@/common/thin-markdown-editor/extension/copy-area/tmd-copy-area";

/**
 * TmdCopyAreaのトークンインターフェース
 */
export interface Token extends Tokens.Generic {
  type: "TmdCopyArea";
  raw: string;
  text: string;
}

/**
 * marked.js用のTmdCopyAreaタグ拡張機能
 */
export const Extension: TokenizerAndRendererExtension = {
  name: "TmdCopyArea",
  level: "block",
  start(text: string) {
    return text.indexOf("+++");
  },
  tokenizer(text: string): Token | undefined {
    const match = /^(\+{3,})\s*\n([\s\S]*?)\n\1(?:\n|$)/.exec(text);
    if (match) {
      return {
        type: "TmdCopyArea",
        raw: match[0],
        text: match[2],
      };
    }
    return undefined;
  },
  renderer(token: Tokens.Generic): string {
    const t = token as Token;
    const texts = t.text.split("\n");
    if (texts.length > 3) {
      const firstThreeLines = texts.slice(0, 3).join("\n") + "\n...";
      return `<tmd-copy-area copyText="${t.text}">${firstThreeLines}</tmd-copy-area>`;
    } else {
      return `<tmd-copy-area copyText="${t.text}">${t.text}</tmd-copy-area>`;
    }
  },
};

/**
 * markdown用のフォーマットを適用する
 * @param textarea
 */
export const formatMarkdown = (textarea: HTMLTextAreaElement): void => {
  // 選択範囲の位置情報を取得
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const oldText = textarea.value;

  // 選択されたテキストを抽出
  const selectedText = oldText.substring(start, end);

  // 新しい文字列を作成
  const textStart = `+++\n`;
  const textEnd = "\n+++";
  const newText =
    oldText.substring(0, start) +
    textStart +
    selectedText +
    textEnd +
    oldText.substring(end);
  textarea.value = newText;

  // カーソル位置を選択されたテキストの末尾（textEndの直前）に設定
  const newCursorPos = start + textStart.length + selectedText.length;
  textarea.selectionStart = textarea.selectionEnd = newCursorPos;
};
