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
  @state() _staffs: FileData[] = [];

  /**
   * 組織情報
   *
   * @type {FileData[]}
   * @memberof HubAddressApp
   */
  @state() _divs: FileData[] = [];

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
    this._subscribeLabels();
  }

  /**
   * テーブル状態が更新された場合に最新データを取得します。
   * フィルタ用のキーワードが変更された場合にも実行します。
   *
   * @private
   * @memberof HubAddressApp
   */
  private _subscribeLabels() {
    this._dbSubscription?.unsubscribe();
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

    const observable = liveQuery(async () => {
      const [staffs, divs] = await Promise.all([
        haDB.getDataByCategory("staff"),
        haDB.getDataByCategory("div"),
      ]);
      return { staffs, divs };
    });

    this._dbSubscription = observable.subscribe({
      next: async (data) => {
        this._staffs = data.staffs;
        this._divs = data.divs;
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
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
    const emptyStaffData = this._staffs?.length === 0;
    const viewerStaffClassMap = classMap({
      viewer: true,
      empty: emptyStaffData,
    });

    const emptyDivData = this._divs?.length === 0;
    const viewerSDivClassMap = classMap({
      viewer: true,
      empty: emptyDivData,
    });

    return html`<div id="contents-root">
      <div class="menu">
        <ha-menu @delete-data=${this.deleteData}></ha-menu>
      </div>
      <div class="base staff">
        <div class="search">
          <ha-search-input></ha-search-input>
        </div>
        <div class=${viewerStaffClassMap}>
          ${this._renderUploader(emptyStaffData, "staff")}
          ${this._renderStaffData()}
        </div>
      </div>
      <div class="divider">
        <wa-divider orientation="vertical"></wa-divider>
      </div>
      <div class="base div">
        <div class="search">
          <ha-search-input></ha-search-input>
        </div>
        <div class=${viewerSDivClassMap}>
          ${this._renderUploader(emptyDivData, "div")} ${this._renderDivData()}
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
   * @return {*}  {HTMLTemplateResult}
   * @memberof HubAddressApp
   */
  private _renderUploader(
    emptyData: boolean,
    category: Category,
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
    ></ha-uploader>`;
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
    if (this._staffs.length === 0) return html``;

    return html` <ha-viewer-staff header>
        <span slot="id">職員番号</span>
        <span slot="name-kj">氏名</span>
        <span slot="name-kn"></span>
        <span slot="div">所属</span>
        <span slot="post">役職</span>
        <span slot="mail1">メールアドレス（lg）</span>
        <span slot="mail2">メールアドレス（mie）</span>
      </ha-viewer-staff>
      ${repeat(
        this._staffs,
        (staff) => staff.id,
        (staff, index) => {
          const isOdd = (index + 1) % 2 !== 0;
          return html` <ha-viewer-staff item ?odd=${isOdd} ?even=${!isOdd}>
            <span slot="id">${staff.data["staffId"]}</span>
            <span slot="name-kj">${staff.data["nameKj"]}</span>
            <span slot="name-kn">${staff.data["nameKn"]}</span>
            <span slot="div">${staff.data["div"]}</span>
            <span slot="post">${staff.data["post"]}</span>
            <span slot="mail1">${staff.data["mail1"]}</span>
            <span slot="mail2">${staff.data["mail2"]}</span>
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
    if (this._divs.length === 0) return html``;
    return html`<ha-viewer-div header>
        <span slot="div">所属（部局 / 課 / 係）</span>
        <span slot="other">その他組織・施設・部屋</span>
        <span slot="place">場所</span>
        <span slot="post">役職</span>
        <span slot="tel1">内線</span>
        <span slot="tel2">外線</span>
        <span slot="fax">FAX</span>
        <span slot="remark">備考</span>
      </ha-viewer-div>
      ${repeat(
        this._divs,
        (div) => div.id,
        (div, index) => {
          const isOdd = (index + 1) % 2 !== 0;
          return html` <ha-viewer-div item ?odd=${isOdd} ?even=${!isOdd}>
            <span slot="div">
              ${div.data["div1"]} ${div.data["div2"]} ${div.data["div3"]}
            </span>
            <span slot="other">${div.data["other"]}</span>
            <span slot="place">${div.data["place"]}</span>
            <span slot="post">${div.data["post"]}</span>
            <span slot="tel1">${div.data["tel1"]}</span>
            <span slot="tel2">${div.data["tel2"]}</span>
            <span slot="fax">${div.data["fax"]}</span>
            <span slot="remark">${div.data["remark"]}</span>
          </ha-viewer-div>`;
        },
      )}`;
  }

  /**
   * 登録データを削除します。
   *
   * @private
   * @memberof HubAddressApp
   */
  private async deleteData() {
    await haDB.deleteData();
  }
}
