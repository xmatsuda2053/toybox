import { Contact } from "./Contact";

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
  description: string;
  fiscalYear: number;
  labelId: number;
  bookmark: number;
  selected: number;
  createdAt?: Date;
  updatedAt?: Date;
}
