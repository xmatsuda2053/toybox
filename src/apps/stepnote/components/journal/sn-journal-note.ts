// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Common Components, Database, Models)
import { ThinMarkdownEditor } from "@/common/thin-markdown-editor/thin-markdown-editor";
import { snDB } from "@sn/database/SnDB";
import { Note } from "@sn/models/Note";

// Internal Shared (Utils)
import { debounce } from "@/utils/CommonUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/journal/sn-journal-note.lit.scss?inline";

// Initializations
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
   * スタイルシートを適用
   *
   * @static
   * @memberof SnJournalNote
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnJournalNote
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._updateNoteDatabase.cancel();
  }

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  /**
   * 入力処理にデバウンスを設定します。
   *
   * @private
   * @memberof SnJournalNote
   */
  private _updateNoteDatabase = debounce(async (newNote: Partial<Note>) => {
    snDB.updateNote(newNote);
  }, 600);

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * 画面入力イベントを制御します。
   *
   * @private
   * @memberof SnJournalNote
   */
  private _handleNoteInput = (e: CustomEvent) => {
    const target = e.target as ThinMarkdownEditor;
    if (!target) return;

    this.notes[0].value = target.value;
    this._updateNoteDatabase({
      id: this.notes[0].id,
      value: target.value,
    });
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * ノートをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnJournalNote
   */
  protected render(): HTMLTemplateResult | typeof nothing {
    if (!this.notes || this.notes.length === 0) return nothing;

    return html`<div id="contents-root">
      <thin-markdown-editor
        .value=${this.notes[0].value}
        @input=${this._handleNoteInput}
      ></thin-markdown-editor>
    </div>`;
  }
}
