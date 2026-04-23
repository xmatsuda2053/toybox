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
import styles from "@ha/styles/viewer/ha-div-viewer.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

@customElement("ha-div-viewer")
export class HaDivViewer extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof HaDivViewer
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
   * Creates an instance of HaDivViewer.
   * @memberof HaDivViewer
   */
  constructor() {
    super();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof HaDivViewer
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
   * @memberof HaDivViewer
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <div class="card index">
        <div class="div"><span>所属 / 場所</span></div>
        <div class="room"><span>その他組織 / 施設 / 部屋</span></div>
        <div class="post"><span>役職</span></div>
        <div class="extension">
          <span>
            <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
            内線
          </span>
        </div>
        <div class="outside-line">
          <span>
            <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
            外線
          </span>
        </div>
        <div class="fax">
          <span>
            <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
            FAX
          </span>
        </div>
        <div class="remark"><span>備考</span></div>
      </div>
      <div class="card item">
        <div class="div">
          <span>第一システム事業部</span>
          <span>第一システム課</span>
          <span>公共システム係</span>
          <span>(1F)</span>
        </div>
        <div class="room"><span>第３営業所</span></div>
        <div class="post"><span>主任</span></div>
        <div class="extension">
          <span>
            <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
            1234
          </span>
        </div>
        <div class="outside-line">
          <span>
            <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
            12-3456
          </span>
        </div>
        <div class="fax">
          <span>
            <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
            65-4321
          </span>
        </div>
        <div class="remark">
          <wa-icon library="my-icons" name="circle-info-solid-full"></wa-icon>
        </div>
      </div>

      <div class="card item">
        <div class="div">
          <span>第一システム事業部</span>
          <span>第一システム課</span>
          <span>公共システム係</span>
          <span>(1F)</span>
        </div>
        <div class="room"><span>第３営業所</span></div>
        <div class="post"><span>主任</span></div>
        <div class="extension">
          <span>
            <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
            1234
          </span>
        </div>
        <div class="outside-line">
          <span>
            <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
            12-3456
          </span>
        </div>
        <div class="fax">
          <span>
            <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
            65-4321
          </span>
        </div>
        <div class="remark">
          <wa-icon library="my-icons" name="circle-info-solid-full"></wa-icon>
        </div>
      </div>
      <div class="card item">
        <div class="div">
          <span>第一システム事業部</span>
          <span>第一システム課</span>
          <span>公共システム係</span>
          <span>(1F)</span>
        </div>
        <div class="room"><span>第３営業所</span></div>
        <div class="post"><span>主任</span></div>
        <div class="extension">
          <span>
            <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
            1234
          </span>
        </div>
        <div class="outside-line">
          <span>
            <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
            12-3456
          </span>
        </div>
        <div class="fax">
          <span>
            <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
            65-4321
          </span>
        </div>
        <div class="remark">
          <wa-icon library="my-icons" name="circle-info-solid-full"></wa-icon>
        </div>
      </div>
      <div class="card item">
        <div class="div">
          <span>第一システム事業部</span>
          <span>第一システム課</span>
          <span>公共システム係</span>
          <span>(1F)</span>
        </div>
        <div class="room"><span>第３営業所</span></div>
        <div class="post"><span>主任</span></div>
        <div class="extension">
          <span>
            <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
            1234
          </span>
        </div>
        <div class="outside-line">
          <span>
            <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
            12-3456
          </span>
        </div>
        <div class="fax">
          <span>
            <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
            65-4321
          </span>
        </div>
        <div class="remark">
          <wa-icon library="my-icons" name="circle-info-solid-full"></wa-icon>
        </div>
      </div>
      <div class="card item">
        <div class="div">
          <span>第一システム事業部</span>
          <span>第一システム課</span>
          <span>公共システム係</span>
          <span>(1F)</span>
        </div>
        <div class="room"><span>第３営業所</span></div>
        <div class="post"><span>主任</span></div>
        <div class="extension">
          <span>
            <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
            1234
          </span>
        </div>
        <div class="outside-line">
          <span>
            <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
            12-3456
          </span>
        </div>
        <div class="fax">
          <span>
            <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
            65-4321
          </span>
        </div>
        <div class="remark">
          <wa-icon library="my-icons" name="circle-info-solid-full"></wa-icon>
        </div>
      </div>
      <div class="card item">
        <div class="div">
          <span>第一システム事業部</span>
          <span>第一システム課</span>
          <span>公共システム係</span>
          <span>(1F)</span>
        </div>
        <div class="room"><span>第３営業所</span></div>
        <div class="post"><span>主任</span></div>
        <div class="extension">
          <span>
            <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
            1234
          </span>
        </div>
        <div class="outside-line">
          <span>
            <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
            12-3456
          </span>
        </div>
        <div class="fax">
          <span>
            <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
            65-4321
          </span>
        </div>
        <div class="remark">
          <wa-icon library="my-icons" name="circle-info-solid-full"></wa-icon>
        </div>
      </div>
      <div class="card item">
        <div class="div">
          <span>第一システム事業部</span>
          <span>第一システム課</span>
          <span>公共システム係</span>
          <span>(1F)</span>
        </div>
        <div class="room"><span>第３営業所</span></div>
        <div class="post"><span>主任</span></div>
        <div class="extension">
          <span>
            <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
            1234
          </span>
        </div>
        <div class="outside-line">
          <span>
            <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
            12-3456
          </span>
        </div>
        <div class="fax">
          <span>
            <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
            65-4321
          </span>
        </div>
        <div class="remark">
          <wa-icon library="my-icons" name="circle-info-solid-full"></wa-icon>
        </div>
      </div>
      <div class="card item">
        <div class="div">
          <span>第一システム事業部</span>
          <span>第一システム課</span>
          <span>公共システム係</span>
          <span>(1F)</span>
        </div>
        <div class="room"><span>第３営業所</span></div>
        <div class="post"><span>主任</span></div>
        <div class="extension">
          <span>
            <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
            1234
          </span>
        </div>
        <div class="outside-line">
          <span>
            <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
            12-3456
          </span>
        </div>
        <div class="fax">
          <span>
            <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
            65-4321
          </span>
        </div>
        <div class="remark">
          <wa-icon library="my-icons" name="circle-info-solid-full"></wa-icon>
        </div>
      </div>
      <div class="card item">
        <div class="div">
          <span>第一システム事業部</span>
          <span>第一システム課</span>
          <span>公共システム係</span>
          <span>(1F)</span>
        </div>
        <div class="room"><span>第３営業所</span></div>
        <div class="post"><span>主任</span></div>
        <div class="extension">
          <span>
            <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
            1234
          </span>
        </div>
        <div class="outside-line">
          <span>
            <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
            12-3456
          </span>
        </div>
        <div class="fax">
          <span>
            <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
            65-4321
          </span>
        </div>
        <div class="remark">
          <wa-icon library="my-icons" name="circle-info-solid-full"></wa-icon>
        </div>
      </div>
    </div>`;
  }
}
