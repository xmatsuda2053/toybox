import { TokenizerAndRendererExtension, Tokens } from "marked";

/**
 * カラー構文の正規表現
 * /color:text/
 */
const regExp: RegExp = /^\/([a-zA-Z0-9#]+):([^/\n]+)\//;

/**
 * カラータグのトークンインターフェース
 */
export interface ColorTagToken extends Tokens.Generic {
  type: "ColorTag";
  raw: string;
  color: string;
  text: string;
  tokens?: Tokens.Generic[];
}

/**
 * marked.js用のカラータグ拡張機能
 */
export const ColorTagExtension: TokenizerAndRendererExtension = {
  name: "ColorTag",
  level: "inline",
  start(text: string) {
    return text.indexOf("/");
  },
  tokenizer(text: string): ColorTagToken | undefined {
    const match = regExp.exec(text);
    if (match) {
      const token: ColorTagToken = {
        type: "ColorTag",
        raw: match[0],
        color: match[1],
        text: match[2],
        tokens: [],
      };
      // 内側のテキストをトークナイズ（ネストされたインライン要素をサポート）
      token.tokens = this.lexer.inlineTokens(token.text);
      return token;
    }
    return undefined;
  },
  renderer(token: Tokens.Generic): string {
    const t = token as ColorTagToken;
    // 内側のトークンをパースしてHTML化
    return `<span style="color:${t.color}">${this.parser.parseInline(t.tokens || [])}</span>`;
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
  const startTag = "/red:";
  const endTag = "/";
  const newText =
    oldText.substring(0, start) +
    startTag +
    selectedText +
    endTag +
    oldText.substring(end);
  textarea.value = newText;

  // カーソル位置を endTag の直後に設定
  const newCursorPos =
    start + startTag.length + selectedText.length + endTag.length;
  textarea.selectionStart = textarea.selectionEnd = newCursorPos;
};
