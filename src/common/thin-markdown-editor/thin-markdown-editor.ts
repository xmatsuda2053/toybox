// 1. Core Libraries (Lit, Static HTML & Markdown)
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";
import { unsafeStatic, withStatic } from "lit/static-html.js";
import { marked } from "marked";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// 3. Third-party UI & Elements (WebAwesome & GitHub Toolbar)
import "@github/markdown-toolbar-element";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import type WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import type WaTextarea from "@awesome.me/webawesome/dist/components/textarea/textarea.js";

// 4. Internal Shared (Extensions & Utils)
import { IdTagExtension, formatMarkdown } from "./extension/id-tag";
import { emit } from "@utils/EventUtils";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import githubMarkdownStyles from "github-markdown-css/github-markdown-light.css?inline";
import styles from "./thin-markdown-editor.lit.scss?inline";

// --- Configuration & Initialization ---
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  breaks: false,
  async: false,
});

const TOOLBAR_MASTER = {
  header: { tag: "md-header", icon: "heading-solid-full", label: "Header" },
  bold: { tag: "md-bold", icon: "bold-solid-full", label: "Bold" },
  quote: { tag: "md-quote", icon: "blockquote-left", label: "Quote" },
  code: { tag: "md-code", icon: "code-solid-full", label: "Code" },
  link: { tag: "md-link", icon: "link-solid-full", label: "Link" },
  unordered_list: {
    tag: "md-unordered-list",
    icon: "list-ul-solid-full",
    label: "Unordered List",
  },
  ordered_list: {
    tag: "md-ordered-list",
    icon: "list-ol-solid-full",
    label: "Ordered List",
  },
  task_list: {
    tag: "md-task-list",
    icon: "list-check-solid-full",
    label: "Task List",
  },
} as const;
type ButtonKey = keyof typeof TOOLBAR_MASTER;

const Buttons: ButtonKey[] = Object.keys(TOOLBAR_MASTER) as ButtonKey[];

setBasePath("/");

/**
 * Markdown Editor
 *
 * @export
 * @class ThinMarkdownEditor
 * @extends {LitElement}
 */
@customElement("thin-markdown-editor")
export class ThinMarkdownEditor extends LitElement {
  /**
   * ラベル
   *
   * @type {string}
   * @memberof MarkdownEditor
   */
  @property({ type: String }) label: string = "";

  /**
   * 初期値
   *
   * @type {string}
   * @memberof MarkdownEditor
   */
  @property({ type: String }) value: string = "";

  /**
   * エディタモードの状態判定
   *
   * @type {boolean}
   * @memberof MarkdownEditor
   */
  @property({ type: Boolean }) isEditMode: boolean = false;

  /**
   * プレビュー用
   *
   * @type {string}
   * @memberof MarkdownEditor
   */
  @state() previewHtml: string = "";

  /**
   * Markdown-Toolbar
   *
   * @type {(HTMLElement & {
   *     field: HTMLTextAreaElement;
   *   })}
   * @memberof MarkdownEditor
   */
  @query("markdown-toolbar") toolbar!: HTMLElement & {
    field: HTMLTextAreaElement;
  };

  /**
   * 作成するテーブルの行
   *
   * @type {WaInput}
   * @memberof MarkdownEditor
   */
  @query("#table-row") tableRow!: WaInput;

  /**
   * 作成するテーブルの列
   *
   * @type {WaInput}
   * @memberof MarkdownEditor
   */
  @query("#table-col") tableCol!: WaInput;

  /**
   * エディタ領域
   *
   * @type {*}
   * @memberof MarkdownEditor
   */
  @query("#markdown-editor") markdownEditor!: WaTextarea;

  /**
   * Markdownのレンダリング部品を準備
   *
   * @private
   * @memberof PSTaskReference
   */
  private renderer = new marked.Renderer();

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof ThinMarkdownEditor
   */
  static styles = [
    css`
      ${unsafeCSS(styles)}
    `,
    css`
      ${unsafeCSS(githubMarkdownStyles)};
    `,
  ];

