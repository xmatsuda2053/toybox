// 1. Core Libraries (Lit & Dexie)
import {
  html,
  LitElement,
  PropertyValues,
  unsafeCSS,
  type HTMLTemplateResult,
} from "lit";
import { liveQuery, type Subscription } from "dexie";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

// 3. Third-party UI & SDKs (WebAwesome)
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Database, Models)
import { snDB } from "@sn/database/SnDB";
import { Label } from "@sn/models/Label";

// 5. Internal Shared (Utils)

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/nav/sn-nav-section-label.lit.scss?inline";

// 7. Initializations
setBasePath("/");

/**
 * ナビゲーションラベル
 *
 * @export
 * @class SnNavSectionLabel
 * @extends {LitElement}
 */
@customElement("sn-nav-section-label")
export class SnNavSectionLabel extends LitElement {
  /**
   * 追加ダイアログの開閉制御
   *
   * @private
   * @memberof SnNavSectionLabel
   */
  @state() private _isAddDialogOpen = false;

  /**
   * 削除ダイアログの開閉制御
   *
   * @private
   * @memberof SnNavSectionLabel
   */
  @state() private _isDeleteDialogOpen = false;

  /**
   * 編集中のラベル内容
   *
   * @private
   * @type {(Partial<Label> | null)}
   * @memberof SnNavSectionLabel
   */
  @state() private _editingLabel: Partial<Label> | null = null;

  /**
   * ラベル一覧
   *
   * @private
   * @type {Label[]}
   * @memberof SnNavSectionLabel
   */
  @state() private _labels: Label[] = [];

