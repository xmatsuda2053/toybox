export interface FreeNote {
  id?: number;
  header1: string;
  value: string;
  selected?: boolean;
  pin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
