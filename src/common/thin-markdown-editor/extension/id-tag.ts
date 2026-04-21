import { TokenizerAndRendererExtension, Tokens } from "marked";

/**
 * markdownパターン
 */
const regExp: RegExp = new RegExp(/^(?<!\d)#\{([1-9][0-9]*)\}\{([^}\n]+)\}/);

/**
 * IDタグのインターフェースです。
 * `#{123}`
 *
 * @export
 * @interface IdTagToken
 * @extends {Tokens.Generic}
 */
export interface IdTagToken extends Tokens.Generic {
  type: "IdTag";
  raw: string;
  id: string; // 抽出した数値（1, 10, 200 など）
  text: string; // 抽出したテキスト
}

/**
 * marked.js用のIDタグ拡張機能です。
 */
export const IdTagExtension: TokenizerAndRendererExtension = {
  name: "IdTag",
  level: "inline",
  start(text: string) {
    const match = regExp.exec(text);
    return match ? match.index : undefined;
  },
  tokenizer(text: string): IdTagToken | undefined {
    const match = regExp.exec(text);
    if (match) {
      return {
        type: "IdTag",
        raw: match[0],
        id: match[1],
        text: match[2],
      };
    }
    return undefined;
  },
  renderer(token: Tokens.Generic): string {
    const t = token as IdTagToken;
    return `<span class="id-tag" data-id="${t.id}">#${t.id} ${t.text}</span>`;
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
  const textStart = "#{id}{";
  const textEnd = "}";
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
