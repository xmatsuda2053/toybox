// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Decorators & Directives
import { customElement, property, state } from "lit/decorators.js";

// 3. Third-party Components & Utils
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import { debounce } from "@/utils/CommonUtils";
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";

// 4. Internal Modules (Database, Models, Shared Components)
import { emit } from "@/utils/EventUtils";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@ha/styles/search/ha-search-input.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

@customElement("ha-search-input")
export class HaSearchInput extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof HaSearchInput
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
   * 検索キーワード
   *
   * @type {string}
   * @memberof HaSearchInput
   */
  @property({ type: String }) searchKeyword: string = "";

  /**
   * 検索時ローディング制御
   *
   * @private
   * @memberof SnList
   */
  @state() private _loading = false;

  /**
   * Creates an instance of HaSearchInput.
   * @memberof HaSearchInput
   */
  constructor() {
    super();
  }

  /**
   * 検索処理にデバウンスを設定します。
   *
   * @private
   * @memberof SnList
   */
  private _debouncedSearch = debounce(async (keyword: string) => {
    emit(this, "input-search", {
      detail: { keyword: keyword.replace(/\s/g, " ") },
    });
    this.searchKeyword = keyword;
    this._loading = false;
  }, 350);

  /**
   * 検索キーワード入力イベントを処理します。
   *
   * @private
   * @param {Event} e
   * @memberof SnList
   */
  private async _filterTasks(e: Event) {
    const keyword = (e.target as WaInput).value ?? "";
    if (keyword) this._loading = true;
    this._debouncedSearch(keyword);
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnList
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._debouncedSearch.cancel();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof HaSearchInput
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * コンポーネントのメインレイアウトをレンダリングします。
   * アプリケーションの基本構造を定義します。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof HaSearchInput
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <wa-input
        placeholder="filter inquiries..."
        size="small"
        .value=${this.searchKeyword}
        @input="${this._filterTasks}"
        with-clear
      >
        ${this._loading ? html`<wa-spinner slot="end"></wa-spinner>` : ""}
        <wa-icon
          slot="start"
          library="my-icons"
          name="magnifying-glass-solid-full"
        ></wa-icon>
      </wa-input>
    </div>`;
  }
}