  /**
   * Creates an instance of ThinMarkdownEditor.
   * @memberof ThinMarkdownEditor
   */
  constructor() {
    super();
    this.renderer.link = ({ href, text }) => {
      const safeHref = href.replace(/\\/g, "%5C");
      return `<a class="copy-link" href="${safeHref}">
                <wa-icon library="my-icons" name="copy-regular-full"></wa-icon>${text}
              </a>`;
    };

    marked.use({
      tokenizer: {
        // リンク内の「\」が消失しないよう、markedのエスケープ処理を回避する。
        link(src) {
          // URL部分を ((?:[^()]|\([^()]*\))+) に変更
          // 1. [ ] の中身を取得
          // 2. ( ) の中身を取得。ただし、その中で「( )」が1ペア含まれることを許容する
          const match = src.match(/^\[([\s\S]*?)\]\(((?:[^()]|\([^()]*\))+)\)/);

          if (match) {
            return {
              type: "link",
              raw: match[0],
              text: match[1],
              href: match[2], // 生の値を渡す
              tokens: this.lexer.inlineTokens(match[1]),
            };
          }
          return false; // 通常のリンクでない場合は標準処理に任せる
        },
      },
      extensions: [IdTagExtension],
    });
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof ThinMarkdownEditor
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);

    if (!this.value) {
      this.isEditMode = true; // valueが空の場合、自動的に編集モードに切り替え
    }
  }

  /**
   * テキストエリアとtoolbarを紐づける
   *
   * @protected
   * @memberof MarkdownEditor
   */
  protected async firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    // wa-textarea のレンダリング完了を待つ
    await this.markdownEditor.updateComplete;

    // 初期値設定
    this.markdownEditor.value = this.value;

    // 内部の生の textarea を取得
    const nativeTextarea =
      this.markdownEditor.shadowRoot?.querySelector("textarea");

    if (nativeTextarea && this.toolbar) {
      // 'field' プロパティが getter のみの型エラーを回避しつつ、
      // プロパティ自体を再定義して nativeTextarea を返すように書き換える
      Object.defineProperty(this.toolbar, "field", {
        get: () => nativeTextarea,
        configurable: true,
      });

      // ツールバーを強制的に再初期化させるためのハック
      // 内部でイベントリスナーを貼り直させるため、一度 for 属性を空にして戻す
      const originalFor = this.toolbar.getAttribute("for");
      this.toolbar.setAttribute("for", "");
      this.toolbar.setAttribute("for", originalFor || "markdown-editor");
    }
  }

  /**
   * 画面更新後の処理
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof ThinMarkdownEditor
   */
  protected updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);

    if (_changedProperties.has("value")) {
      this._renderMarkdown();
    }
  }

  /**
   * markdownエディタをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof ThinMarkdownEditor
   */
  protected render(): HTMLTemplateResult {
    const previewClasses = classMap({
      tab: true,
      "preview-button": true,
      active: !this.isEditMode,
    });
    const editClasses = classMap({
      tab: true,
      "edit-button": true,
      active: this.isEditMode,
    });

    return html` <div id="contents-root">
      <div class="sticky">
        ${this.label ? html`<div class="label">${this.label}</div>` : null}
        <div class="header">
          <div class="md-tab-group">
            <div class=${previewClasses}>
              <wa-button
                size="small"
                appearance="plain"
                variant="neutral"
                @click=${this._changePreview}
              >
                <wa-icon
                  library="my-icons"
                  name="html5-brands-solid-full"
                ></wa-icon>
              </wa-button>
            </div>
            <div class=${editClasses}>
              <wa-button
                size="small"
                appearance="plain"
                variant="neutral"
                @click=${this._changeEdit}
              >
                <wa-icon
                  library="my-icons"
                  name="markdown-brands-solid-full"
                ></wa-icon>
              </wa-button>
            </div>
          </div>
          <div class="md-menu ${this.isEditMode ? "" : "hidden"}">
            <markdown-toolbar for="markdown-editor">
              ${Buttons.map((key) => {
                const config = TOOLBAR_MASTER[key];
                if (!config) return null;
                return withStatic(html)`
                              <${unsafeStatic(config.tag)}>
                                <wa-button size="small" appearance="plain" variant="neutral" title="${config.label}">
                                  <wa-icon library="my-icons" name="${config.icon}"></wa-icon>
                                </wa-button>
                              </${unsafeStatic(config.tag)}>
                          `;
              })}
              <wa-button
                size="small"
                appearance="plain"
                variant="neutral"
                title="Task ID"
                @click=${this._addIdLink}
              >
                <wa-icon library="my-icons" name="hashtag-solid-full"></wa-icon>
              </wa-button>

              <wa-button
                size="small"
                appearance="plain"
                variant="neutral"
                title="Color"
                @click=${this._addColorText}
              >
                <wa-icon library="my-icons" name="palette-solid-full"></wa-icon>
              </wa-button>
              <wa-dropdown size="small">
                <wa-button
                  data-md-button
                  size="small"
                  appearance="plain"
                  variant="neutral"
                  title="Table"
                  slot="trigger"
                >
                  <wa-icon library="my-icons" name="table-solid-full"></wa-icon>
                </wa-button>
                <wa-dropdown-item>
                  <div class="inner-item">
                    <wa-input
                      id="table-row"
                      size="small"
                      type="number"
                      min="1"
                      max="5"
                      value="2"
                      label="Row"
                      @click=${this._stopPropagation}
                    ></wa-input>
                    <wa-icon
                      library="my-icons"
                      name="xmark-solid-full"
                      class="symbol"
                    ></wa-icon>
                    <wa-input
                      id="table-col"
                      size="small"
                      type="number"
                      min="1"
                      max="5"
                      value="3"
                      label="Col"
                      @click=${this._stopPropagation}
                    ></wa-input>
                    <wa-button
                      size="small"
                      appearance="accent"
                      variant="brand"
                      @click=${this._addTable}
                    >
                      作成
                    </wa-button>
                  </div>
                </wa-dropdown-item>
              </wa-dropdown>
            </markdown-toolbar>
          </div>
        </div>
      </div>
      <div class="contents">
        <wa-textarea
          id="markdown-editor"
          size="small"
          resize="auto"
          class=${this.isEditMode ? "" : "hidden"}
          spellcheck="false"
          placeholder="Markdown enabled..."
          .value=${this.value}
          @input=${this._inputEditor}
        ></wa-textarea>
        <div
          class="markdown-body ${this.isEditMode ? "hidden" : ""}"
          .innerHTML=${this.previewHtml}
          @click=${this._handleClick}
        ></div>
      </div>
    </div>`;
  }

  /**
   * エディタの入力イベントを処理する。
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _inputEditor() {
    this.value = this.markdownEditor.value!;
    emit(this, "input");
  }

  /**
   * MarkdownをHTMLとしてレンダリングする。
   *
   * @private
   * @memberof MarkdownEditor
   */
  private _renderMarkdown() {
    const rawValue = this.markdownEditor.value!;

    this.previewHtml = marked.parse(rawValue, {
      renderer: this.renderer,
    }) as string;
  }

  /**
   * イベントの伝播を停止する。
   *
   * @private
   * @param {Event} e
   * @memberof MarkdownEditor
   */
  private _stopPropagation(e: Event) {
    e.stopPropagation();
  }

  /**
   * プレビューに切り替え。
   *
   * @private
   * @memberof MarkdownEditor
   */
  private _changePreview() {
    this.isEditMode = false;
    emit(this, "md-mode-change-preview");
  }

  /**
   * 編集に切り替え。
   *
   * @private
   * @memberof MarkdownEditor
   */
  private _changeEdit() {
    this.isEditMode = true;
    emit(this, "md-mode-change-edit");
  }

  /**
   * タスクIDリンクを追加する。
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _addIdLink() {
    const nativeTextarea = this.toolbar.field;
    if (!nativeTextarea) return;

    nativeTextarea.focus();

    formatMarkdown(nativeTextarea);

    nativeTextarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /**
   * 文字色を追加する。
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _addColorText() {
    // textarea を取得 (firstUpdated で toolbar.field にセットされている)
    const nativeTextarea = this.toolbar.field;
    if (!nativeTextarea) return;

    nativeTextarea.focus();

    // 選択範囲の位置情報を取得
    const start = nativeTextarea.selectionStart;
    const end = nativeTextarea.selectionEnd;
    const oldText = nativeTextarea.value;

    // 選択されたテキストを抽出
    const selectedText = oldText.substring(start, end);

    // 新しい文字列を作成
    const spanStart = '<span style="color:red;">';
    const spanEnd = "</span>";
    const newText =
      oldText.substring(0, start) +
      spanStart +
      selectedText +
      spanEnd +
      oldText.substring(end);
    nativeTextarea.value = newText;

    // カーソル位置を </span> の直後に設定
    // start + <span>(6) + 選択テキスト長 + </span>(7)
    const newCursorPos =
      start + spanStart.length + selectedText.length + spanEnd.length;
    nativeTextarea.selectionStart = nativeTextarea.selectionEnd = newCursorPos;

    // 内容の変更を通知
    nativeTextarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /**
   * テーブルを追加する
   *
   * @private
   * @memberof MarkdownEditor
   */
  private _addTable() {
    const row = Number(this.tableRow.value);
    const col = Number(this.tableCol.value);

    const header = `| ${Array(col).fill("Header").join(" | ")} |`;
    const separator = `| ${Array(col).fill("------").join(" | ")} |`;
    const record = `| ${Array(col).fill("Cell  ").join(" | ")} |`;

    const tableTemplate = `
${header}
${separator}
${Array(row).fill(record).join("\n")}\n`;

    // textarea を取得 (firstUpdated で toolbar.field にセットされている)
    const nativeTextarea = this.toolbar.field;
    if (!nativeTextarea) return;

    nativeTextarea.focus();

    // 挿入処理
    const start = nativeTextarea.selectionStart;
    const end = nativeTextarea.selectionEnd;
    const oldText = nativeTextarea.value;

    nativeTextarea.value =
      oldText.substring(0, start) + tableTemplate + oldText.substring(end);

    // カーソルを挿入したテーブルの直後に移動
    nativeTextarea.selectionStart = nativeTextarea.selectionEnd =
      start + tableTemplate.length;

    // 内容の変更を通知
    nativeTextarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /**
   * リンククリック時のハンドラ。
   * hrefの内容をコンソールに出力し、デフォルトの遷移を無効化する。
   *
   * @private
   * @param {MouseEvent} event
   * @memberof MarkdownEditor
   */
  private async _handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const anchor = target.closest("a");
    const idTag = target.closest(".id-tag");

    if (anchor) {
      // リンククリック時、URLをクリップボードにコピー
      event.preventDefault();
      const href = anchor.getAttribute("href");
      if (href) {
        try {
          const rawHref = href.replace(/%5C/g, "\\");
          await navigator.clipboard.writeText(rawHref);
        } catch (err) {
          console.error("Failed to copy text: ", err);
        }
      }
    } else if (idTag) {
      // IDクリック時、対応するイベントを発生させる
      event.preventDefault();
      const id = (idTag as HTMLSpanElement).dataset.id;
      emit(idTag as HTMLSpanElement, "id-click", { detail: { id: id } });
    }
  }
}
