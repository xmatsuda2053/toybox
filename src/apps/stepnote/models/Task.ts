import { Contact } from "./Contact";
import { CurrentStatus } from "./CurrentStatus";

/**
 * タスク
 *
 * @export
 * @interface Task
 */
export interface Task {
  id?: number;
  statusCode: string;
  name: string;
  dueDate: Date;
  contacts: Contact[];
  currentStatus: CurrentStatus;
  description: string;
  fiscalYear: number;
  labelId: number;
  bookmark: number;
  selected: number;
  createdAt?: Date;
  updatedAt?: Date;
}
