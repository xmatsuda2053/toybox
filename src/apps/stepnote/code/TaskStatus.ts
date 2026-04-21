export type TaskStatusCode = "0" | "5" | "9";
export type TaskStatusName = "pending" | "progress" | "done";
export type TaskStatusLabel = "開始待ち" | "対応中" | "完了";
export type TaskIconName =
  | "stop-solid-full"
  | "play-solid-full"
  | "check-solid-full";
export type TaskIconNameSub =
  | "circle-stop-solid-full"
  | "circle-play-solid-full"
  | "circle-check-solid-full";

export class TaskStatus {
  static readonly PENDING = new TaskStatus(
    "0",
    "pending",
    "開始待ち",
    "stop-solid-full",
    "circle-stop-solid-full",
  );
  static readonly PROGRESS = new TaskStatus(
    "5",
    "progress",
    "対応中",
    "play-solid-full",
    "circle-play-solid-full",
  );
  static readonly DONE = new TaskStatus(
    "9",
    "done",
    "完了",
    "check-solid-full",
    "circle-check-solid-full",
  );

  /**
   * Creates an instance of TaskStatus.
   * @param {TaskStatusCode} code
   * @param {TaskStatusLabel} label
   * @memberof TaskStatus
   */
  private constructor(
    public readonly code: TaskStatusCode,
    public readonly name: TaskStatusName,
    public readonly label: TaskStatusLabel,
    public readonly iconName: TaskIconName,
    public readonly iconNameSub: TaskIconNameSub,
  ) {}

  /**
   * 全てのステータスを取得
   *
   * @static
   * @return {*}  {TaskStatus[]}
   * @memberof TaskStatus
   */
  static getAll(): TaskStatus[] {
    return [this.PENDING, this.PROGRESS, this.DONE];
  }

  /**
   * コードからステータスを取得
   * 該当するステータスがない場合は PENDING を返す
   *
   * @static
   * @param {string} code
   * @return {*}  {TaskStatus} - undefined は返さない
   * @memberof TaskStatus
   */
  static fromCode(code: string): TaskStatus {
    // find の結果が undefined の場合、this.PENDING を返す
    return this.getAll().find((status) => status.code === code) ?? this.PENDING;
  }

  /**
   * 状態判定（開始待ち)
   *
   * @return {*}  {boolean}
   * @memberof TaskStatus
   */
  isPending(): boolean {
    return this.code === TaskStatus.PENDING.code;
  }

  /**
   * 状態判定（対応中）
   *
   * @return {*}  {boolean}
   * @memberof TaskStatus
   */
  isProgress(): boolean {
    return this.code === TaskStatus.PROGRESS.code;
  }

  /**
   * 状態判定（完了）
   *
   * @return {*}  {boolean}
   * @memberof TaskStatus
   */
  isDone(): boolean {
    return this.code === TaskStatus.DONE.code;
  }
}
