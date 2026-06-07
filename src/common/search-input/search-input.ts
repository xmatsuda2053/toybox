// Core Libraries (Lit & Dexie)
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, state, property } from "lit/decorators.js";

// Third-party UI & SDKs (WebAwesome)
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";

// Internal Shared (Utils)
import { debounce } from "@/utils/CommonUtils";
import { emit } from "@/utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "./search-input.lit.scss?inline";

// Initializations
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
   * スタイルシートを適用
   *
   * @static
   * @memberof SearchInput
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SearchInput
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._debouncedSearch.cancel();
  }

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

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
  }, 250);

  /**
   * 検索欄の入力時にローディングを表示します。
   *
   * @private
   * @memberof SearchInput
   */
  private _handleKeywordInput = (e: Event) => {
    const input = e.target as WaInput;
    const keyword = input.value ?? "";
    if (keyword) {
      this._loading = true;
    }
    this._debouncedSearch(keyword);
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

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
      class=${this.searchKeyword !== "" ? "has-value" : ""}
      size="small"
      placeholder="filter inquiries..."
      .value=${this.searchKeyword}
      @input=${this._handleKeywordInput}
      with-clear
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
}
