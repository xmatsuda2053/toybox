import { snDB, SnDB } from "@sn/database/SnDB";
import { QuickAccess } from "@sn/models/QuickAccess";

/**
 * ダッシュボード画面におけるCRUDを定義します。
 *
 * @export
 * @class DashboardRepository
 */
export class DashboardRepository {
  /**
   * Creates an instance of DashboardRepository.
   * @param {SnDB} db
   * @memberof DashboardRepository
   */
  constructor(private db: SnDB) {}

  /**
   * 期限間近タスクのみ表示するモードに切り替える。
   *
   * @param {(number | undefined)} [labelId=undefined]
   * @return {*}  {Promise<void>}
   * @memberof DashboardRepository
   */
  async changeUpcomingMode(
    labelId: number | undefined = undefined,
  ): Promise<void> {
    await this.changeMode(
      {
        isUpcomingSelected: 1,
      },
      labelId,
    );
  }

  /**
   * 期限当日タスクのみ表示するモードに切り替える。
   *
   * @param {(number | undefined)} [labelId=undefined]
   * @return {*}  {Promise<void>}
   * @memberof DashboardRepository
   */
  async changeAsapMode(labelId: number | undefined = undefined): Promise<void> {
    await this.changeMode(
      {
        isAsapSelected: 1,
      },
      labelId,
    );
  }

  /**
   * 期限超過タスクのみ表示するモードに切り替える。
   *
   * @param {(number | undefined)} [labelId=undefined]
   * @return {*}  {Promise<void>}
   * @memberof DashboardRepository
   */
  async changeOverdueMode(
    labelId: number | undefined = undefined,
  ): Promise<void> {
    await this.changeMode(
      {
        isOverdueSelected: 1,
      },
      labelId,
    );
  }

  /**
   * 開始待ちタスクのみ表示するモードに切り替える。
   *
   * @param {(number | undefined)} [labelId=undefined]
   * @return {*}  {Promise<void>}
   * @memberof DashboardRepository
   */
  async changePendingMode(
    labelId: number | undefined = undefined,
  ): Promise<void> {
    await this.changeMode(
      {
        isPendingSelected: 1,
        isProgressSelected: 0,
        isDoneSelected: 0,
      },
      labelId,
    );
  }

  /**
   * 実行待ちタスクのみ表示するモードに切り替える。
   *
   * @param {(number | undefined)} [labelId=undefined]
   * @return {*}  {Promise<void>}
   * @memberof DashboardRepository
   */
  async changeProgressMode(
    labelId: number | undefined = undefined,
  ): Promise<void> {
    await this.changeMode(
      {
        isPendingSelected: 0,
        isProgressSelected: 1,
        isDoneSelected: 0,
      },
      labelId,
    );
  }

  /**
   * フィルタリングモードを切り替えます。
   *
   * @private
   * @param {Partial<QuickAccess>} data
   * @param {(number | undefined)} [labelId=undefined]
   * @memberof DashboardRepository
   */
  private async changeMode(
    data: Partial<QuickAccess>,
    labelId: number | undefined = undefined,
  ) {
    await this.db.transaction(
      "rw",
      [this.db.quickAccesses, this.db.labels, this.db.tasks],
      async () => {
        await snDB.labelRepo.deSelectLabelAndDeSelectTaskInTransaction();
        await snDB.quickAccessRepo.changeInProgressModeInTransaction();
        await snDB.quickAccessRepo.updateQuickAccess(data);
        if (labelId) {
          await snDB.labelRepo.selectLabelInTransaction(labelId);
        }
      },
    );
  }
}
