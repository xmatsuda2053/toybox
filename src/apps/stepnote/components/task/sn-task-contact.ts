// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { repeat } from "lit/directives/repeat.js";

// Third-party UI & SDKs (WebAwesome)
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Database, Models)
import { Contact } from "@sn/models/Contact";

// Internal Shared (Utils)
import { emit } from "@utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/task/sn-task-contact.lit.scss?inline";

// Initializations
setBasePath("/");

/**
 * 画面項目
 *
 * @interface item
 */
interface DisplayItem {
  id: keyof Contact;
  placeholder: string;
  icon: string;
}

/**
 * 画面項目定義
 */
const DISPLAY_ITEMS: DisplayItem[] = [
  {
    id: "div",
    placeholder: "所属...",
    icon: "building-solid-full",
  },
  {
    id: "name",
    placeholder: "氏名...",
    icon: "circle-user-solid-full",
  },
  {
    id: "tel",
    placeholder: "電話番号...",
    icon: "phone-solid-full",
  },
] as const;

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
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTaskContact
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * 入力のイベントを発生させる。
   *
   * @private
   * @memberof SnTaskContact
   */
  private _handleInput(e: Event) {
    const inputElement = e.target as WaInput;
    const fieldId = inputElement.id as keyof Contact;
    const newValue = inputElement.value ?? "";

    // 親が直接参照しに来るオブジェクトの「中身（値）」だけをピンポイントで更新
    if (this.contact) {
      this.contact[fieldId] = newValue;
    }
    emit(this, "input");
  }

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------
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
      ${repeat(
        DISPLAY_ITEMS,
        (item) => item.id,
        (item) => {
          return html`<wa-input
            id=${item.id}
            size="small"
            placeholder=${item.placeholder}
            .value=${live(this.contact[item.id] ?? "")}
            @input=${this._handleInput}
          >
            <wa-icon library="my-icons" name=${item.icon} slot="end"></wa-icon>
          </wa-input>`;
        },
      )}
    </div> `;
  }
}
