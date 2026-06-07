import { SnDB } from "@sn/database/SnDB";
import { Task } from "@sn/models/Task";
import { QuickAccess } from "@sn/models/QuickAccess";
import { TaskStatus } from "@sn/code/TaskStatus";
import {
  formatDate,
  isOverdue,
  isAsap,
  isWithinAnyDaysBefore,
} from "@utils/DateUtils";
import { Label } from "@sn/models/Label";

/**
 * タスクデータの状態を取得するサービスクラスです。
 * 副作用のないメソッドを提供しています。
 *
 * @export
 * @class TaskQueryService
 */
export class TaskQueryService {
  /**
   * Creates an instance of TaskQueryService.
   * @param {SnDB} db
   * @memberof TaskQueryService
   */
  constructor(private db: SnDB) {}

  /**
   * タスクに登録されている年度のリストを降順で取得する。
   *
   * @param {string} [keyword]
   * @return {*}  {Promise<number[]>}
   * @memberof TaskQueryService
   */
  async getActiveFiscalYears(keyword?: string): Promise<number[]> {
    const tasks = await this.db.taskQuery.getTasksAscSortKey(keyword);
    const years = [...new Set(tasks.map((t) => t.fiscalYear))].sort(
      (a, b) => b - a,
    );
    return years as number[];
  }

  /**
   * タスク一覧を特定の優先順位でソートして取得します。
   * * ソート順序:
   * 1. 年度 (fiscalYear): 降順（新しい年度順）
   * 2. 期限日 (dueDate): 昇順（期限が近い順）
   * 3. 名前 (name): 昇順（五十音/アルファベット順）
   *
   * @param {string} [keyword]
   * @return {*}  {Promise<Task[]>} ソート済みのタスク配列
   * @memberof TaskQueryService
   */
  async getTasksAscSortKey(keyword?: string): Promise<Task[]> {
    // [1] 必要なコンテキストと、全タスク情報をメモリに展開する。
    // コンテキストデータを取得する。
    const quickAccess = await this.db.quickAccessRepo.getQuickAccess();
    const allLabels = await this.db.labelRepo.getLabelsAscName();

    // クイックアクセスの状態ラベルがすべて未選択の場合、表示すべきデータがないので空を返す。
    if (await this.db.quickAccessRepo.deSelectAllStatusLabel()) {
      return [];
    }

    // 全てのタスクデータを取得する。
    let result = await this.db.tasks.toArray();

    // [2] コンテキストで絞り込みを行う。
    result = this.filterByContexts(result, quickAccess, allLabels);

    // [3] キーワードによる絞り込みを行う。
    if (keyword && keyword.trim() !== "") {
      const logs = await this.db.logs.toArray();
      const notes = await this.db.notes.toArray();
      result = this.filterByKeywords(result, keyword, logs, notes);
    }

    // [4] ソートを行う。
    this.sortTasks(result);

    // [5] 結果を返す。
    return result;
  }

  /**
   * 選択中ラベルのIDをすべて取得します。
   *
   * @private
   * @param {Label[]} labels
   * @return {*}  {number[]}
   * @memberof TaskQueryService
   */
  private getSelectedLabelIds(labels: Label[]): number[] {
    return labels.reduce<number[]>((acc, l) => {
      if (l.isSelected && l.id !== undefined) {
        acc.push(l.id);
      }
      return acc;
    }, []);
  }

  /**
   * クイックアクセスの選択有無を反t寧する。
   *
   * @private
   * @param {QuickAccess} quickAccess
   * @return {*}  {boolean}
   * @memberof TaskQueryService
   */
  private hasQuickAccess(quickAccess: QuickAccess): boolean {
    const { id, ...flags } = quickAccess;
    return Object.values(flags).includes(1);
  }

