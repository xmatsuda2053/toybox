// Core Libraries (Lit & Dexie)
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

// Third-party UI & SDKs (WebAwesome)
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Components, Database, Codes, Models)
import { snDB } from "@sn/database/SnDB";
import { Label } from "@sn/models/Label";
import { Task } from "@sn/models/Task";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/tab/sn-tab.lit.scss?inline";

setBasePath("/");

@customElement("sn-tab-task")
export class SnTabTask extends LitElement {
  /**
   * ラベル一覧
   *
   * @private
   * @type {Label[]}
   * @memberof SnTaskProperty
   */
  @state() private _labels: Label[] = [];

  /**
   *　タスク一覧
   *
   * @private
   * @type {(Task | undefined)}
   * @memberof SnTabTask
   */
  @state() private _task!: Task | undefined;

  /**
   * 選択中タブ
   *
   * @private
   * @type {string}
   * @memberof SnTabTask
   */
  @state() private _activeTab: string = "summary";

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTabTask
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * テーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnTabTask
   */
  private _dbSubscription?: Subscription;

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnTabTask
   */
  connectedCallback() {
    super.connectedCallback();
    this._subscribeTasks();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnTabTask
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._dbSubscription?.unsubscribe();
  }

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  /**
   * テーブル状態が更新された場合に最新データを取得します。
   *
   * @private
   * @memberof SnTabTask
   */
  private _subscribeTasks() {
    this._dbSubscription?.unsubscribe();

    const observable = liveQuery(async () => {
      const [labels, tasks] = await Promise.all([
        snDB.labelRepo.getLabelsAscName(),
        snDB.tasks.where("selected").equals(1).toArray(),
      ]);
      return {
        labels,
        tasks,
      };
    });

    this._dbSubscription = observable.subscribe({
      next: (data) => {
        this._labels = data.labels;
        const selectedTask = data.tasks?.[0];

        // タスク未選択の場合、タブ選択を初期化
        if (!selectedTask) {
          this._activeTab = "summary";
          this._task = undefined;

          return;
        }

        // タスクIDが変更された場合、タブ選択を初期化
        if (this._task?.id !== selectedTask.id) {
          this._activeTab = "summary";
        }

        this._task = selectedTask;
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * タブ切り替え時の処理を制御する。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnTabTask
   */
  private _handleTabChange(e: CustomEvent) {
    this._activeTab = e.detail.name;
  }

  /**
   * ステータス変更処理を制御します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnTabTask
   */
  private _handleChangeStatus = async (e: CustomEvent) => {
    if (!this._task) return;

    await snDB.changeStatusCode({
      id: this._task.id!,
      afterCode: e.detail.code,
      beforeCode: this._task.statusCode,
    });
  };

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------
  /**
   * タスクタブをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnTabTask
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <div class="header">${this._renderHeader()}</div>
      <div class="main">${this._renderMain()}</div>
    </div>`;
  }

  /**
   * ヘッダーをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTabTask
   */
  private _renderHeader(): HTMLTemplateResult {
    return html` <div class="title">TASK</div>
      <div class="menu">
        ${this._task
          ? html` <sn-task-button
              @change-status=${this._handleChangeStatus}
            ></sn-task-button>`
          : nothing}
      </div>`;
  }

  /**
   * メインをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTabTask
   */
  private _renderMain(): HTMLTemplateResult {
    return html` <wa-tab-group
      .active=${this._activeTab}
      @wa-tab-show=${this._handleTabChange}
    >
      <wa-tab panel="summary">Summary</wa-tab>
      <wa-tab panel="property">Property</wa-tab>
      <wa-tab-panel name="summary">
        <sn-task-summary id="summary" .task=${this._task!}></sn-task-summary>
      </wa-tab-panel>
      <wa-tab-panel name="property">
        <sn-task-property
          id="property"
          .task=${this._task!}
          .labels=${this._labels}
        ></sn-task-property>
      </wa-tab-panel>
    </wa-tab-group>`;
  }
}
