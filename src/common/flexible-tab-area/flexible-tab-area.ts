import {
  LitElement,
  html,
  unsafeCSS,
  HTMLTemplateResult,
  type PropertyValues,
} from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { withStatic } from "lit/static-html.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

import WaTabGroup from "@awesome.me/webawesome/dist/components/tab-group/tab-group.js";

import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "./flexible-tab-area.lit.scss?inline";

/**
 * タブ表示対象の設定情報
 *
 * @export
 * @interface tabConfig
 */
export interface config {
  id: string;
  label: string;
  mark?: boolean;
}

setBasePath("/");
@customElement("flexible-tab-area")
export class FlexibleTabArea extends LitElement {
  /**
   * タブ表示するコンテンツの設定情報
   *
   * @type {tabConfig[]}
   * @memberof FlexibleTabArea
   */
  @property({ type: Array }) tabs: config[] = [];

  /**
   * 選択中のタブID
   *
   * @memberof FlexibleTabArea
   */
  @property({ type: String, attribute: "active-tab-id" }) activeTabId = "";

  /**
   * タブグループ
   *
   * @type {WaTabGroup}
   * @memberof FlexibleTabArea
   */
  @query("#tab-group") tabGroup!: WaTabGroup;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof PSTask
   */
  static styles = [unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------
  /**
   * DOM生成後に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnTaskProperty
   */
  protected updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);

    if (
      (_changedProperties.has("activeTabId") ||
        _changedProperties.has("tabs")) &&
      this.tabGroup
    ) {
      const targetId = this.activeTabId || this.tabs[0]?.id;
      if (targetId && this.tabGroup.active !== targetId) {
        this.tabGroup.active = targetId;
      }
    }
  }

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * タスク詳細をレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof PSTask
   */
  protected render(): HTMLTemplateResult {
    return html` <div id="contents-root">
      <div class="header">
        <div class="text"><slot></slot></div>
        <slot name="end"></slot>
      </div>
      <div class="contents">
        <wa-tab-group id="tab-group">
          ${this.tabs.map((config) => {
            return html`<wa-tab panel="${config.id}">
              ${config.mark
                ? html`<wa-icon
                    library="my-icons"
                    name="circle-solid-full"
                  ></wa-icon>`
                : html``}
              ${config.label}
            </wa-tab>`;
          })}
          ${this.tabs.map((config) => {
            return withStatic(html)`
              <wa-tab-panel name="${config.id}">
                <slot name="${config.id}"></slot>
              </wa-tab-panel>`;
          })}
        </wa-tab-group>
      </div>
    </div>`;
  }
}
