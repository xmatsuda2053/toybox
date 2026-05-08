// 1. Core Libraries (Lit & Dexie)
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, state, property, query } from "lit/decorators.js";

// 3. Third-party UI & SDKs (WebAwesome)
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";

// 4. Internal Shared (Database, Models)

// 5. Internal Shared (Utils)
import { debounce } from "@/utils/CommonUtils";
import { emit } from "@/utils/EventUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "./search-input.lit.scss?inline";

// 7. Initializations
setBasePath("/");

/**
 * ナビゲーションラベル
 *
 * @export
 * @class SearchInput
 * @extends {LitElement}
 */
@customElement("search-input")
export class SearchInput extends LitElement {
  /**
   * 検索時ローディング制御
   *
   * @private
   * @memberof SearchInput
   */
  @state() private _loading = false;

  /**
   * 検索キーワード
   *
   * @memberof SearchInput
   */
  @property({ type: String }) searchKeyword = "";

  /**
   * 入力欄
   *
   * @type {WaInput}
   * @memberof SearchInput
   */
  @query("#search-input") searchInput!: WaInput;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SearchInput
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
   * 検索欄の入力にデバウンスを設定します。
   *
   * @private
   * @memberof SearchInput
   */
  private _debouncedSearch = debounce(async (keyword: string) => {
    emit(this, "input-keyword", {
      detail: { keyword: keyword.replace(/\s/g, " ") },
    });
    this._loading = false;
    this.searchKeyword = keyword;
  }, 350);

  /**
   * 検索欄の入力時にローディングを表示します。
   *
   * @private
   * @memberof SearchInput
   */
  private async _inputKeyword() {
    const keyword = this.searchInput.value ?? "";
    if (keyword) this._loading = true;
    this._debouncedSearch(keyword);
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SearchInput
   */
  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SearchInput
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * コンポーネントをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SearchInput
   */
  protected render(): HTMLTemplateResult {
    return html` <wa-input
      id="search-input"
      class=${this.searchKeyword !== "" ? "has-value" : ""}
      size="small"
      placeholder="filter inquiries..."
      value=${this.searchKeyword}
      with-clear
      @input=${this._inputKeyword}
    >
      ${this._loading
        ? html`<wa-spinner slot="start"></wa-spinner>`
        : html`<wa-icon
            slot="start"
            library="my-icons"
            name="magnifying-glass-solid-full"
          ></wa-icon>`}
    </wa-input>`;
  }

  /**
   * 初期化します。
   *
   * @memberof SearchInput
   */
  public init() {
    this._loading = false;
    this.searchKeyword = "";
    if (this.searchInput) {
      this.searchInput.value = "";
    }
  }
}
