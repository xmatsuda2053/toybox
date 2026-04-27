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

// 2. Decorators & Directives
import { customElement, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

// 3. Third-party Components & Utils
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import { classMap } from "lit/directives/class-map.js";
import Papa from "papaparse";

// 4. Internal Modules (Utils, Database, Models, Shared Components)
import { isNotBlank } from "@/utils/CommonUtils";
import { FileData, Category } from "@ha/models/FileData";
import { haDB } from "@ha/database/HaDB";
import { Staff } from "@ha/models/Staff";
import { Division } from "./models/Division";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@ha/styles/hub-address-app.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

@customElement("hub-address-app")
export class HubAddressApp extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof HubAddressApp
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
   * 職員情報
   *
   * @type {FileData[]}
   * @memberof HubAddressApp
   */
  @state() _staffs: FileData[] | undefined = undefined;

  /**
   * 組織情報
   *
   * @type {FileData[]}
   * @memberof HubAddressApp
   */
  @state() _divs: FileData[] | undefined = undefined;

  /**
   * 職員情報の検索キーワード
   *
   * @type {string}
   * @memberof HubAddressApp
   */
  @state() _keywordStaff: string = "";

  /**
   * 組織情報の検索キーワード
   *
   * @type {string}
   * @memberof HubAddressApp
   */
  @state() _keywordDiv: string = "";

  /**
   * テーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnList
   */
  private _dbSubscription?: Subscription;

  /**
   * Creates an instance of HubAddressApp.
   * @memberof HubAddressApp
   */
  constructor() {
    super();
  }

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof HubAddressApp
   */
  connectedCallback() {
    super.connectedCallback();
    this._subscribe();
  }

  /**
   * テーブル状態が更新された場合に最新データを取得します。
   * フィルタ用のキーワードが変更された場合にも実行します。
   *
   * @private
   * @memberof HubAddressApp
   */
  private _subscribe() {
    this._dbSubscription?.unsubscribe();

    const observable = liveQuery(async () => {
      const [staffs, divs, kStaff, kDiv] = await Promise.all([
        haDB.getDataByCategoryAndFilter("staff"),
        haDB.getDataByCategoryAndFilter("div"),
        haDB.getSearchKeywordByCategory("staff"),
        haDB.getSearchKeywordByCategory("div"),
      ]);
      return { staffs, divs, kStaff, kDiv };
    });

    this._dbSubscription = observable.subscribe({
      next: async (data) => {
        this._staffs = data.staffs;
        this._divs = data.divs;
        this._keywordStaff = data.kStaff;
        this._keywordDiv = data.kDiv;
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof HubAddressApp
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * 職員情報が未登録であるか判定します。
   *
   * @private
   * @return {*}  {boolean}
   * @memberof HubAddressApp
   */
  private isEmptyStaff(): boolean {
    if (!this._staffs) return false;

    return this._staffs?.length === 0 && this._keywordStaff === "";
  }

  /**
   * 組織情報が未登録であるか判定します。
   *
   * @private
   * @return {*}  {boolean}
   * @memberof HubAddressApp
   */
  private isEmptyDiv(): boolean {
    if (!this._divs) return false;

    return this._divs?.length === 0 && this._keywordDiv === "";
  }

  /**
   * コンポーネントのメインレイアウトをレンダリングします。
   * アプリケーションの基本構造を定義します。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof HubAddressApp
   */
  protected render(): HTMLTemplateResult {
    const viewerStaffClassMap = classMap({
      viewer: true,
      empty: this.isEmptyStaff(),
      loading: this._staffs === undefined,
    });

    const viewerSDivClassMap = classMap({
      viewer: true,
      empty: this.isEmptyDiv(),
      loading: this._divs === undefined,
    });

    return html`<div id="contents-root" @click-item=${this.clickItem}>
      <div class="menu">
        <ha-menu
          @delete-data=${this.deleteData}
          @clear=${this.clearKeyword}
        ></ha-menu>
      </div>
      <div class="base staff">
        <div class="search">
          <ha-search-input
            searchKeyword=${this._keywordStaff}
            @input-search=${(e: CustomEvent) => this._searchData(e, "staff")}
          ></ha-search-input>
        </div>
        <div class=${viewerStaffClassMap}>
          ${this._renderUploader(this.isEmptyStaff(), "staff", "職員情報")}
          ${this._renderStaffData()}
        </div>
      </div>
      <div class="divider">
        <wa-divider orientation="vertical"></wa-divider>
      </div>
      <div class="base div">
        <div class="search">
          <ha-search-input
            searchKeyword=${this._keywordDiv}
            @input-search=${(e: CustomEvent) => this._searchData(e, "div")}
          ></ha-search-input>
        </div>
        <div class=${viewerSDivClassMap}>
          ${this._renderUploader(this.isEmptyDiv(), "div", "組織情報")}
          ${this._renderDivData()}
        </div>
      </div>
    </div>`;
  }

  /**
   * ファイルアップローダーをレンダリングします。
   *
   * @private
   * @param {boolean} emptyData
   * @param {Category} category
   * @param {string} label
   * @return {*}  {HTMLTemplateResult}
   * @memberof HubAddressApp
   */
  private _renderUploader(
    emptyData: boolean,
    category: Category,
    label: string,
  ): HTMLTemplateResult {
    if (!emptyData) return html``;

    /**
     * CSVファイルの内容をFileData型配列にパースします。
     *
     * @param {File} file
     * @param {Category} category
     * @return {*}  {Promise<FileData[]>}
     */
    const parseCsvToFileData = async (
      file: File,
      category: Category,
    ): Promise<FileData[]> => {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true, // 1行目をキーとして扱う
          skipEmptyLines: true, // 空行を除外
          complete: (results) => {
            const fileData = results.data.map((row: any): FileData => {
              const searchTerms = Object.values(row)
                .filter((val) => isNotBlank(String(val)))
                .map((val) => String(val).toLowerCase());

              return {
                data: row,
                category: category,
                searchTerms: searchTerms,
              };
            });

            resolve(fileData);
          },
          error: (error) => {
            reject(error);
          },
        });
      });
    };

    /**
     * CSVデータ内容をアップロードします。
     *
     * @param {CustomEvent} e
     * @param {Category} category
     */
    const uploadData = async (e: CustomEvent, category: Category) => {
      const file = e.detail.file;
      const fileData = await parseCsvToFileData(file, category);
      await haDB.importData(fileData);
    };

    return html`<ha-uploader
      @upload-file=${(e: CustomEvent) => uploadData(e, category)}
    >
      ${label}
    </ha-uploader>`;
  }

  /**
   * 職員情報をレンダリングします。
   *
   * @private
   * @param {boolean} emptyData
   * @return {*}  {HTMLTemplateResult}
   * @memberof HubAddressApp
   */
  private _renderStaffData(): HTMLTemplateResult {
    if (!this._staffs) return html`<wa-spinner></wa-spinner>`;

    if (this.isEmptyStaff()) return html``;

    const header: Staff = {
      staffId: "職員番号",
      nameKj: "氏名",
      nameKn: "",
      div: "所属",
      post: "役職",
      mail1: "メールアドレス（lg）",
      mail2: "メールアドレス（mie）",
    };

    return html` <ha-viewer-staff .staffData=${header} header>
      </ha-viewer-staff>
      ${repeat(
        this._staffs,
        (staff) => staff.id,
        (staff, index) => {
          const isOdd = (index + 1) % 2 !== 0;
          const data: Staff = {
            staffId: staff.data["staffId"],
            nameKj: staff.data["nameKj"],
            nameKn: staff.data["nameKn"],
            div: staff.data["div"],
            post: staff.data["post"],
            mail1: staff.data["mail1"],
            mail2: staff.data["mail2"],
          };
          return html` <ha-viewer-staff
            .staffData=${data}
            ?odd=${isOdd}
            ?even=${!isOdd}
            item
          >
          </ha-viewer-staff>`;
        },
      )}`;
  }

  /**
   * 組織情報をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof HubAddressApp
   */
  private _renderDivData(): HTMLTemplateResult {
    if (!this._divs) return html`<wa-spinner></wa-spinner>`;

    if (this.isEmptyDiv()) return html``;

    const header: Division = {
      place: "場所",
      div1: "所属（部局 / 課 / 係）",
      div2: "",
      div3: "",
      post: "役職",
      other: "その他組織・施設・部屋",
      tel1: "内線",
      tel2: "外線",
      fax: "FAX",
      remark: "備考",
    };

    return html`<ha-viewer-div .divData=${header} header></ha-viewer-div>
      ${repeat(
        this._divs,
        (div) => div.id,
        (div, index) => {
          const isOdd = (index + 1) % 2 !== 0;
          const data: Division = {
            place: div.data["place"],
            div1: div.data["div1"],
            div2: div.data["div2"],
            div3: div.data["div3"],
            post: div.data["post"],
            other: div.data["other"],
            tel1: div.data["tel1"],
            tel2: div.data["tel2"],
            fax: div.data["fax"],
            remark: div.data["remark"],
          };
          return html` <ha-viewer-div
            .divData=${data}
            ?odd=${isOdd}
            ?even=${!isOdd}
            item
          >
          </ha-viewer-div>`;
        },
      )}`;
  }

  /**
   * 検索処理を実行します。
   *
   * @private
   * @param {CustomEvent} e
   * @param {Category} category
   * @memberof HubAddressApp
   */
  private async _searchData(e: CustomEvent, category: Category) {
    const keyword = e.detail.keyword;
    await haDB.putSearchKeyword(category, keyword);
  }

  /**
   * 検索キーワードをクリアします。
   *
   * @private
   * @memberof HubAddressApp
   */
  private async clearKeyword() {
    await haDB.clearSearchKeyword();
  }

  /**
   * 登録データを削除します。
   *
   * @private
   * @memberof HubAddressApp
   */
  private async deleteData() {
    await haDB.clearSearchKeyword();
    await haDB.deleteData();
  }

  /**
   * クリックしたアイテムの内容をクリップボードにコピーする。
   * 名前が設定されている場合、検索文字列として登録する。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof HubAddressApp
   */
  private async clickItem(e: CustomEvent) {
    e.preventDefault();

    // クリップボードにコピー
    const text = e.detail.text;
    if (!text) return;
    await navigator.clipboard.writeText(text);

    // 検索対象チェック
    const search = e.detail.search;
    if (!search) return;

    // 検索実行
    const category: Category = e.detail.category === "staff" ? "div" : "staff";

    await haDB.concatSearchKeyword(category, text);
  }
}
