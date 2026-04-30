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
import { registerIconLibrary } from "@awesome.me/webawesome/dist/webawesome.js";
import { live } from "lit/directives/live.js";
import WaDropdownItem from "@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js";

// 3. Internal Assets & Logic
import { icons } from "@assets/icons";
import "@/library";
import { snDB } from "@sn/database/SnDB";
import { ScheduleUtils } from "@/utils/ScheduleUtils";

// 4. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "./app-container.lit.scss?inline";

// 5. Initializations (Side Effects)
setBasePath("/");

type sKey = "F1" | "F2" | "F3";
interface AppItem {
  code: string;
  label: string;
  tag: HTMLTemplateResult;
  key: sKey;
}

const APP_LIST: AppItem[] = [
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
];

/**
 * アプリケーションコンテナー
 *
 * @export
 * @class AppContainer
 * @extends {LitElement}
 */
@customElement("app-container")
export class AppContainer extends LitElement {
  /**
   * スケジュール管理用のインスタンスを準備
   *
   * @private
   * @memberof SnMenu
   */
  private _exportScheduler = new ScheduleUtils(
    [
      { hour: 8, minute: 30 },
      { hour: 12, minute: 0 },
      { hour: 17, minute: 15 },
      { hour: 20, minute: 0 },
    ],
    () => this._exportData(),
  );

  /**
   * データをエクスポートする
   *
   * @private
   * @memberof StepNoteApp
   */
  private async _exportData() {
    await snDB.exportDatabase();
  }

  /**
   * 選択中のアプリ
   *
   * @type {App}
   * @memberof AppContainer
   */
  @state() selectedApp: AppItem = APP_LIST[0];

  /**
   * ショートカットキーによるアプリ切り替え
   *
   * @private
   * @param {KeyboardEvent} e
   * @memberof AppContainer
   */
  private _appSelect = (e: KeyboardEvent) => {
    if (!e.shiftKey) return;

    const app = APP_LIST.find((a) => a.key === e.key);

    if (app) {
      e.preventDefault();
      this.selectedApp = app;
    }
  };

  /**
   * Creates an instance of AppContainer.
   * @memberof AppContainer
   */
  constructor() {
    super();

    window.addEventListener("keydown", this._appSelect);

    // 独自アイコンを登録
    registerIconLibrary("my-icons", {
      resolver: (name: string) => {
        if (name in icons) {
          return `data:image/svg+xml;utf8,${encodeURIComponent(icons[name])}`;
        }
        return "";
      },
      mutator: (svg) => svg.setAttribute("fill", "currentColor"),
    });
  }

  /**
   * コンポーネント追加時
   *
   * @memberof SnMenu
   */
  connectedCallback() {
    super.connectedCallback();
    // スケジュール開始
    this._exportScheduler.start();
  }

  /**
   * コンポーネント破棄時にリスナーを削除（メモリリーク防止）
   *
   * @memberof AppContainer
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._appSelect);
    this._exportScheduler.stop();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof AppContainer
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof AppContainer
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <header>
        <div class="app-icon">
          <wa-icon library="my-icons" name="cubes-stacked-solid-full"></wa-icon>
        </div>
        <wa-dropdown>
          <div class="menu-header" slot="trigger">
            <span>File(F)</span>
            <wa-icon library="my-icons" name="caret-down-solid-full"></wa-icon>
          </div>
          <wa-dropdown-item>設定</wa-dropdown-item>
        </wa-dropdown>
        <wa-dropdown @wa-select=${this._appDropDownSelect}>
          <div class="menu-header" slot="trigger">
            <span>App(A)</span>
            <wa-icon library="my-icons" name="caret-down-solid-full"></wa-icon>
          </div>
          ${APP_LIST.map((app) => {
            return html`<wa-dropdown-item
              .value=${app.code}
              type="checkbox"
              ?checked=${live(this.selectedApp.code === app.code)}
            >
              ${app.label}
              <span slot="details">Shit + ${app.key}</span>
            </wa-dropdown-item>`;
          })}
        </wa-dropdown>
        <wa-dropdown>
          <div class="menu-header" slot="trigger">
            <span>Tool(T)</span>
            <wa-icon library="my-icons" name="caret-down-solid-full"></wa-icon>
          </div>
          <wa-dropdown-item>xxx</wa-dropdown-item>
        </wa-dropdown>
      </header>
      <main>${this.selectedApp.tag}</main>
      <footer>
        <div class="footer"></div>
        <div class="footer"></div>
        <div class="footer app-name">
          <wa-icon library="my-icons" name="caret-right-solid-full"></wa-icon>
          ${this.selectedApp.label}
          <wa-icon library="my-icons" name="caret-left-solid-full"></wa-icon>
        </div>
        <div class="footer"></div>
        <div class="footer"></div>
      </footer>
    </div>`;
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
    const app = APP_LIST.find((a) => a.code === item.value);

    if (!app) return;

    if (this.selectedApp === app) {
      item.checked = true;
      return;
    }

    this.selectedApp = app;
  }

  /**
   * スタイルシートを適用します。
   *
   * @static
   * @memberof AppContainer
   */
  static styles = css`
    ${unsafeCSS(styles)}
  `;
}
