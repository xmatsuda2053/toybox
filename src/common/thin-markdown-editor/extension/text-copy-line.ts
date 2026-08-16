import { TokenizerAndRendererExtension, Tokens } from "marked";
import "@/common/thin-markdown-editor/extension-tag/tmd-text-copy-line/tmd-text-copy-line";

/**
 * markdownパターン
 */
const regExp: RegExp = /^\+\{([^}\n]+)\}\+/;

/**
 * テキストコピー文字列のインターフェースです。
 * `+{fuzz}+`
 *
 * @export
 * @interface TextCopyLineToken
 * @extends {Tokens.Generic}
 */
export interface TextCopyLineToken extends Tokens.Generic {
  type: "TextCopyLine";
  raw: string;
  text: string; // 抽出したテキスト
}

/**
 * marked.js用のテキストコピー文字列タグ拡張機能です。
 */
export const TextCopyLineExtension: TokenizerAndRendererExtension = {
  name: "TextCopyLine",
  level: "inline",
  start(text: string) {
    const match = regExp.exec(text);
    return match ? match.index : undefined;
  },
  tokenizer(text: string): TextCopyLineToken | undefined {
    const match = regExp.exec(text);
    if (match) {
      return {
        type: "TextCopyLine",
        raw: match[0],
        text: match[1],
      };
    }
    return undefined;
  },
  renderer(token: Tokens.Generic): string {
    const t = token as TextCopyLineToken;
    return `<tmd-text-copy-line copyText="${t.text}">${t.text}</tmd-text-copy-line>`;
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
  const textStart = "+{";
  const textEnd = "}+";
  const newText =
    oldText.substring(0, start) +
    textStart +
    selectedText +
    textEnd +
    oldText.substring(end);
  textarea.value = newText;

  // カーソル位置を textEnd の直後に設定
  const newCursorPos =
    start + textStart.length + selectedText.length + textEnd.length;
  textarea.selectionStart = textarea.selectionEnd = newCursorPos;
};
