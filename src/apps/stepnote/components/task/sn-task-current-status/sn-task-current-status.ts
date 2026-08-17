// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";
import { live } from "lit/directives/live.js";

// Third-party UI & SDKs (WebAwesome)
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import { classMap } from "lit/directives/class-map.js";

// Internal Shared (Models)
import {
  CurrentStatus,
  CurrentStatusType,
} from "@sn/models/task/CurrentStatus";

// Internal Shared (Utils)
import { emit } from "@utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn-task/sn-task-current-status/sn-task-current-status.lit.scss?inline";

/**
 * CurrentStatusのtypeからiconへのマッピング
 */
const iconMap: Record<string, { icon: string; label: string }> = {
  default: {
    icon: "comment-dots-solid-full",
    label: "Default",
  },
  info: {
    icon: "circle-info-solid-full",
    label: "Info",
  },
  check: {
    icon: "circle-check-solid-full",
    label: "Done",
  },
  gear: {
    icon: "gear-solid-full",
    label: "Work",
  },
  warn: {
    icon: "triangle-exclamation-solid-full",
    label: "Warning",
  },
  alert: {
    icon: "circle-exclamation-solid-full",
    label: "Alert",
  },
};

// Initializations
setBasePath("/");

/**
 *
 *
 * @export
 * @class SnTaskCurrentStatus
 * @extends {LitElement}
 */
@customElement("sn-task-current-status")
export class SnTaskCurrentStatus extends LitElement {
  /**
   * 現在の状態
   *
   * @type {CurrentStatus}
   * @memberof SnTaskCurrentStatus
   */
  @property({ type: Object }) currentStatus!: CurrentStatus;

  /**
   * スタイル定義
   *
   * @static
   * @memberof SnTaskCurrentStatus
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * ドロップダウンのmousedownでフォーカス移動を防ぎます。
   * focusイベントはcancelable:falseのため防げないが、
   * mousedownでpreventDefaultするとブラウザがフォーカスを移動しなくなる。
   *
   * @private
   * @param {MouseEvent} e
   * @memberof SnTaskCurrentStatus
   */
  private _handleDropdownMousedown = (e: MouseEvent) => {
    e.preventDefault();
  };

  /**
   * テキスト入力イベントを制御します。
   *
   * @private
   * @param {Event} e
   * @memberof SnTaskCurrentStatus
   */
  private _handleInput = (e: Event) => {
    const inputElement = e.target as WaInput;
    const newValue = inputElement.value ?? "";

    // 親が直接参照しに来るオブジェクトの「中身（値）」だけをピンポイントで更新
    if (this.currentStatus) {
      this.currentStatus.text = newValue;
    }

    emit(this, "change-current-status", {
      detail: { currentStatus: this.currentStatus },
    });
  };

  /**
   * アイコン変更イベントを制御します。
   *
   * @private
   * @param {Event} e
   * @memberof SnTaskCurrentStatus
   */
  private _handleChangeType = (e: Event) => {
    const target = e.target as HTMLElement;
    const type = target.dataset.key ?? "";

    // 親が直接参照しに来るオブジェクトの「中身（値）」だけをピンポイントで更新
    if (this.currentStatus) {
      this.currentStatus.type = type as CurrentStatusType;
    }

    emit(this, "change-current-status", {
      detail: { currentStatus: this.currentStatus },
    });
  };

  /**
   * クリアイベントを制御します。
   *
   * @private
   * @memberof SnTaskCurrentStatus
   */
  private _handleClear = () => {
    this.currentStatus.text = "";
    this.currentStatus.type = "default";

    emit(this, "change-current-status", {
      detail: { currentStatus: this.currentStatus },
    });
  };

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * 現在の状態をレンダリングする。
   *
   * @protected
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTaskCurrentStatus
   */
  protected render(): HTMLTemplateResult {
    const type = this.currentStatus?.type ?? "default";
    const iconName = iconMap[type]?.icon ?? iconMap.default.icon;
    const classes = classMap({ item: true, [type]: true });

    return html` <wa-input
      id="currentStatus"
      class=${classes}
      size="small"
      placeholder="What you doing?..."
      .value=${live(this.currentStatus?.text ?? "")}
      @input=${this._handleInput}
    >
      <wa-icon
        library="my-icons"
        name=${iconName}
        class=${type}
        slot="start"
      ></wa-icon>
      <wa-dropdown slot="end" @mousedown=${this._handleDropdownMousedown}>
        <wa-icon
          library="my-icons"
          name="bars-solid-full"
          slot="trigger"
        ></wa-icon>
        ${Object.entries(iconMap).map(([key, value]) => {
          return html`<wa-dropdown-item
            id="${key}"
            data-key=${key}
            @click=${this._handleChangeType}
          >
            <wa-icon
              library="my-icons"
              name=${value.icon}
              class=${key}
              data-key=${key}
              slot="icon"
            ></wa-icon>
            ${value.label}
          </wa-dropdown-item>`;
        })}
        <wa-divider></wa-divider>
        <wa-dropdown-item @click=${this._handleClear}>
          <wa-icon
            library="my-icons"
            name="circle-xmark-regular-full"
            slot="icon"
          ></wa-icon>
          Clear
        </wa-dropdown-item>
      </wa-dropdown>
    </wa-input>`;
  }
}
