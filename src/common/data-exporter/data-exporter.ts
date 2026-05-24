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
import { customElement, property, query, state } from "lit/decorators.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";

// 3. Internal Assets & Logic
import { type ScheduledTime, ScheduleUtils } from "@/utils/ScheduleUtils";

// 4. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "./data-exporter.lit.scss?inline";

// 5. Initializations (Side Effects)
setBasePath("/");

/**
 * スケジュール設定
 */
type ScheduleConfig = {
  id: number;
  time: ScheduledTime;
  enabled: boolean;
};

/**
 * スケジュールの初期設定
 */
const INITIAL_SCHEDULE: ScheduleConfig[] = [
  {
    id: 0,
    time: { hour: 8, minute: 0 },
    enabled: false,
  },
  {
    id: 1,
    time: { hour: 8, minute: 15 },
    enabled: false,
  },
  {
    id: 2,
    time: { hour: 8, minute: 30 },
    enabled: false,
  },
  {
    id: 3,
    time: { hour: 8, minute: 45 },
    enabled: false,
  },
  {
    id: 4,
    time: { hour: 9, minute: 0 },
    enabled: false,
  },
  {
    id: 5,
    time: { hour: 12, minute: 0 },
    enabled: false,
  },
  {
    id: 6,
    time: { hour: 12, minute: 15 },
    enabled: false,
  },
  {
    id: 7,
    time: { hour: 12, minute: 30 },
    enabled: false,
  },
  {
    id: 8,
    time: { hour: 12, minute: 45 },
    enabled: false,
  },
  {
    id: 9,
    time: { hour: 13, minute: 0 },
    enabled: false,
  },
  {
    id: 10,
    time: { hour: 17, minute: 0 },
    enabled: false,
  },
  {
    id: 11,
    time: { hour: 17, minute: 15 },
    enabled: true,
  },
  {
    id: 12,
    time: { hour: 17, minute: 30 },
    enabled: false,
  },
  {
    id: 13,
    time: { hour: 17, minute: 45 },
    enabled: false,
  },
  {
    id: 14,
    time: { hour: 18, minute: 0 },
    enabled: false,
  },
  {
    id: 15,
    time: { hour: 20, minute: 0 },
    enabled: false,
  },
  {
    id: 16,
    time: { hour: 20, minute: 15 },
    enabled: false,
  },
  {
    id: 17,
    time: { hour: 20, minute: 30 },
    enabled: false,
  },
  {
    id: 18,
    time: { hour: 20, minute: 45 },
    enabled: false,
  },
  {
    id: 19,
    time: { hour: 21, minute: 0 },
    enabled: false,
  },
];

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
   * スタイルシートを適用
   *
   * @static
   * @memberof DatePickerInput
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
   * バックアップのスケジュール設定
   *
   * @type {ScheduleConfig[]}
   * @memberof DataExporter
   */
  @state() exportSchedule: ScheduleConfig[] = [];

  /**
   * バックアップ設定保存用のKEY
   *
   * @type {string}
   * @memberof DataExporter
   */
  @property({ type: String }) storageKey: string = "default-key";

  /**
   * エクスポート処理
   *
   * @memberof DataExporter
   */
  @property({ attribute: false }) onExport?: () => Promise<void>;

  /**
   * 設定画面の開閉
   *
   * @type {boolean}
   * @memberof DataExporter
   */
  @property({ type: Boolean }) open: boolean = false;

  /**
   * 設定画面
   *
   * @type {WaDialog}
   * @memberof DataExporter
   */
  @query("#dialog-config") dialogConfig!: WaDialog;

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
   * コンポーネント追加時
   *
   * @memberof DataExporter
   */
  connectedCallback() {
    super.connectedCallback();
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
   * DOMの追加完了後、１回だけ実行する。
   *
   * @protected
   * @param {PropertyValues<this>} changedProperties
   * @memberof DataExporter
   */
  protected firstUpdated(changedProperties: PropertyValues<this>) {
    super.firstUpdated(changedProperties);

    this.getScheduledConfigs();
  }

  /**
   * スケジュールを更新して開始する
   *
   * @private
   * @memberof DataExporter
   */
  private _reloadSchedule() {
    this._exportScheduler?.stop();

    const activeSchedule = this.exportSchedule
      .filter((s) => s.enabled)
      .map((s): ScheduledTime => s.time);

    this._exportScheduler = new ScheduleUtils(activeSchedule, () =>
      this._exportData(),
    );

    this._exportScheduler.start();
  }

  /**
   * スケジュールの設定情報を取得します。
   *
   * @private
   * @return {*}  void
   * @memberof DataExporter
   */
  private getScheduledConfigs(): void {
    const schedule = localStorage.getItem(this.storageKey);
    if (schedule) {
      this.exportSchedule = JSON.parse(schedule);
    } else {
      localStorage.setItem(this.storageKey, JSON.stringify(INITIAL_SCHEDULE));
      this.exportSchedule = INITIAL_SCHEDULE;
    }

    this._reloadSchedule();
  }

  /**
   * 指定したスケジュール日時の設定を反転させます。
   *
   * @private
   * @param {ScheduleConfig} schedule
   * @memberof DataExporter
   */
  private toggleScheduledConfig(schedule: ScheduleConfig) {
    const newSchedule = this.exportSchedule.map((s) => {
      if (s.id === schedule.id) {
        return { ...s, enabled: !s.enabled };
      }
      return s;
    });

    localStorage.setItem(this.storageKey, JSON.stringify(newSchedule));
    this.exportSchedule = newSchedule;
    this._reloadSchedule();
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
    const padZero = (num: number) => String(num).padStart(2, "0");

    return html` <wa-dialog
      light-dismiss
      label="BACKUP CONFIG"
      id="dialog-config"
      .open=${this.open}
      @wa-hide=${() => (this.open = false)}
    >
      <div class="container">
        ${this.exportSchedule.map((s) => {
          return html`
            <wa-button
              size="small"
              variant="brand"
              appearance=${s.enabled ? "accent" : "outlined"}
              @click=${() => this.toggleScheduledConfig(s)}
            >
              ${padZero(s.time.hour)}:${padZero(s.time.minute)}
            </wa-button>
          `;
        })}
      </div>
    </wa-dialog>`;
  }
}
