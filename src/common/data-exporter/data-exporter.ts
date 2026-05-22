// 1. Core Libraries
import {
  html,
  LitElement,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Library Extensions & Third-party
import { customElement, property } from "lit/decorators.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 3. Internal Assets & Logic
import { type ScheduledTime, ScheduleUtils } from "@/utils/ScheduleUtils";

// 4. Styles

// 5. Initializations (Side Effects)
setBasePath("/");

/**
 * データバックアップコンポーネント
 *
 * @export
 * @class DataExporter
 * @extends {LitElement}
 */
@customElement("data-exporter")
export class DataExporter extends LitElement {
  /**
   * バックアップのスケジュール設定
   *
   * @type {ScheduledTime[]}
   * @memberof DataExporter
   */
  @property({ type: Array }) exportSchedule: ScheduledTime[] = [];

  /**
   * エクスポート処理
   *
   * @memberof DataExporter
   */
  @property({ attribute: false }) onExport?: () => Promise<void>;

  /**
   * スケジュール管理用のインスタンス
   *
   * @private
   * @type {ScheduleUtils}
   * @memberof DataExporter
   */
  private _exportScheduler?: ScheduleUtils;

  /**
   * Creates an instance of DataBackup.
   * @memberof DataExporter
   */
  constructor() {
    super();
  }

  /**
   * データをエクスポートする
   *
   * @private
   * @memberof DataBackup
   */
  private async _exportData() {
    if (this.onExport) {
      await this.onExport();
    }
  }

  /**
   * スケジュールを更新して開始する
   *
   * @private
   * @memberof DataExporter
   */
  private _updateSchedule() {
    this._exportScheduler?.stop();
    this._exportScheduler = new ScheduleUtils(this.exportSchedule, () =>
      this._exportData(),
    );
    this._exportScheduler.start();
  }

  /**
   * コンポーネント追加時
   *
   * @memberof DataExporter
   */
  connectedCallback() {
    super.connectedCallback();
    this._updateSchedule();
  }

  /**
   * コンポーネント破棄時にリスナーを削除（メモリリーク防止）
   *
   * @memberof DataExporter
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._exportScheduler?.stop();
  }

  /**
   * プロパティ変更時の処理
   *
   * @protected
   * @param {PropertyValues} changedProperties
   * @memberof DataExporter
   */
  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has("exportSchedule")) {
      this._updateSchedule();
    }
  }

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof DataExporter
   */
  protected render(): HTMLTemplateResult {
    // UIを持たないコンポーネント
    return html``;
  }
}