  /**
   * 検索フィルタのキーワード
   *
   * @private
   * @type {string}
   * @memberof SnNavSectionLabel
   */
  @state() private _filterKeyword: string = "";

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnNavSectionLabel
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * Labelテーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnNavSectionLabel
   */
  private _dbSubscription?: Subscription;

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnNavSectionLabel
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
    if (_changedProperties.has("_filterKeyword") || !this._dbSubscription) {
      this._subscribeLabels();
    }
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnNavSectionLabel
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._dbSubscription?.unsubscribe();
  }

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  /**
   * Labelの状態が更新された場合に最新データを取得します。
   * フィルタ用のキーワードが変更された場合にも実行します。
   *
   * @private
   * @memberof SnNavSectionLabel
   */
  private _subscribeLabels() {
    this._dbSubscription?.unsubscribe();

    const observable = liveQuery(() =>
      snDB.labelRepo.getLabelsAscName(this._filterKeyword),
    );

    this._dbSubscription = observable.subscribe({
      next: (data) => {
        this._labels = data;
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

  /**
   * ラベル一覧にフィルタをかける。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnNavSectionLabel
   */
  private async _filterLabels(e: CustomEvent) {
    this._filterKeyword = e.detail.keyword ?? "";
  }

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  // ------------------------------
  // 追加
  // ------------------------------

  /**
   * 追加ボタンクリック時のイベントを制御します。
   *
   * @private
   * @memberof SnNavSectionLabel
   */
  private _handleAddClick = () => {
    this._editingLabel = { name: "", isSelected: 0 };
    this._isAddDialogOpen = true;
  };

  /**
   * 選択されたラベルの内容をセットし、ラベル編集画面を表示します。
   *
   * @private
   * @param {Label} label
   * @memberof SnNavSectionLabel
   */
  private _handlePropertyClick = (label: Label) => {
    this._editingLabel = { ...label };
    this._isAddDialogOpen = true;
  };

  /**
   * 入力内容を取得する。
   *
   * @private
   * @param {Event} e
   * @return {*}
   * @memberof SnNavSectionLabel
   */
  private _handleLabelInput = (e: Event): void => {
    if (!this._editingLabel) return;
    this._editingLabel.name = (e.target as WaInput).value!;
  };

  /**
   * ラベル編集内容を保存します。
   *
   * @private
   * @param {Event} e
   * @memberof SnNavSectionLabel
   */
  private _handleSaveSubmit = async (e: Event) => {
    e.preventDefault();

    if (!this._editingLabel || !this._editingLabel.name?.trim()) {
      return;
    }

    const labelToSave: Label = {
      id: this._editingLabel.id ?? undefined,
      name: this._editingLabel.name.trim(),
      isSelected: 0,
    };

    await snDB.labelRepo.putLabel(labelToSave);

    this._isAddDialogOpen = false;
    this._editingLabel = null;
  };

  /**
   * 追加ダイアログを閉じた後の処理を制御します。
   *
   * @private
   * @memberof SnNavSectionLabel
   */
  private _handleAfterHideAdd = (e: CustomEvent) => {
    if (e.target !== e.currentTarget) return;
    this._isAddDialogOpen = false;
    this._editingLabel = null;
  };

  // ------------------------------
  // 削除
  // ------------------------------

  /**
   * 選択されたラベルの内容をセットし、削除確認ダイアログを表示します。
   *
   * @private
   * @param {Label} label
   * @memberof SnNavSectionLabel
   */
  private _handleDeleteOpen = (label: Label) => {
    this._editingLabel = label;
    this._isDeleteDialogOpen = true;
  };

  /**
   * ダイアログで確認したラベルを削除します。
   *
   * @private
   * @return {*}
   * @memberof SnNavSectionLabel
   */
  private _handleDeleteConfirm = async (): Promise<void> => {
    if (!this._editingLabel?.id) return;

    await snDB.labels.delete(this._editingLabel.id);
    this._isDeleteDialogOpen = false;
    this._editingLabel = null;
  };

  /**
   * 削除ダイアログを閉じた後の処理を制御します。
   *
   * @private
   * @memberof SnNavSectionLabel
   */
  private _handleAfterHideDelete = (e: CustomEvent) => {
    if (e.target !== e.currentTarget) return;
    this._isDeleteDialogOpen = false;
    this._editingLabel = null;
  };

  // ------------------------------
  // ラベルアイテム
  // ------------------------------

  /**
   * クリックしたラベルの選択状態を変更します。
   *
   * @private
   * @param {Label} label
   * @memberof SnNavSectionLabel
   */
  private _handleLabelClick = async (label: Label) => {
    if (label.id) {
      if (label.isSelected) {
        await snDB.labelRepo.deSelectLabelAndDeSelectTask();
      } else {
        await snDB.labelRepo.selectLabelAndDeSelectTask(label.id);
      }
    }
  };

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * ナビゲーションのセクションをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnNavSectionLabel
   */
  protected render(): HTMLTemplateResult {
    if (!this._labels) {
      return html``;
    }
    return html`<div id="contents-root">
      ${this._renderHeader()}
      <div class="search">
        <search-input @input-keyword=${this._filterLabels}></search-input>
      </div>
      ${this._renderContents()}
      ${this._renderAddDialog()}${this._renderDeleteDialog()}
    </div>`;
  }

  /**
   * ヘッダーをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNavSectionLabel
   */
  private _renderHeader(): HTMLTemplateResult {
    return html` <div class="header">
      <span class="title">LABELS</span>
      <wa-tooltip for="btn-add" placement="left">Add</wa-tooltip>
      <wa-icon
        id="btn-add"
        library="my-icons"
        name="plus-solid-full"
        @click=${this._handleAddClick}
      ></wa-icon>
    </div>`;
  }

  /**
   * コンテンツをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNavSectionLabel
   */
  private _renderContents(): HTMLTemplateResult {
    return html` <div class="contents">
      ${repeat(
        this._labels,
        (label) => label.id,
        (label) =>
          html`<sn-nav-item
            .editable=${true}
            ?selected=${label.isSelected === 1}
            @click-nav-item=${() => this._handleLabelClick(label)}
            @click-property=${() => this._handlePropertyClick(label)}
            @click-delete=${() => this._handleDeleteOpen(label)}
          >
            ${label.name}
          </sn-nav-item>`,
      )}
    </div>`;
  }

  /**
   * ラベル追加ダイアログをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNavSectionLabel
   */
  private _renderAddDialog(): HTMLTemplateResult {
    return html` <wa-dialog
      label="Label Editor"
      id="add-dialog-overview"
      .open=${this._isAddDialogOpen}
      @wa-after-hide=${this._handleAfterHideAdd}
    >
      <form id="label-form" @submit=${this._handleSaveSubmit}>
        <wa-input
          id="label-name"
          name="labelName"
          placeholder="ラベル名"
          size="small"
          class="dialog-item"
          .value=${this._editingLabel?.name ?? ""}
          @input=${this._handleLabelInput}
        >
          <wa-icon
            slot="end"
            library="my-icons"
            name="tag-solid-full"
          ></wa-icon>
        </wa-input>
      </form>
      <wa-button
        slot="footer"
        variant="brand"
        size="small"
        type="submit"
        form="label-form"
      >
        保存
      </wa-button>
    </wa-dialog>`;
  }

  /**
   * ラベル削除ダイアログをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNavSectionLabel
   */
  private _renderDeleteDialog(): HTMLTemplateResult {
    return html` <wa-dialog
      .label=${this._editingLabel
        ? `Delete "${this._editingLabel.name}" ?`
        : "Confirm Delete"}
      .open=${this._isDeleteDialogOpen}
      @wa-after-hide=${this._handleAfterHideDelete}
    >
      <div class="delete-confirmation">
        この操作は取り消せません。<br />
        このラベルが設定されているタスクは「未分類」になります。
      </div>
      <wa-button
        slot="footer"
        variant="danger"
        appearance="accent"
        size="small"
        @click=${this._handleDeleteConfirm}
      >
        削除
      </wa-button>
      <wa-button
        slot="footer"
        variant="neutral"
        appearance="filled-outlined"
        size="small"
        data-dialog="close"
      >
        キャンセル
      </wa-button>
    </wa-dialog>`;
  }
}
