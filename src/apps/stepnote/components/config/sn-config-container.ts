// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";
import { liveQuery, type Subscription } from "dexie";

// Lit Extensions (Decorators & Directives)
import { customElement, state } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Codes, Models, Database)
import { snDB } from "@sn/database/SnDB";
import { Config } from "@sn/models/Config";

// Internal Shared (Utils)

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/config/sn-config-container.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

/**
 * 設定データの初期値
 */
const DEFAULT_CONFIG: Config[] = [
  {
    id: "g01_0001",
    group: "g01",
    name: "TaskLimitDayCount",
    value: {
      day: 3,
    },
  },
];

/**
 * 設定画面本体
 *
 * @export
 * @class SnConfigContainer
 * @extends {LitElement}
 */
@customElement("sn-config-container")
export class SnConfigContainer extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnConfigContainer
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * タスク管理の設定データ
   *
   * @type {Config}
   * @memberof SnConfigContainer
   */
  @state() configs!: Config[];

  /**
   * テーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnConfigContainer
   */
  private _dbSubscription?: Subscription;

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------
  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnConfigContainer
   */
  async connectedCallback() {
    super.connectedCallback();
    await snDB.configRepo.initializeDefaultConfig(DEFAULT_CONFIG);
    this._subscribeLabels();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnConfigContainer
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._dbSubscription?.unsubscribe();
  }

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  /**
   * データの更新を検知して再取得する。
   *
   * @private
   * @memberof SnConfigContainer
   */
  private _subscribeLabels() {
    this._dbSubscription?.unsubscribe();

    // 初期値が存在しない場合は登録する。
    const observable = liveQuery(async () => {
      const configs = await snDB.configRepo.getConfigAll();
      return {
        configs,
      };
    });

    this._dbSubscription = observable.subscribe({
      next: async (data) => {
        this.configs = data.configs;
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * 設定データ更新時のイベントを処理します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnConfigContainer
   */
  private async _handleUpdateConfig(e: CustomEvent) {
    const config = e.detail.config;
    await snDB.configRepo.putConfig(config);
  }

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof SnConfigContainer
   */
  protected render(): HTMLTemplateResult | typeof nothing {
    if (!this.configs) return nothing;

    return html`<div class="container">
      <header>
        <div class="title">CONFIG</div>
      </header>
      <main>
        <wa-tab-group
          placement="start"
          @update-config=${this._handleUpdateConfig}
        >
          <wa-tab panel="management">タスク管理</wa-tab>
          <wa-tab panel="storage">ストレージ</wa-tab>
          <wa-tab-panel name="management">
            <div class="item">
              <sn-config-task-limit-day
                .config=${this.configs.find((c) => c.id === "g01_0001")!}
              ></sn-config-task-limit-day>
            </div>
          </wa-tab-panel>
          <wa-tab-panel name="storage">ストレージ</wa-tab-panel>
        </wa-tab-group>
      </main>
    </div>`;
  }
}
