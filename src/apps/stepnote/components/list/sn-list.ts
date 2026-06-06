// Core Libraries (Lit & Dexie)
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";
import { liveQuery, type Subscription } from "dexie";
import { map } from "lit/directives/map.js";

// Lit Extensions (Decorators & Directives)
import { customElement, state } from "lit/decorators.js";
import "@lit-labs/virtualizer";

// Third-party UI & SDKs (WebAwesome)

import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Database, Models, Codes)
import { snDB } from "@sn/database/SnDB";

import { Label } from "@sn/models/Label";
import { Task } from "@sn/models/Task";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/list/sn-list.lit.scss?inline";

// --- Configuration & Initialization ---

/**
 * タスクイベント
 */
type taskEventKey = "show-in-progress" | "find-all-mode" | "add";

/**
 * ヘッダーボタンの型定義
 */
interface HeaderButton {
  id: string;
  tooltip: string;
  iconName: string;
  key: taskEventKey;
}

/**
 * ヘッダーボタンの情報
 */
const HEADER_BUTTONS: HeaderButton[] = [
  {
    id: "btn-incomplete-task",
    tooltip: "Show In Progress",
    iconName: "inbox-solid-full",
    key: "show-in-progress",
  },
  {
    id: "btn-search-all-mode",
    tooltip: "Find All Mode",
    iconName: "algolia-brands-solid-full",
    key: "find-all-mode",
  },
  {
    id: "btn-add",
    tooltip: "Add",
    iconName: "plus-solid-full",
    key: "add",
  },
] as const;

/**
 * 年度またはタスクアイテムを描画するための型定義
 */
type RenderItem =
  | { type: "year"; year: number; count: number }
  | { type: "task"; task: Task; labelName: string };

setBasePath("/");

/**
 * タスクリスト
 *
 * @export
 * @class SnList
 * @extends {LitElement}
 */
@customElement("sn-list")
export class SnList extends LitElement {
  /**
   * ラベル一覧
   *
   * @private
   * @type {Label[]}
   * @memberof SnList
   */
  @state() private _labels: Label[] = [];

  /**
   * タスク一覧
   *
   * @private
   * @type {Task[]}
   * @memberof SnList
   */
  @state() private _tasks: Task[] = [];

  /**
   * 使用中の年度一覧
   *
   * @private
   * @type {number[]}
   * @memberof SnList
   */
  @state() private _activeFiscalYears: number[] = [];

  /**
   * 編集ダイアログの開閉制御
   *
   * @private
   * @memberof SnList
   */
  @state() private _isEditDialogOpen = false;

  /**
   * 検索フィルタのキーワード
   *
   * @private
   * @type {string}
   * @memberof SnList
   */
  @state() private _filterKeyword: string = "";

  /**
   * 編集ダイアログの状態を管理する。
   *
   * @private
   * @type {("add" | "copy")}
   * @memberof SnList
   */
  @state() _dialogMode: "Add" | "Copy" = "Add";

  /**
   * コピー元のタスク情報
   *
   * @private
   * @type {Task}
   * @memberof SnList
   */
  private _sourceTask!: Task | undefined;

  /**
   * ラベルIDと名称を対応付けするためのMap
   *
   * @private
   * @memberof SnList
   */
  private _labelMap = new Map<number, string>();

