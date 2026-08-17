export interface Config<T = any> {
  id: string;
  group: string;
  name: string;
  value: T;
  createdAt?: Date;
  updatedAt?: Date;
}
