// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, property, query } from "lit/decorators.js";

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Common Components, Database, Models)
import { ThinMarkdownEditor } from "@/common/thin-markdown-editor/thin-markdown-editor";
import { snDB } from "@sn/database/SnDB";
import { Note } from "@sn/models/Note";

// 5. Internal Shared (Utils)
import { debounce } from "@/utils/CommonUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/journal/sn-journal-note.lit.scss?inline";

// 7. Initializations
setBasePath("/");

/**
 * ノート要素
 *
 * @export
 * @class SnJournalNote
 * @extends {LitElement}
 */
@customElement("sn-journal-note")
export class SnJournalNote extends LitElement {
  /**
   * タスクID
   *
   * @type {number}
   * @memberof SnJournalNote
   */
  @property({ type: Number }) taskId!: number;

  /**
   * ノート一覧
   *
   * @type {Note[]}
   * @memberof SnJournalNote
   */
  @property({ type: Array }) notes!: Note[];

  /**
   * ノートエディタ
   *
   * @type {ThinMarkdownEditor}
   * @memberof SnJournalNote
   */
  @query("#note-editor") noteEditor!: ThinMarkdownEditor;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnJournalNote
   */
  static styles = [
    css`
      ${unsafeCSS(sharedStyles)}
    `,
    css`
      ${unsafeCSS(styles)}
    `,
  ];

  /**
   * 入力処理にデバウンスを設定します。
   *
   * @private
   * @memberof SnJournalNote
   */
  private _debounceInput = debounce(async () => {
    const note = {
      ...this.notes[0],
      value: this.noteEditor.value,
    };
    snDB.putNote(note);
  }, 400);

  /**
   * Creates an instance of PsJournalNote.
   * @memberof SnJournalNote
   */
  constructor() {
    super();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnJournalNote
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._debounceInput.cancel();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnJournalNote
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * ノートをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnJournalNote
   */
  protected render(): HTMLTemplateResult {
    if (!this.notes || this.notes.length === 0) return html``;
    return html`<div id="contents-root">
      <thin-markdown-editor
        id="note-editor"
        .value=${this.notes[0].value}
        @input=${this._updateNote}
      ></thin-markdown-editor>
    </div>`;
  }

  /**
   * 入力内容をDBに反映する。
   *
   * @private
   * @memberof SnJournalNote
   */
  private _updateNote() {
    this._debounceInput();
  }
}
