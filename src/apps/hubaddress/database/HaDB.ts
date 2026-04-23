import Dexie, { Table } from "dexie";
import "dexie-export-import";

import { Staff } from "../models/Staff";
import { Division } from "../models/Division";

/**
 * データベース
 *
 * @export
 * @class HaDB
 * @extends {Dexie}
 */
export class HaDB extends Dexie {
  staffs!: Table<Staff>;
  divisions!: Table<Division>;

  /**
   * Creates an instance of SnDB.
   * @memberof SnDB
   */
  constructor() {
    super("HaDB");
    this.version(1).stores({});
  }
}
