/**
 * 現在の状況インターフェース
 *
 * @export
 * @interface CurrentStatus
 */
export interface CurrentStatus {
  text: string;
  type: CurrentStatusType;
}

/**
 * 現在の状況のタイプ
 *
 * @type
 */
export type CurrentStatusType =
  | "default"
  | "info"
  | "check"
  | "gear"
  | "warn"
  | "alert";
