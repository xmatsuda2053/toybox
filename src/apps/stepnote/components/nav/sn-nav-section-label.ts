// 1. Core Libraries (Lit & Dexie)
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";
import { liveQuery, type Subscription } from "dexie";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

// 3. Third-party UI & SDKs (WebAwesome)
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import WaSwitch from "@awesome.me/webawesome/dist/components/switch/switch.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Database, Models)
import { snDB } from "@sn/database/SnDB";
import { Label } from "@sn/models/Label";

// 5. Internal Shared (Utils)
import { debounce } from "@/utils/CommonUtils";

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
   * 追加ダイアログ
   *
   * @private
   * @type {WaDialog}
   * @memberof SnNavSectionLabel
   */
  @query("#add-dialog-overview") private _addDialog!: WaDialog;

  /**
   * 削除ダイアログ
   *
   * @private
   * @type {WaDialog}
   * @memberof SnNavSectionLabel
   */
  @query("#delete-dialog-overview") private _deleteDialog!: WaDialog;

  /**
   * 編集フォーム
   *
   * @private
   * @type {HTMLFormElement}
   * @memberof SnNavSectionLabel
   */
  @query("#label-form") private labelForm!: HTMLFormElement;

  /**
   * 編集ラベルID
   *
   * @private
   * @type {WaInput}
   * @memberof SnNavSectionLabel
   */
  @query("#label-id") private labelIdInput!: WaInput;

  /**
   * 編集ラベル名
   *
   * @private
   * @type {WaInput}
   * @memberof SnNavSectionLabel
   */
  @query("#label-name") private labelNameInput!: WaInput;

  /**
   * 選択中ラベル
   *
   * @private
   * @type {WaSwitch}
   * @memberof SnNavSectionLabel
   */
  @query("#label-selected") private labelSelectedSwitch!: WaSwitch;

  /**
   * ラベル一覧
   *
   * @private
   * @type {Label[]}
   * @memberof SnNavSectionLabel
   */
  @state() private _labels: Label[] = [];

  /**
   * 検索時ローディング制御
   *
   * @private
   * @memberof SnNavSectionLabel
   */
  @state() private _loading = false;

  /**
   * 検索フィルタのキーワード
   *
   * @private
   * @type {string}
   * @memberof SnNavSectionLabel
   */
  @state() private _filterKeyword: string = "";

  /**
   * Labelテーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnNavSectionLabel
   */
  private _dbSubscription?: Subscription;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnNavSectionLabel
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
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnNavSectionLabel
   */
  connectedCallback() {
    super.connectedCallback();
    this._subscribeLabels();
  }

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
      snDB.selectLabelsAscName(this._filterKeyword),
    );

    this._dbSubscription = observable.subscribe({
      next: (data) => {
        this._labels = data;
        this._loading = false;
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

  /**
   * 検索処理にデバウンスを設定します。
   *
   * @private
   * @memberof SnNavSectionLabel
   */
  private _debouncedSearch = debounce(async (keyword: string) => {
    this._filterKeyword = keyword;
    this._subscribeLabels();
  }, 300);

  /**
   * ラベル一覧にフィルタをかける。
   *
   * @private
   * @param {Event} e
   * @memberof SnNavSectionLabel
   */
  private async _filterLabels(e: Event) {
    const keyword = (e.target as WaInput).value ?? "";
    if (keyword) this._loading = true;
    this._debouncedSearch(keyword);
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
    this._debouncedSearch.cancel();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnNavSectionLabel
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

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
      <div class="header">
        LABELS
        <span class="end"></span>
        <wa-icon
          library="my-icons"
          name="plus-solid-full"
          @click=${() => {
            this.labelForm.reset();
            this._addDialog.open = true;
          }}
        ></wa-icon>
      </div>
      <div class="search">
        <wa-input
          size="small"
          placeholder="filter inquiries..."
          with-clear
          @input=${this._filterLabels}
        >
          ${this._loading ? html`<wa-spinner slot="end"></wa-spinner>` : ""}
          <wa-icon
            slot="end"
            library="my-icons"
            name="magnifying-glass-solid-full"
          ></wa-icon>
        </wa-input>
      </div>
      <div class="contents">
        ${repeat(
          this._labels,
          (label) => label.id,
          (label) =>
            html`<sn-nav-item
              .editable=${true}
              .isSelected=${label.isSelected === 1}
              @click-nav-item=${() => this._handleClickLabel(label)}
              @click-property=${() => this._showLabelProperties(label)}
              @click-delete=${() => this._OpenDeleteDialog(label)}
            >
              ${label.name}
            </sn-nav-item>`,
        )}
      </div>
      <wa-dialog label="Label Editor" id="add-dialog-overview">
        <form id="label-form" @submit=${this._saveLabel}>
          <wa-input id="label-id" class="hidden-item" disabled></wa-input>
          <wa-switch
            id="label-selected"
            class="hidden-item"
            disabled
          ></wa-switch>
          <wa-input
            id="label-name"
            name="labelName"
            placeholder="ラベル名"
            size="small"
            class="dialog-item"
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
      </wa-dialog>
      <wa-dialog label="Confirm Delete" id="delete-dialog-overview">
        <div class="delete-confirmation">
          この操作は取り消せません。<br />
          このラベルが設定されているタスクは「未分類」になります。
        </div>
        <wa-button
          slot="footer"
          variant="neutral"
          appearance="filled-outlined"
          size="small"
          data-dialog="close"
        >
          キャンセル
        </wa-button>
        <wa-button
          slot="footer"
          variant="danger"
          appearance="accent"
          size="small"
          @click=${this._deleteLabel}
        >
          削除
        </wa-button>
      </wa-dialog>
    </div>`;
  }

  /**
   * ラベル編集内容を保存する
   *
   * @private
   * @param {Event} e
   * @memberof SnNavSectionLabel
   */
  private async _saveLabel(e: Event) {
    e.preventDefault();

    const label: Label = {
      name: this.labelNameInput.value as string,
      isSelected: 0,
    };

    if (this.labelIdInput.value) {
      // 編集の場合はIDをセット
      label.id = Number(this.labelIdInput.value);
      label.isSelected = (this.labelSelectedSwitch.checked as boolean) ? 1 : 0;
    }

    const id = await snDB.putLabel(label);
    await snDB.updateLabelSelection(id, 1);

    this._addDialog.open = false;
    this.labelForm.reset();
  }

  /**
   * クリックしたラベルの選択状態を変更します。
   *
   * @private
   * @param {Label} label
   * @memberof SnNavSectionLabel
   */
  private async _handleClickLabel(label: Label) {
    if (label.id) {
      await snDB.updateLabelSelection(label.id, !label.isSelected ? 1 : 0);
      await snDB.resetTaskSelected();
    }
  }

  /**
   * 選択されたラベルの内容をセットし、ラベル編集画面を表示します。
   *
   * @private
   * @param {Label} label
   * @memberof SnNavSectionLabel
   */
  private _showLabelProperties(label: Label) {
    this.labelForm.reset();
    this.labelIdInput.value = label.id?.toString() || "";
    this.labelNameInput.value = label.name;
    this.labelSelectedSwitch.checked = label.isSelected === 1;
    this._addDialog.open = true;
  }

  /**
   * 選択されたラベルの内容をセットし、削除確認ダイアログを表示します。
   *
   * @private
   * @param {Label} label
   * @memberof SnNavSectionLabel
   */
  private _OpenDeleteDialog(label: Label) {
    this._deleteDialog.label = `Delete "${label.name}" ?`;
    this._deleteDialog.dataset.labelId = label.id?.toString() || "";
    this._deleteDialog.open = true;
  }

  /**
   * ダイアログで確認したラベルを削除します。
   *
   * @private
   * @return {*}
   * @memberof SnNavSectionLabel
   */
  private async _deleteLabel() {
    const labelId = this._deleteDialog.dataset.labelId;
    if (!labelId) {
      console.error("Invalid label ID for deletion");
      return;
    }

    await snDB.labels.delete(Number(labelId));
    this._deleteDialog.dataset.labelId = "";
    this._deleteDialog.open = false;
  }
}
