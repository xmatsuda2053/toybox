// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";
import { liveQuery, type Subscription } from "dexie";

// Lit Extensions (Decorators & Directives)
import { customElement, state } from "lit/decorators.js";
import "@lit-labs/virtualizer";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Codes, Models, Database)
import { snDB } from "@sn/database/SnDB";
import { Notebook } from "@sn/models/Notebook";
import { ThinMarkdownEditor } from "@/common/thin-markdown-editor/thin-markdown-editor";

// Internal Shared (Utils)
import { formatDate } from "@utils/DateUtils";
import { debounce } from "@utils/CommonUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/notebook/sn-notebook-container.lit.scss?inline";

// Initializations
setBasePath("/");

/**
 * ノートブックコンテナ
 *
 * @export
 * @class SnNotebookContainer
 * @extends {LitElement}
 */
@customElement("sn-notebook-container")
export class SnNotebookContainer extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnNotebookContainer
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * 選択中のノートブック
   *
   * @private
   * @type {Notebook}
   * @memberof SnNotebookContainer
   */
  @state() private _selectedNotebook?: Notebook;

  /**
   * ノートブック一覧
   *
   * @private
   * @type {Notebook[]}
   * @memberof SnNotebookContainer
   */
  @state() private _notebooks: Notebook[] = [];

  /**
   * 検索フィルタのキーワード
   *
   * @private
   * @type {string}
   * @memberof SnList
   */
  @state() private _filterKeyword: string = "";

  /**
   * テーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnList
   */
  private _dbSubscription?: Subscription;

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnList
   */
  connectedCallback() {
    super.connectedCallback();
    this._subscribeLabels();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnList
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._dbSubscription?.unsubscribe();
    this._debouncedMarkdownInput.cancel();
  }

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  /**
   * テーブル状態が更新された場合に最新データを取得します。
   * フィルタ用のキーワードが変更された場合にも実行します。
   *
   * @private
   * @memberof SnNotebookContainer
   */
  private _subscribeLabels() {
    this._dbSubscription?.unsubscribe();

    const keyword = this._filterKeyword;
    const observable = liveQuery(async () => {
      const [notebooks, selectedNotebook] = await Promise.all([
        snDB.notebookQuery.getNotebookAscSortKey(keyword),
        snDB.notebookQuery.getNotebookSelected(),
      ]);

      return {
        notebooks,
        selectedNotebook,
      };
    });

    this._dbSubscription = observable.subscribe({
      next: async (data) => {
        this._notebooks = data.notebooks;
        this._selectedNotebook = data.selectedNotebook;
        this.requestUpdate();
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

  // -------------------------------------------------------------
  // Debounce
  // -------------------------------------------------------------

  /**
   * Markdownエディタ入力イベントをデバウンス処理します。
   *
   * @private
   * @memberof SnNotebookContainer
   */
  private _debouncedMarkdownInput = debounce(
    async (header1: string, value: string) => {
      if (!this._selectedNotebook) return;
      if (this._selectedNotebook.id) {
        await snDB.notebookRepo.updateNotebook({
          id: this._selectedNotebook.id,
          title: header1,
          value: value,
        });
      }
    },
    600,
  );

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------
  /**
   * エディタの最終行でEnterキーが押下された場合、画面最下部までスクロールします。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnNotebookContainer
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
   * Markdown入力イベントを制御します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnNotebookContainer
   */
  private _handleInput = (e: CustomEvent) => {
    const target = e.target as ThinMarkdownEditor;
    const value = target.value;
    const header1 = e.detail.header1;

    this._debouncedMarkdownInput(header1, value);
  };

  /**
   * Markdown削除イベントを制御します。
   *
   * @private
   * @memberof SnNotebookContainer
   */
  private _handleMarkdownDelete = async () => {
    if (!this._selectedNotebook) return;
    if (this._selectedNotebook.id) {
      await snDB.notebookRepo.deleteNotebook(this._selectedNotebook.id);
    }
  };

  /**
   * アイテム追加イベントを制御します。
   *
   * @private
   * @memberof SnNotebookContainer
   */
  private _handleItemAdd = async () => {
    const defaultTitle = `新規アイテム_${formatDate(new Date(), "yyyyMMddHHmmss")}`;
    const id = await snDB.notebookRepo.addNotebook({
      title: defaultTitle,
      value: `# ${defaultTitle}`,
      selected: 0,
      pin: 0,
    });
    await snDB.notebookRepo.selected(id);
  };

  /**
   * リストアイテムのクリックイベントを制御します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnNotebookContainer
   */
  private _handleListItemClick = async (e: CustomEvent) => {
    await snDB.notebookRepo.selected(e.detail.id);
  };

  /**
   * ピンクリックイベントを制御します。
   *
   * @private
   * @param {MouseEvent} e
   * @memberof SnNotebookContainer
   */
  private _handlePinClick = async (id: number) => {
    await snDB.notebookRepo.pined(id);
  };

  /**
   * 検索キーワード入力イベントを制御します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnNotebookContainer
   */
  private _handleFilterKeywordInput = (e: CustomEvent) => {
    const keyword = e.detail.keyword ?? "";
    this._filterKeyword = keyword.toLowerCase();
    this._subscribeLabels();
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * コンポーネントのメインレイアウトをレンダリングします。
   * アプリケーションの基本構造を定義します。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnNotebookContainer
   */
  protected render(): HTMLTemplateResult {
    return html`<div class="contents-root">
      <nav>${this._renderNav()}</nav>
      <main>${this._renderMain()}</main>
    </div>`;
  }

  /**
   * ナビコンテンツをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNotebookContainer
   */
  private _renderNav(): HTMLTemplateResult {
    const iconBook = html` <wa-icon
      library="my-icons"
      name="book-open-solid-full"
      slot="icon"
    ></wa-icon>`;

    const iconPin = html` <wa-icon
      library="my-icons"
      name="thumbtack-solid-full"
      slot="icon"
      class="pin"
    ></wa-icon>`;

    return html` <generic-list
      headerLabel="NOTEBOOK"
      addable
      searchable
      @generic-item-add=${this._handleItemAdd}
      @generic-item-click=${this._handleListItemClick}
      @input-keyword=${this._handleFilterKeywordInput}
    >
      <lit-virtualizer
        .items=${this._notebooks}
        .renderItem=${(item: Notebook) => html`
          <generic-list-item itemId="${item.id}" ?selected=${item.selected}>
            ${!item.pin ? iconBook : iconPin}
            <span slot="label">${item.title}</span>
            <wa-dropdown slot="end">
              <wa-icon
                library="my-icons"
                name="bars-solid-full"
                slot="trigger"
              ></wa-icon>
              <wa-dropdown-item @click=${() => this._handlePinClick(item.id!)}>
                ${iconPin}<span>Pin</span>
              </wa-dropdown-item>
            </wa-dropdown>
          </generic-list-item>
        `}
      ></lit-virtualizer>
    </generic-list>`;
  }

  /**
   * メインコンテンツをレンダリングします。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof SnNotebookContainer
   */
  private _renderMain(): HTMLTemplateResult | typeof nothing {
    if (!this._selectedNotebook) {
      return nothing;
    }

    return html`
      <thin-markdown-editor
        deletable
        .radius=${false}
        .value=${this._selectedNotebook.value}
        @keyup-enter-last-line=${this._handleKeyupEnterLastLine}
        @input=${this._handleInput}
        @markdown-delete=${this._handleMarkdownDelete}
      ></thin-markdown-editor>
    `;
  }
}
