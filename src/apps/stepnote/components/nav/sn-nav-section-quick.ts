// 1. Core Libraries (Lit & Dexie)
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";
import { liveQuery, type Subscription } from "dexie";
import { map } from "lit/directives/map.js";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, state } from "lit/decorators.js";

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Database, Models, Codes)
import { snDB } from "@sn/database/SnDB";
import { TaskStatus } from "@sn/code/TaskStatus";
import { QuickAccess } from "@sn/models/QuickAccess";
import { navVariants } from "@sn/components/nav/sn-nav-item";

// 5. Internal Shared (Utils)

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/nav/sn-nav-section-quick.lit.scss?inline";

// --- Configuration & Initialization ---
const [PENDING, PROGRESS, DONE] = TaskStatus.getAll();

/**
 * ナビゲーションアイテムの定義
 */
interface navItem {
  isDivider?: boolean;
  divider?: string;
  label?: string;
  icon?: string;
  key?: keyof QuickAccess;
  variants?: navVariants;
  isSelected?: boolean;
  hasAlert?: boolean;
  isViewable?: boolean;
}

/**
 * 下記フラグをONにした場合、ラベル選択状態を初期化する
 */
const LABEL_CLEAR_TARGET_KEYS: (keyof QuickAccess)[] = [
  "isOverdueSelected",
  "isAsapSelected",
  "isUpcomingSelected",
];

setBasePath("/");

/**
 * クイックアクセス
 *
 * @export
 * @class SnNavSectionQuick
 * @extends {LitElement}
 */
@customElement("sn-nav-section-quick")
export class SnNavSectionQuick extends LitElement {
  /**
   * セクション開閉
   *
   * @type {boolean}
   * @memberof SnNavSectionQuick
   */
  @state() isExpanded: boolean = true;

  /**
   * クイックアクセス一覧一覧
   *
   * @private
   * @type {Label[]}
   * @memberof SnNavSectionQuick
   */
  @state() private _quickAccess!: QuickAccess;

  /**
   * 期限切れタスクの有無
   *
   * @private
   * @memberof SnList
   */
  @state() private _hasOverdue = false;

  /**
   * 期限当日タスクの有無
   *
   * @private
   * @memberof SnList
   */
  @state() private _hasAsap = false;

  /**
   * 期限間近タスクの有無
   *
   * @private
   * @memberof SnList
   */
  @state() private _hasUpcoming = false;

