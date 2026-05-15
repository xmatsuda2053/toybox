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
