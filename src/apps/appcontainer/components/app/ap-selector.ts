// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Library Extensions & Third-party
import { customElement, state } from "lit/decorators.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaDropdownItem from "@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js";
import { live } from "lit/directives/live.js";

// 3. Internal Assets & Logic
import { AppItem } from "@ap/models/AppItem";
import { emit } from "@/utils/EventUtils";

// 4. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "@ap/styles/_header-item.lit.scss?inline";

// 5. Initializations (Side Effects)
setBasePath("/");

/**
 * アプリケーションコンテナー
 *
 * @export
 * @class ApSelector
 * @extends {LitElement}
 */
@customElement("ap-selector")
export class ApSelector extends LitElement {
  /**
   * スタイルシートを適用します。
   *
   * @static
   * @memberof ApSelector
   */
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  /**
   * メニューに登録するアプリケーション
   *
   * @type {AppItem[]}
   * @memberof ApSelector
   */
  APP_LIST: AppItem[] = [
    {
      code: "step-note",
      label: "Step-Note",
      tag: html`<step-note-app class="app"></step-note-app>`,
      key: "F1",
    },
    {
      code: "hub-address",
      label: "Hub-Address",
      tag: html`<hub-address-app class="app"></hub-address-app>`,
      key: "F2",
    },
    {
      code: "fill-go",
      label: "Fill-Go",
      tag: html`<fill-go-app class="app"></fill-go-app>`,
      key: "F3",
    },
  ];

  /**
   * 選択中のアプリ
   *
   * @type {App}
   * @memberof AppContainer
   */
  @state() selectedApp: AppItem = this.APP_LIST[0];

  /**
   * アプリ切り替えイベントを発行します。
   *
   * @private

   * @memberof ApSelector
   */
  private _setApp() {
    emit(this, "set-app", { detail: { app: this.selectedApp } });
  }

  /**
   * ショートカットキーによるアプリ切り替え
   *
   * @private
   * @param {KeyboardEvent} e
   * @memberof AppContainer
   */
  private _appSelect = (e: KeyboardEvent) => {
    if (!e.shiftKey) return;

    const app = this.APP_LIST.find((a) => a.key === e.key);

    if (app) {
      e.preventDefault();
      this.selectedApp = app;
      this._setApp();
    }
  };

  /**
   * Creates an instance of ApSelector.
   * @memberof ApSelector
   */
  constructor() {
    super();
    window.addEventListener("keydown", this._appSelect);
  }

  /**
   * コンポーネント追加時
   *
   * @memberof ApSelector
   */
  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * コンポーネント破棄時にリスナーを削除（メモリリーク防止）
   *
   * @memberof ApSelector
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._appSelect);
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof ApSelector
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * コンポーネントのDOM追加後、1度だけ実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof ApSelector
   */
  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this._setApp();
  }

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof ApSelector
   */
  protected render(): HTMLTemplateResult {
    return html` <wa-dropdown
      id="dropdown-root"
      @wa-select=${this._appDropDownSelect}
    >
      <div class="menu-header" slot="trigger">
        <span>App(A)</span>
        <wa-icon library="my-icons" name="caret-down-solid-full"></wa-icon>
      </div>
      ${this.APP_LIST.map((app) => {
        return html`<wa-dropdown-item
          .value=${app.code}
          type="checkbox"
          ?checked=${live(this.selectedApp.code === app.code)}
        >
          ${app.label}
          <span slot="details">Shit + ${app.key}</span>
        </wa-dropdown-item>`;
      })}
    </wa-dropdown>`;
  }

  /**
   * APP選択の画面切り替えを制御します。
   *
   * @private
   * @param {CustomEvent} e
   * @return {*}
   * @memberof AppContainer
   */
  private _appDropDownSelect(e: CustomEvent): void {
    const item: WaDropdownItem = e.detail.item;
    const app = this.APP_LIST.find((a) => a.code === item.value);

    if (!app) return;

    if (this.selectedApp === app) {
      item.checked = true;
      return;
    }

    this.selectedApp = app;
    this._setApp();
  }
}
