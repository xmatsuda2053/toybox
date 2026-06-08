// Core Libraries (Lit, Static HTML & Markdown)
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";
import { unsafeStatic, withStatic } from "lit/static-html.js";
import { marked } from "marked";

// Lit Extensions (Decorators & Directives)
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// Third-party UI & Elements (WebAwesome & GitHub Toolbar)
import "@github/markdown-toolbar-element";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import type WaTextarea from "@awesome.me/webawesome/dist/components/textarea/textarea.js";
import type WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";

// Internal Shared (Extensions & Utils)
import { IdTagExtension } from "./extension/id-tag";
import {
  ColorTagExtension,
  formatMarkdown as formatColorMarkdown,
} from "./extension/color-tag";
import {
  CalloutTagExtension,
  formatMarkdown as formatCalloutMarkdown,
} from "./extension/callout-tag";
import { addTimeStamp } from "./extension/timestamp";
import { emit } from "@utils/EventUtils";

// Styles
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
   * テーブル追加用ダイアログ
   *
   * @type {HTMLElement}
   * @memberof ThinMarkdownEditor
   */
  @query("#table-dialog") tableDialog!: WaDialog;

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
  static styles = [unsafeCSS(styles), unsafeCSS(githubMarkdownStyles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * Creates an instance of ThinMarkdownEditor.
   * @memberof ThinMarkdownEditor
   */
  constructor() {
    super();
    this.renderer.link = ({ href, text }) => {
      const getFrontIcon = (h: string) => {
        if (h.startsWith("http")) {
          return "globe-solid-full";
        } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(h)) {
          return "envelope-solid-full";
        } else {
          return "folder-open-solid-full";
        }
      };

      const safeHref = href.replace(/\\/g, "%5C");
      const frontIcon = `<wa-icon library="my-icons" name="${getFrontIcon(href)}"></wa-icon>`;

      return `<a class="copy-link" href="${safeHref}">${frontIcon}<span>${text}</span></a>`;
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
      extensions: [IdTagExtension, ColorTagExtension, CalloutTagExtension],
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
      this._convertMarkdownToHtml();
    }
  }

  // -------------------------------------------------------------
  // Private Method
  // -------------------------------------------------------------

  /**
   * MarkdownをHTMLに変換する。
   *
   * @private
   * @memberof MarkdownEditor
   */
  private _convertMarkdownToHtml() {
    this.previewHtml = marked.parse(this.value, {
      renderer: this.renderer,
    }) as string;
  }

  /**
   * UI操作のイベントが伝播することを防止する。
   *
   * @private
   * @param {Event} e
   * @memberof MarkdownEditor
   */
  private _stopPropagation = (e: Event) => {
    e.stopPropagation();
  };

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * エディタの入力イベントを処理する。
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _handleMarkdownInput = (e: Event) => {
    const textarea = e.target as WaTextarea;
    this.value = textarea.value ?? "";
    emit(this, "input");
  };

  /**
   * HTMLプレビュー画面に切り替える。
   *
   * @private
   * @memberof MarkdownEditor
   */
  private _handleChangePreviewModeClick = () => {
    this.isEditMode = false;
    emit(this, "md-mode-change-preview");
  };

  /**
   * 編集に切り替え。
   *
   * @private
   * @memberof MarkdownEditor
   */
  private _handleChangeEditModeClick() {
    this.isEditMode = true;
    emit(this, "md-mode-change-edit");
  }

  /**
   * コールアウトタグを追加する。
   *
   * @private
   * @param {("info" | "check" | "gear" | "warn" | "alert")} type
   * @return {*}
   * @memberof ThinMarkdownEditor
   */
  private _handleAddCalloutClick(
    type: "info" | "check" | "gear" | "warn" | "alert",
  ): void {
    const nativeTextarea = this.toolbar.field;
    if (!nativeTextarea) return;

    nativeTextarea.focus();

    formatCalloutMarkdown(nativeTextarea, type);

    nativeTextarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /**
   * 文字色を追加する。
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _handleAddColorClick() {
    // textarea を取得 (firstUpdated で toolbar.field にセットされている)
    const nativeTextarea = this.toolbar.field;
    if (!nativeTextarea) return;

    nativeTextarea.focus();
    formatColorMarkdown(nativeTextarea);

    // 内容の変更を通知
    nativeTextarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /**
   * テーブル追加ダイアログを表示する。
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _handleOpenTableDialogClick() {
    this.tableDialog.open = true;
  }

  /**
   * テーブルを追加する
   *
   * @private
   * @memberof MarkdownEditor
   */
  private _handleAddTableClick() {
    const inputs = this.tableDialog.getElementsByTagName("wa-input");

    const row = Number(inputs[0].value);
    const col = Number(inputs[1].value);

    /**
     * テーブルMarkdownを作成するためのヘルパー関数
     *
     * @param {number} c - セル数
     * @param {string} v - セルの値
     * @return {*}  {string}
     */
    const createRow = (c: number, v: string): string => {
      return `| ${Array(c).fill(v).join(" | ")} |`;
    };

    const headerRow = createRow(col, "Header");
    const separatorRow = createRow(col, "------");
    const dataRow = createRow(col, "Cell  ");
    const dataRows = Array(row).fill(dataRow).join("\n");

    const tableTemplate = `${headerRow}\n${separatorRow}\n${dataRows}\n`;

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

    this.tableDialog.open = false;
  }

  /**
   * カーソル位置にタイムスタンプを挿入する。
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _handleAddTimeStampClick() {
    // textarea を取得 (firstUpdated で toolbar.field にセットされている)
    const nativeTextarea = this.toolbar.field;
    if (!nativeTextarea) return;

    nativeTextarea.focus();
    addTimeStamp(nativeTextarea);

    // 内容の変更を通知
    nativeTextarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /**
   * Markdownの値をクリップボードにコピーする。
   *
   * @private
   * @param {Event} e
   * @memberof ThinMarkdownEditor
   */
  private async _handleCopyRawClick(e: Event) {
    e.preventDefault();
    try {
      const raw = this.value;
      await navigator.clipboard.writeText(raw);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  /**
   * リンククリック時のハンドラ。
   * hrefの内容をコンソールに出力し、デフォルトの遷移を無効化する。
   *
   * @private
   * @param {MouseEvent} event
   * @memberof MarkdownEditor
   */
  private async _handleLinkClick(event: MouseEvent) {
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

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * markdownエディタをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof ThinMarkdownEditor
   */
  protected render(): HTMLTemplateResult {
    return html` <div id="contents-root">
      <div class="sticky">
        <div class="header">
          <div class="md-tab-group">
            <!--プレビューボタン-->
            ${this._renderPreviewButton()}
            <!--編集ボタン-->
            ${this._renderEditButton()}
          </div>
          <div class="md-menu">
            <!--メニューボタン-->
            ${this.isEditMode
              ? this._renderEditMenu()
              : this._renderPreviewMenu()}
          </div>
        </div>
      </div>
      <div class="contents">
        <!--コンテンツ-->
        ${this.isEditMode
          ? this._renderMarkdownEditor()
          : this._renderMarkdownBody()}
      </div>
      ${this._renderAddTableDialog()}
    </div>`;
  }

  /**
   * プレビューボタンをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof ThinMarkdownEditor
   */
  private _renderPreviewButton(): HTMLTemplateResult {
    const previewClasses = classMap({
      tab: true,
      active: !this.isEditMode,
    });

    return html` <div class=${previewClasses}>
      <wa-button
        size="small"
        appearance="plain"
        variant="neutral"
        @click=${this._handleChangePreviewModeClick}
      >
        <wa-icon library="my-icons" name="html5-brands-solid-full"></wa-icon>
      </wa-button>
    </div>`;
  }

  /**
   * 編集ボタンをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof ThinMarkdownEditor
   */
  private _renderEditButton(): HTMLTemplateResult {
    const editClasses = classMap({
      tab: true,
      active: this.isEditMode,
    });

    return html`<div class=${editClasses}>
      <wa-button
        size="small"
        appearance="plain"
        variant="neutral"
        @click=${this._handleChangeEditModeClick}
      >
        <wa-icon library="my-icons" name="markdown-brands-solid-full"></wa-icon>
      </wa-button>
    </div> `;
  }

  /**
   * プレビュー時のメニュー機能をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof ThinMarkdownEditor
   */
  private _renderPreviewMenu(): HTMLTemplateResult {
    return html` <div class="toolbar-root">
      <copy-button
        size="small"
        appearance="plain"
        variant="neutral"
        @click=${this._handleCopyRawClick}
      >
        Copy Raw
      </copy-button>
    </div>`;
  }

  /**
   * 編集時のメニュー機能をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof ThinMarkdownEditor
   */
  private _renderEditMenu(): HTMLTemplateResult {
    return html` <markdown-toolbar for="markdown-editor" class="toolbar-root">
      ${Buttons.map((key) => {
        const config = TOOLBAR_MASTER[key];
        return withStatic(html)`
          <${unsafeStatic(config.tag)}>
            <wa-button size="small" appearance="plain" variant="neutral" title="${config.label}">
              <wa-icon library="my-icons" name="${config.icon}"></wa-icon>
            </wa-button>
          </${unsafeStatic(config.tag)}>`;
      })}
      <!--拡張機能-->
      <wa-dropdown size="small">
        <wa-button
          size="small"
          appearance="plain"
          variant="neutral"
          title="Extensions"
          slot="trigger"
        >
          <wa-icon library="my-icons" name="ellipsis-solid-full"></wa-icon>
        </wa-button>
        <!-- Callout -->
        ${this._renderCalloutButton()}
        <!-- Color -->
        ${this._renderColorButton()}
        <!-- Table-->
        ${this._renderTableButton()}
        <!-- TimeStamp -->
        ${this._renderTimeStampButton()}
      </wa-dropdown>
    </markdown-toolbar>`;
  }

  /**
   * コールアウト（補足説明）の選択サブメニューを持つドロップダウンアイテムをレンダリングします。
   * * 「Info」「Check」「Gear」「Warning」「Alert」の5つのスタイルに対応した
   * アイコンとラベルのリストを展開し、クリック時にそれぞれのスタイルに応じた
   * コールアウト挿入処理（`_addCallout`）を呼び出します。
   *
   * @private
   * @returns {HTMLTemplateResult} レンダリングされるドロップダウンアイテムのテンプレート
   * @memberof ThinMarkdownEditor
   */
  private _renderCalloutButton(): HTMLTemplateResult {
    interface ParamItem {
      class: "info" | "check" | "gear" | "warn" | "alert";
      name: string;
      label: string;
    }
    const params: ParamItem[] = [
      {
        class: "info",
        name: "sign-hanging-solid-full",
        label: "Info",
      },
      {
        class: "check",
        name: "circle-check-solid-full",
        label: "Check",
      },
      {
        class: "gear",
        name: "gear-solid-full",
        label: "Gear",
      },
      {
        class: "warn",
        name: "triangle-exclamation-solid-full",
        label: "Warning",
      },
      {
        class: "alert",
        name: "circle-exclamation-solid-full",
        label: "Alert",
      },
    ] as const;

    return html` <wa-dropdown-item>
      <wa-icon library="my-icons" name="sign-hanging-solid-full"></wa-icon>
      <span>Callout</span>
      ${params.map(
        (p) =>
          html` <wa-dropdown-item
            slot="submenu"
            @click=${() => this._handleAddCalloutClick(p.class)}
          >
            <wa-icon
              class=${p.class}
              library="my-icons"
              name=${p.name}
              slot="icon"
            ></wa-icon>
            ${p.label}
          </wa-dropdown-item>`,
      )}
    </wa-dropdown-item>`;
  }

  /**
   * テキストの配色を変更するためのドロップダウンアイテムをレンダリングします。
   * * クリック時にテキストの色付け処理（`_addColorText`）を呼び出します。
   *
   * @private
   * @returns {HTMLTemplateResult} レンダリングされるドロップダウンアイテムのテンプレート
   * @memberof ThinMarkdownEditor
   */
  private _renderColorButton(): HTMLTemplateResult {
    return html` <wa-dropdown-item @click=${this._handleAddColorClick}>
      <wa-icon library="my-icons" name="palette-solid-full"></wa-icon>
      <span>Color</span>
    </wa-dropdown-item>`;
  }

  /**
   * テーブル（表）を挿入するためのドロップダウンアイテムをレンダリングします。
   * * テーブルのアイコンを表示し、エディタ内に表を挿入・生成するための
   * トリガーとして機能します。
   *
   * @private
   * @returns {HTMLTemplateResult} レンダリングされるドロップダウンアイテムのテンプレート
   * @memberof ThinMarkdownEditor
   */
  private _renderTableButton(): HTMLTemplateResult {
    return html`<wa-dropdown-item @click=${this._handleOpenTableDialogClick}>
      <wa-icon library="my-icons" name="table-solid-full"></wa-icon>
      <span>Table</span>
    </wa-dropdown-item>`;
  }

  /**
   * タイムスタンプを挿入するためのドロップダウンアイテムをレンダリングします。
   *
   * @private
   * @returns {HTMLTemplateResult} レンダリングされるドロップダウンアイテムのテンプレート
   * @memberof ThinMarkdownEditor
   */
  private _renderTimeStampButton(): HTMLTemplateResult {
    return html`<wa-dropdown-item @click=${this._handleAddTimeStampClick}>
      <wa-icon library="my-icons" name="clock-regular-full"></wa-icon>
      <span>TimeStamp</span>
    </wa-dropdown-item>`;
  }

  /**
   * Markdownの編集領域をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof ThinMarkdownEditor
   */
  private _renderMarkdownEditor(): HTMLTemplateResult {
    return html` <wa-textarea
      id="markdown-editor"
      size="small"
      resize="auto"
      spellcheck="false"
      placeholder="Markdown enabled..."
      .value=${this.value}
      @input=${this._handleMarkdownInput}
    ></wa-textarea>`;
  }

  /**
   * MarkdownのHTML表示領域をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof ThinMarkdownEditor
   */
  private _renderMarkdownBody(): HTMLTemplateResult {
    return html` <div
      class="markdown-body"
      .innerHTML=${this.previewHtml}
      @click=${this._handleLinkClick}
    ></div>`;
  }
  /**
   * テーブル追加ダイアログをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof ThinMarkdownEditor
   */
  private _renderAddTableDialog(): HTMLTemplateResult {
    return html` <wa-dialog label="Table" id="table-dialog">
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
      </div>
      <wa-button
        slot="footer"
        variant="brand"
        @click=${this._handleAddTableClick}
      >
        Add
      </wa-button>
    </wa-dialog>`;
  }
}
