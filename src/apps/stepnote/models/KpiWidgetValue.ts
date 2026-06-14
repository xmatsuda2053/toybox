/**
 * KPI用の件数
 *
 * @interface KpiWidgetValue
 */
export interface KpiWidgetValue {
  total: number;
  pending: number;
  progress: number;
  done: number;
  upcoming: number;
  asap: number;
  overdue: number;
}
