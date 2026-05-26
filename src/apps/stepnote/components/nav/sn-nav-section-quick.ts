// 1. Core Libraries (Lit & Dexie)
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";
import { liveQuery, type Subscription } from "dexie";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, state } from "lit/decorators.js";

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Database, Models, Codes)
import { snDB } from "@sn/database/SnDB";
import { TaskStatus } from "@sn/code/TaskStatus";
import { QuickAccess } from "@sn/models/QuickAccess";

// 5. Internal Shared (Utils)

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/nav/sn-nav-section-quick.lit.scss?inline";

// --- Configuration & Initialization ---
const [PENDING, PROGRESS, DONE] = TaskStatus.getAll();

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
   * @memberof SnNavSectionQuick
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
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnNavSectionQuick
   */
  connectedCallback() {
    super.connectedCallback();

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
      <div class="header">
        QUICK ACCESS
        <span class="end"></span>
        <wa-icon
          id="expand-button"
          library="my-icons"
          name="angle-down-solid-full"
          class="toggleIcon"
          @click=${this._toggleExpand}
        ></wa-icon>
      </div>
      <div class="contents ${this.isExpanded ? "open" : ""}">
        <div class="contents-inner">
          <wa-divider></wa-divider>
          <!--お気に入り-->
          <sn-nav-item
            icon="bookmark-regular-full"
            eventName="click-bookmark"
            .isSelected=${this._quickAccess?.isBookmarkSelected === 1}
            @click-bookmark=${() => {
              this._toggleSelected("isBookmarkSelected");
            }}
          >
            お気に入り
          </sn-nav-item>
          <!--未分類-->
          <sn-nav-item
            icon="question-solid-full"
            eventName="click-uncategorized"
            .isSelected=${this._quickAccess?.isUncategorizedSelected === 1}
            @click-uncategorized=${() => {
              this._toggleSelected("isUncategorizedSelected");
            }}
          >
            未分類
          </sn-nav-item>
          <wa-divider></wa-divider>
          <!--期限切れ-->
          <sn-nav-item
            icon="fire-solid-full"
            eventName="click-overdue"
            .isDanger=${true}
            .isSelected=${this._quickAccess?.isOverdueSelected === 1}
            .hasTargetTask=${this._hasOverdue}
            @click-overdue=${async () => {
              this._toggleSelected("isOverdueSelected");
            }}
          >
            期限切れ
          </sn-nav-item>
          <!--期限当日-->
          <sn-nav-item
            icon="triangle-exclamation-solid-full"
            eventName="click-asap"
            .isWarning=${true}
            .isSelected=${this._quickAccess?.isAsapSelected === 1}
            .hasTargetTask=${this._hasAsap}
            @click-asap=${() => {
              this._toggleSelected("isAsapSelected");
            }}
          >
            期限当日
          </sn-nav-item>
          <!--期限間近-->
          <sn-nav-item
            icon="calendar-solid-full"
            eventName="click-upcoming"
            .isInfo=${true}
            .isSelected=${this._quickAccess?.isUpcomingSelected === 1}
            .hasTargetTask=${this._hasUpcoming}
            @click-upcoming=${() => {
              this._toggleSelected("isUpcomingSelected");
            }}
          >
            期限間近
          </sn-nav-item>
          <wa-divider></wa-divider>
          <!--完了-->
          <sn-nav-item
            icon=${DONE.iconName}
            eventName="click-done"
            .isDone=${true}
            .isSelected=${this._quickAccess?.isDoneSelected === 1}
            .isViewable=${true}
            @click-done=${() => {
              this._toggleSelected("isDoneSelected");
            }}
          >
            ${DONE.label}
          </sn-nav-item>
          <!--対応中-->
          <sn-nav-item
            icon=${PROGRESS.iconName}
            eventName="click-progress"
            .isProgress=${true}
            .isSelected=${this._quickAccess?.isProgressSelected === 1}
            .isViewable=${true}
            @click-progress=${() => {
              this._toggleSelected("isProgressSelected");
            }}
          >
            ${PROGRESS.label}
          </sn-nav-item>
          <!--開始待ち-->
          <sn-nav-item
            icon=${PENDING.iconName}
            eventName="click-pending"
            .isPending=${true}
            .isSelected=${this._quickAccess?.isPendingSelected === 1}
            .isViewable=${true}
            @click-pending=${() => {
              this._toggleSelected("isPendingSelected");
            }}
          >
            ${PENDING.label}
          </sn-nav-item>
          <wa-divider></wa-divider>
        </div>
      </div>
      <wa-dialog label="検索" id="search-dialog-overview">
        This is a standard dialog. You can put any content you want in here!
      </wa-dialog>
    </div>`;
  }

  /**
   * コンテンツの開閉を切り替える
   *
   * @private
   * @memberof SnNavSectionQuick
   */
  private _toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

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
  private async _toggleSelected(key: keyof QuickAccess): Promise<void> {
    if (typeof this._quickAccess[key] !== "number") {
      this._quickAccess[key] = 0;
    }

    const target: QuickAccess = { ...this._quickAccess };
    target[key] = !target[key] ? 1 : 0;

    await snDB.putQuickAccess(target);
  }
}
