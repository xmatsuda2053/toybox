/**
 * クイックアクセスの状態管理
 *
 * @export
 * @interface QuickAccess
 */
export interface QuickAccess {
  id?: number;
  isBookmarkSelected: number;
  isDoneSelected: number;
  isOverdueSelected: number;
  isAsapSelected: number;
  isUpcomingSelected: number;
  isProgressSelected: number;
  isPendingSelected: number;
  isUncategorizedSelected: number;
}
