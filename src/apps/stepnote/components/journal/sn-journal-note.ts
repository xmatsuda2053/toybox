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
import { formatDate } from "@utils/DateUtils";

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
   * @type {Note}
   * @memberof SnJournalNote
   */
  @property({ type: Object }) note!: Note;

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
    snDB.noteRepo.updateNote(newNote);
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

    this.note.value = target.value;
    this._updateNoteDatabase({
      id: this.note.id,
      value: target.value,
    });
  };

  /**
   * エディタの最終行でEnterキーが押下された場合、画面最下部までスクロールします。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnJournalNote
   */
  private _handleKeyupEnterLastLine = (e: CustomEvent) => {
    const target = e.target as ThinMarkdownEditor;
    const parent = target.parentNode as HTMLElement;
    parent.scrollTo({
      top: parent.scrollHeight,
      behavior: "smooth",
    });
  };

  /**
   * ノート削除イベントハンドラ
   *
   * @private
   * @memberof SnJournalNote
   */
  private _handleDeleteNote = async () => {
    await snDB.noteRepo.deleteNote(this.note.id!);
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
    if (!this.note) return nothing;

    return html`<div id="contents-root">
      <div class="main">
        <thin-markdown-editor
          .value=${this.note.value}
          deletable
          @input=${this._handleNoteInput}
          @keyup-enter-last-line=${this._handleKeyupEnterLastLine}
          @markdown-delete=${this._handleDeleteNote}
        ></thin-markdown-editor>
      </div>
      <div class="footer">
        <span class="create-timestamp">
          Crt.${formatDate(this.note.createdAt, "yy/MM/dd HH:mm:ss")}
        </span>
        <span class="update-timestamp">
          Upd.${formatDate(this.note.updatedAt, "yy/MM/dd HH:mm:ss")}
        </span>
      </div>
    </div>`;
  }
}
