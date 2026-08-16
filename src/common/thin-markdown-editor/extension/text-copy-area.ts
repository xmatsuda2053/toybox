import { TokenizerAndRendererExtension, Tokens } from "marked";
import "@/common/thin-markdown-editor/extension-tag/tmd-text-copy-area/tmd-text-copy-area";

/**
 * TextCopyAreaのトークンインターフェース
 */
export interface TextCopyAreaToken extends Tokens.Generic {
  type: "TextCopyArea";
  raw: string;
  text: string;
}

/**
 * marked.js用のTextCopyAreaタグ拡張機能
 */
export const TextCopyAreaExtension: TokenizerAndRendererExtension = {
  name: "TextCopyArea",
  level: "block",
  start(text: string) {
    return text.indexOf("+++");
  },
  tokenizer(text: string): TextCopyAreaToken | undefined {
    const match = /^(\+{3,})\s*\n([\s\S]*?)\n\1(?:\n|$)/.exec(text);
    if (match) {
      return {
        type: "TextCopyArea",
        raw: match[0],
        text: match[2],
      };
    }
    return undefined;
  },
  renderer(token: Tokens.Generic): string {
    const t = token as TextCopyAreaToken;
    return `<tmd-text-copy-area copyText="${t.text}">${t.text}</tmd-text-copy-area>`;
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
