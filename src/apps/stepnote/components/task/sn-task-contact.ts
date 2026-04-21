// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, property, query } from "lit/decorators.js";

// 3. Third-party UI & SDKs (WebAwesome)
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Database, Models)
import { Contact } from "@sn/models/Contact";

// 5. Internal Shared (Utils)
import { emit } from "@utils/EventUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/task/sn-task-contact.lit.scss?inline";

// 7. Initializations
setBasePath("/");

/**
 * タスク連絡先
 *
 * @export
 * @class SnTaskContact
 * @extends {LitElement}
 */
@customElement("sn-task-contact")
export class SnTaskContact extends LitElement {
  /**
   * 連絡先情報
   *
   * @type {Contact}
   * @memberof SnTaskContact
   */
  @property({ type: Object }) contact!: Contact;

  /**
   * 組織名
   *
   * @private
   * @type {WaInput}
   * @memberof SnTaskContact
   */
  @query("#div") private divName!: WaInput;

  /**
   * 氏名
   *
   * @private
   * @type {WaInput}
   * @memberof SnTaskContact
   */
  @query("#user") private userName!: WaInput;

  /**
   * 電話番号
   *
   * @private
   * @type {WaInput}
   * @memberof SnTaskContact
   */
  @query("#tel") private telName!: WaInput;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTaskContact
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
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnTaskContact
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * 連絡先をレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnTaskContact
   */
  protected render(): HTMLTemplateResult {
    if (!this.contact) {
      return html``;
    }

    return html`<div id="contents-root">
      <div class="contents">
        <div class="top-area">
          <wa-input
            id="div"
            size="small"
            placeholder="所属..."
            value=${this.contact.div}
            @input=${this._inputData}
          >
            <wa-icon
              library="my-icons"
              name="building-solid-full"
              slot="end"
            ></wa-icon>
          </wa-input>
        </div>
        <div class="bottom-area">
          <wa-input
            id="user"
            size="small"
            placeholder="氏名..."
            value=${this.contact.name}
            @input=${this._inputData}
          >
            <wa-icon
              library="my-icons"
              name="circle-user-solid-full"
              slot="end"
            ></wa-icon>
          </wa-input>
          <wa-divider orientation="vertical"></wa-divider>
          <wa-input
            id="tel"
            size="small"
            placeholder="電話番号..."
            value=${this.contact.tel}
            @input=${this._inputData}
          >
            <wa-icon
              library="my-icons"
              name="phone-solid-full"
              slot="end"
            ></wa-icon>
          </wa-input>
        </div>
      </div>
    </div>`;
  }

  /**
   * 入力のイベントを発生させる。
   *
   * @private
   * @memberof SnTaskContact
   */
  private _inputData() {
    this.contact.div = this.divName.value!;
    this.contact.name = this.userName.value!;
    this.contact.tel = this.telName.value!;
    emit(this, "input");
  }
}