  /**
   * Labelテーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnNavSectionQuick
   */
  private _dbSubscription?: Subscription;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnNavSectionLabel
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnNavSectionQuick
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnNavSectionQuick
   */
  connectedCallback() {
    super.connectedCallback();
    this._subscribeLabels();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnNavSectionQuick
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._dbSubscription?.unsubscribe();
  }

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  /**
   * Labelの状態が更新された場合に最新データを取得します。
   *
   * @private
   * @memberof SnNavSectionQuick
   */
  private _subscribeLabels() {
    const observable = liveQuery(async () => {
      const [quickAccess, hasOverdue, hasAsap, hasUpcoming] = await Promise.all(
        [
          snDB.getQuickAccess(),
          snDB.hasOverdueTasks(),
          snDB.hasAsapTasks(),
          snDB.hasUpcomingTasks(),
        ],
      );

      return {
        quickAccess,
        hasOverdue,
        hasAsap,
        hasUpcoming,
      };
    });

    this._dbSubscription = observable.subscribe({
      next: async (data) => {
        this._quickAccess = data.quickAccess;
        this._hasOverdue = data.hasOverdue;
        this._hasAsap = data.hasAsap;
        this._hasUpcoming = data.hasUpcoming;
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }
  // -------------------------------------------------------------
  // クラスメンバ
  // -------------------------------------------------------------
  get navItems(): navItem[] {
    const isOn = (key: keyof QuickAccess): boolean => {
      return this._quickAccess[key] === 1;
    };

    return [
      {
        isDivider: true,
      },
      {
        label: "お気に入り",
        icon: "bookmark-regular-full",
        key: "isBookmarkSelected",
        isSelected: isOn("isBookmarkSelected"),
      },
      {
        label: "未分類",
        icon: "question-solid-full",
        key: "isUncategorizedSelected",
        isSelected: isOn("isUncategorizedSelected"),
      },
      {
        isDivider: true,
      },
      {
        label: "期限切れ",
        icon: "fire-solid-full",
        key: "isOverdueSelected",
        variants: "danger",
        isSelected: isOn("isOverdueSelected"),
        hasAlert: this._hasOverdue,
      },
      {
        label: "期限当日",
        icon: "triangle-exclamation-solid-full",
        key: "isAsapSelected",
        variants: "warning",
        isSelected: isOn("isAsapSelected"),
        hasAlert: this._hasAsap,
      },
      {
        label: "期限間近",
        icon: "calendar-solid-full",
        key: "isUpcomingSelected",
        variants: "info",
        isSelected: isOn("isUpcomingSelected"),
        hasAlert: this._hasUpcoming,
      },
      {
        isDivider: true,
      },
      {
        label: "完了",
        icon: DONE.iconName,
        key: "isDoneSelected",
        variants: "success",
        isSelected: isOn("isDoneSelected"),
        isViewable: true,
      },
      {
        label: "対応中",
        icon: PROGRESS.iconName,
        key: "isProgressSelected",
        variants: "brand",
        isSelected: isOn("isProgressSelected"),
        isViewable: true,
      },
      {
        label: "開始待ち",
        icon: PENDING.iconName,
        key: "isPendingSelected",
        isSelected: isOn("isPendingSelected"),
        isViewable: true,
      },
      {
        isDivider: true,
      },
    ];
  }

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * コンテンツの開閉を切り替える
   *
   * @private
   * @memberof SnNavSectionQuick
   */
  private _handleExpandClick = () => {
    this.isExpanded = !this.isExpanded;
  };

  /**
   * クイックアクセス項目の選択状態（Boolean）を反転させ、データベースを更新します。
   * * 指定されたキーが存在しない場合は、キーを追加します。
   * 状態を反転させた新しいオブジェクトを生成し、`psDB.putQuickAccess` を介して永続化します。
   *
   * @private
   * @param {keyof QuickAccess} key - 反転対象とするクイックアクセスの設定キー
   * @return {void}
   * @memberof SnNavSectionQuick
   */
  private _toggleSelected = async (key: keyof QuickAccess): Promise<void> => {
    // 元のデータを安全にコピーし、初期値（未定義時）を補正
    const currentVal = this._quickAccess[key] ?? 0;
    const newQuickAccess: QuickAccess = {
      ...this._quickAccess,
      [key]: currentVal,
    };

    // ON(1) / OFF(0) を切り替え
    const nextSelected = currentVal === 1 ? 0 : 1;

    // 期限切れ・期限当日・期限間近をONにした場合、ラベル選択状態をリセットする
    if (nextSelected === 1 && LABEL_CLEAR_TARGET_KEYS.includes(key)) {
      await snDB.resetLabelSelected();

      Object.assign(newQuickAccess, {
        isOverdueSelected: 0,
        isAsapSelected: 0,
        isUpcomingSelected: 0,
        isDoneSelected: 0,
        isProgressSelected: 1,
        isPendingSelected: 1,
      });
    }

    // 対象のキーの状態を更新する
    newQuickAccess[key] = nextSelected;
    await snDB.putQuickAccess(newQuickAccess);
  };

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * ナビゲーションのセクションをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnNavSectionQuick
   */
  protected render(): HTMLTemplateResult {
    if (!this._quickAccess) {
      return html``;
    }
    return html`<div
      id="contents-root"
      class="${this.isExpanded ? "open" : ""}"
    >
      ${this._renderHeader()} ${this._renderContents()}
    </div>`;
  }

  /**
   * ヘッダーをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNavSectionQuick
   */
  private _renderHeader(): HTMLTemplateResult {
    return html` <div class="header">
      QUICK ACCESS
      <span class="end"></span>
      <wa-icon
        id="expand-button"
        library="my-icons"
        name="angle-down-solid-full"
        class="toggleIcon"
        @click=${this._handleExpandClick}
      ></wa-icon>
    </div>`;
  }

  /**
   * コンテンツをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNavSectionQuick
   */
  private _renderContents(): HTMLTemplateResult {
    return html` <div class="contents">
      <div class="contents-inner">
        ${map(this.navItems, (item) => {
          if (item.isDivider) {
            return html`<wa-divider></wa-divider>`;
          }

          return html` <sn-nav-item
            icon=${item.icon as string}
            eventName="click-qa-item"
            variants=${item.variants!}
            ?selected=${item.isSelected}
            ?viewable=${item.isViewable}
            ?animation=${item.hasAlert}
            ?dot=${item.hasAlert}
            @click-qa-item=${() => {
              this._toggleSelected(item.key!);
            }}
          >
            ${item.label}
          </sn-nav-item>`;
        })}
      </div>
    </div>`;
  }
}
