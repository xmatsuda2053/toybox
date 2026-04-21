/**
 * 分類ラベル
 *
 * @export
 * @interface Label
 */
export interface Label {
  id?: number;
  name: string;
  isSelected: number;
  createdAt?: Date;
  updatedAt?: Date;
}
