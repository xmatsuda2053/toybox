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
import { customElement, query, state } from "lit/decorators.js";

// 3. Third-party Components & Utils
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Modules (Database, Models, Shared Components)

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@ha/styles/viewer/ha-staff-viewer.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

@customElement("ha-staff-viewer")
export class HaStaffViewer extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof HaStaffViewer
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
   * Creates an instance of HaSearchInput.
   * @memberof HaStaffViewer
   */
  constructor() {
    super();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof HaStaffViewer
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
   * @memberof HaStaffViewer
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <div class="card index">
        <div class="id"><span>職員番号</span></div>
        <div class="name-kj"><span>氏名</span></div>
        <div class="name-kn"></div>
        <div class="div-post">
          <span>所属</span><span class="separator">/</span><span>役職</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            メールアドレス(lg)
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            メールアドレス(mie)
          </span>
        </div>
      </div>

      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
      <div class="card item">
        <div class="id"><span>12345</span></div>
        <div class="name-kj"><span>日本 太郎</span></div>
        <div class="name-kn"><span>ニホン タロウ</span></div>
        <div class="div-post">
          <span>第一システム事業部第一システム課</span>
          <span class="separator">/</span>
          <span>主任</span>
        </div>
        <div class="mail mail-1">
          <span>
            <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
            nihon.taro1@japan.mail.co.jp
          </span>
        </div>
        <div class="mail mail-2">
          <span>
            <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
            nihon.taro2@japan.mail.co.jp
          </span>
        </div>
      </div>
    </div>`;
  }
}