  /**
   * テーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnList
   */
  private _dbSubscription?: Subscription;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnList
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnList
   */
  connectedCallback() {
    super.connectedCallback();
    this._subscribeLabels();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnList
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
   * フィルタ用のキーワードが変更された場合にも実行します。
   *
   * @private
   * @memberof SnList
   */
  private _subscribeLabels() {
    this._dbSubscription?.unsubscribe();

    const keyword = this._filterKeyword;
    const observable = liveQuery(async () => {
      const [quickAccess, labels, tasks, activeFiscalYears] = await Promise.all(
        [
          snDB.getQuickAccess(),
          snDB.labelRepo.getLabelsAscName(),
          snDB.selectTaskAscSortKey(keyword),
          snDB.getActiveFiscalYears(keyword),
        ],
      );

      return {
        quickAccess,
        labels,
        tasks,
        activeFiscalYears,
      };
    });

    this._dbSubscription = observable.subscribe({
      next: async (data) => {
        this._labels = data.labels;
        this._tasks = data.tasks;
        this._activeFiscalYears = data.activeFiscalYears;
        this._labelMap = new Map(data.labels.map((l) => [l.id!, l.name]));
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

  /**
   * タスク一覧にフィルタをかける。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnList
   */
  private _filterTasks(e: CustomEvent) {
    const keyword = e.detail.keyword ?? "";
    this._filterKeyword = keyword;
    this._subscribeLabels();
  }

  // -------------------------------------------------------------
  // メンバ
  // -------------------------------------------------------------

  /**
   * 描画するアイテムデータの一覧を取得します。
   * virtualizerを使用するために、年度とタスクを一つの配列に統合しています。
   *
   * @readonly
   * @memberof SnList
   */
  get renderItemData() {
    const items: RenderItem[] = [];

    // 年度単位にタスクをグルーピング
    const tasksByYear = new Map<number, Task[]>();
    for (const task of this._tasks) {
      if (!tasksByYear.has(task.fiscalYear)) {
        tasksByYear.set(task.fiscalYear, []);
      }
      tasksByYear.get(task.fiscalYear)!.push(task);
    }

    // グルーピングしたタスクを配列化
    for (const year of this._activeFiscalYears) {
      const tasks = tasksByYear.get(year) ?? [];

      items.push({ type: "year", year, count: tasks.length });

      for (const task of tasks) {
        items.push({
          type: "task",
          task,
          labelName: this._labelMap.get(task.labelId) ?? "未分類",
        });
      }
    }

    return items;
  }

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * ヘッダーボタンのイベントを制御します。
   *
   * @private
   * @param {headerButtonKey} key
   * @memberof SnList
   */
  private _handleHeaderEvents = async (key: taskEventKey) => {
    switch (key) {
      case "find-all-mode":
        // 全検索モード切替
        await snDB.resetQuickAccessSelected();
        await snDB.labelRepo.deSelectAllLabel();
        break;

      case "show-in-progress":
        // 実行中タスク表示モード切替
        await snDB.showInProgress();
        await snDB.labelRepo.deSelectAllLabel();
        break;

      case "add":
        // 新規追加画面表示
        this._dialogMode = "Add";
        this._sourceTask = undefined;
        this._isEditDialogOpen = true;
        break;
    }
  };

  /**
   * タスク複製画面を起動します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnList
   */
  private _handleTaskCopyClick(e: CustomEvent) {
    this._dialogMode = "Copy";
    this._sourceTask = e.detail.task;
    this._isEditDialogOpen = true;
  }

  /**
   * タスク内容の保存後の動作を制御します。
   *
   * @private
   * @memberof SnList
   */
  private _handleTaskSaved(): void {
    this._isEditDialogOpen = false;
  }

  /**
   * 編集ダイアログ終了後の動作を制御します。
   *
   * @private
   * @memberof SnList
   */
  private _handleAfterHideEditDialog(e: CustomEvent): void {
    if (e.target !== e.currentTarget) {
      return;
    }
    this._isEditDialogOpen = false;
  }

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * タスクリストをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnList
   */
  protected render(): HTMLTemplateResult | typeof nothing {
    return html`<div id="contents-root">
      <div class="header">
        <span class="title">LIST</span>
        ${this._renderHeaderButtons()}
      </div>
      <div class="search" @input-keyword=${this._filterTasks}>
        <search-input></search-input>
      </div>
      <div class="items" @copy-task=${this._handleTaskCopyClick}>
        ${this._renderItems()}
      </div>
      <wa-dialog
        label="${this._dialogMode} Task"
        .open=${this._isEditDialogOpen}
        @task-saved=${this._handleTaskSaved}
        @wa-after-hide=${this._handleAfterHideEditDialog}
      >
        ${this._isEditDialogOpen
          ? html` <sn-list-editor
              .targetTask=${this._sourceTask}
              ._labelData=${this._labels}
            ></sn-list-editor>`
          : nothing}
      </wa-dialog>
    </div>`;
  }

  /**
   * リスト制御用のヘッダーボタンを表示する。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof SnList
   */
  private _renderHeaderButtons(): HTMLTemplateResult | typeof nothing {
    if (this._labels.length === 0) return nothing;

    return html`${map(HEADER_BUTTONS, (button) => {
      return html`<wa-tooltip for=${button.id} placement="top">
          ${button.tooltip}
        </wa-tooltip>
        <wa-icon
          id=${button.id}
          library="my-icons"
          name=${button.iconName}
          @click=${() => this._handleHeaderEvents(button.key)}
        ></wa-icon>`;
    })}`;
  }

  /**
   * タスクアイテム一覧をレンダリングします。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof SnList
   */
  private _renderItems(): HTMLTemplateResult | typeof nothing {
    const data = this.renderItemData;
    if (!data) return nothing;

    return html` <lit-virtualizer
      .items=${data}
      .renderItem=${this._renderItem as any}
      .keyFunction=${this._keyFunction as any}
    >
    </lit-virtualizer>`;
  }

  /**
   * タスクアイテムをレンダリングします。
   *
   * @private
   * @param {RenderItem} item
   * @memberof SnList
   */
  private _renderItem = (
    item: RenderItem,
  ): HTMLTemplateResult | typeof nothing => {
    switch (item.type) {
      case "year":
        return html`<sn-list-section>
          <span slot="year">${item.year}</span>
          <span slot="count">${item.count}</span>
        </sn-list-section>`;

      case "task":
        return html`<sn-list-item
          .task=${item.task}
          .label=${item.labelName}
          slot="item"
        ></sn-list-item>`;

      default:
        return nothing;
    }
  };

  /**
   * virtualizer用のKEYを作成します。
   *
   * @private
   * @param {RenderItem} item
   * @memberof SnList
   */
  private _keyFunction = (item: RenderItem): string => {
    if (item.type === "year") {
      return `year-${item.year}`;
    }
    return `task-${item.task.id}`;
  };
}