  /**
   * タスク配列に対して、コンテキストによる絞り込みを行う。
   *
   * @private
   * @param {Task[]} tasks
   * @param {QuickAccess} qa
   * @param {Label[]} labels
   * @return {*}  {Task[]}
   * @memberof TaskQueryService
   */
  private filterByContexts(
    tasks: Task[],
    qa: QuickAccess,
    labels: Label[],
  ): Task[] {
    const existingLabelSet = new Set(labels.map((l) => l.id));

    return tasks.filter((task) => {
      const status = TaskStatus.fromCode(task.statusCode);

      // タスク状態によるフィルタを実施します。
      if (
        (qa.isDoneSelected === 0 && status.isDone()) ||
        (qa.isProgressSelected === 0 && status.isProgress()) ||
        (qa.isPendingSelected === 0 && status.isPending())
      ) {
        return false;
      }

      // ラベルによるフィルタを実施します。
      const selectedLabelIds = this.getSelectedLabelIds(labels);
      if (
        selectedLabelIds.length !== 0 &&
        !selectedLabelIds.includes(task.labelId)
      ) {
        return false;
      }

      // クイックアクセスによるフィルタを実施します。
      const hasQa = this.hasQuickAccess(qa);
      const isDone = status.isDone();
      if (hasQa) {
        const qaConditions = [
          {
            selected: qa.isBookmarkSelected,
            check: () => task.bookmark === 1,
          },
          {
            selected: qa.isUncategorizedSelected,
            check: () => !existingLabelSet.has(task.labelId),
          },
          {
            selected: qa.isOverdueSelected,
            check: () => isOverdue(isDone, task.dueDate),
          },
          {
            selected: qa.isAsapSelected,
            check: () => isAsap(isDone, task.dueDate),
          },
          {
            selected: qa.isUpcomingSelected,
            check: () => isWithinAnyDaysBefore(isDone, task.dueDate, 3),
          },
        ];

        const qaMatch = qaConditions.some(
          ({ selected, check }) => selected === 1 && check(),
        );

        const anyQaFilterOn =
          qa.isBookmarkSelected === 1 ||
          qa.isUncategorizedSelected === 1 ||
          qa.isOverdueSelected === 1 ||
          qa.isAsapSelected === 1 ||
          qa.isUpcomingSelected === 1;

        // いずれのクイックアクセスにもヒットしない場合、false
        if (!qaMatch && anyQaFilterOn) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * タスク配列に対して、キーワードによる絞り込みを行う。
   *
   * @private
   * @param {Task[]} tasks
   * @param {string} keyword
   * @param {any[]} logs
   * @param {any[]} notes
   * @return {*}  {Task[]}
   * @memberof TaskQueryService
   */
  private filterByKeywords(
    tasks: Task[],
    keyword: string,
    logs: any[],
    notes: any[],
  ): Task[] {
    // キーワードを配列化する。※複数条件を考慮
    const keywords = keyword
      .trim()
      .toLowerCase()
      .split(/[\s\u3000]+/) // \sは半角空白やタブ、\u3000は全角空白
      .filter(Boolean); // 空文字を除去

    // 計算量を下げるため、どのタスクに、どのログ／タスクが関連付けされているかマッピング
    const logsMap = Map.groupBy(logs, (l) => l.taskId);
    const notesMap = Map.groupBy(notes, (n) => n.taskId);

    return tasks.filter((task) => {
      // 対象タスクの検索対象文字列をすべてフラットな配列として抽出
      const targets = [
        task.name?.toLowerCase(),
        task.description?.toLowerCase(),
        task.fiscalYear.toString(),
        "+" + formatDate(task.createdAt, "yyyy/MM/dd"),
        "@" + formatDate(task.dueDate, "yyyy/MM/dd"),
        ...task.contacts.flatMap((c) => [
          c.name.toLowerCase(),
          c.div.toLowerCase(),
          c.tel,
        ]),
        ...(logsMap.get(task.id!)?.map((l) => l.value.toLowerCase()) ?? []),
        ...(notesMap.get(task.id!)?.map((n) => n.value.toLowerCase()) ?? []),
      ].filter((t) => t?.trim());

      // すべてのキーワード（AND）が、いずれかの項目（OR）に含まれているか
      return keywords.every((kw) => {
        return targets.some((v) => {
          return v.includes(kw);
        });
      });
    });
  }

  /**
   * タスク配列を「年度」「期限日」「名前」の昇順でソートする。
   *
   * @private
   * @param {Task[]} tasks
   * @memberof TaskQueryService
   */
  private sortTasks(tasks: Task[]): void {
    tasks.sort((a, b) => {
      // 1. 年度
      if (b.fiscalYear !== a.fiscalYear) return b.fiscalYear - a.fiscalYear;
      // 2. 期限日
      const timeA = a.dueDate.getTime();
      const timeB = b.dueDate.getTime();
      if (timeA !== timeB) return timeA - timeB;
      // 3. 名前
      return a.name.localeCompare(b.name);
    });
  }
}
