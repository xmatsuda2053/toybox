// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, state } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Codes, Models, Database)
import { snDB } from "@sn/database/SnDB";

// Internal Shared (Utils)

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import itemStyles from "@sn/styles/config/sn-config-item.lit.scss?inline";
import { Task } from "@/apps/stepnote/models/Task";

// --- Configuration & Initialization ---
setBasePath("/");

/**
 * Issue#107のFixit
 *
 * @export
 * @class SnFixitIssue107
 * @extends {LitElement}
 */
@customElement("sn-fixit-issue-107")
export class SnFixitIssue107 extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnFixitIssue107
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(itemStyles)];

  /**
   * 結果件数
   *
   * @type {number}
   * @memberof SnFixitIssue107
   */
  @state() count: number | undefined = undefined;

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * タスクの作成日/更新日が未設定のデータを修正します。
   * ログの追加日時を基準として、値を設定します。
   *
   * @private
   * @memberof SnFixitIssue107
   */
  private async _handleExecuteClick() {
    //CreatedAtが存在しないタスクを検索
    const tasks = await snDB.tasks.toArray();
    const targets = tasks.filter((task) => {
      return !task.createdAt;
    });

    await snDB.transaction("rw", [snDB.tasks, snDB.logs], async () => {
      for (const target of targets) {
        const logs = await snDB.logRepo.getLogsAscId(target.id!);
        if (logs.length === 0) continue;

        const firstLog = logs[0];
        const newTask: Partial<Task> = {
          id: target.id,
          createdAt: firstLog.createdAt,
          updatedAt: firstLog.createdAt,
        };

        await snDB.taskRepo.updateTaskInternalWithoutTimestamp(newTask);
      }
    });

    this.count = targets.length;
  }

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof SnFixitIssue107
   */
  protected render(): HTMLTemplateResult | typeof nothing {
    return html`<header>Issue_107</header>
      <main>
        <wa-button
          size="small"
          variant="brand"
          @click=${this._handleExecuteClick}
        >
          Fixit実行
        </wa-button>
      </main>
      <footer class="result">
        ${this.count !== undefined
          ? `${this.count} 件のタスクを修正しました。`
          : ""}
      </footer>`;
  }
}
