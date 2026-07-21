export interface Notebook {
  id?: number;
  title: string;
  value: string;
  selected: number;
  pin: number;
  createdAt?: Date;
  updatedAt?: Date;
}
