/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReadTx, Entity, Attribute, Value, LiteralRange, Statement, Dataset } from "@ligature/ligature";
import { IDBPTransaction } from "idb";

export class LIDBReadTx implements ReadTx {
    private tx: IDBPTransaction;
    private ds: Dataset;
    private dsId: number;

    constructor(tx: IDBPTransaction, ds: Dataset, dsId: number) {
        this.tx = tx;
        this.ds = ds;
        this.dsId = dsId;
    }

    async allStatements(): Promise<Array<Statement>> {
        let os = this.tx.objectStore('statements');
        let start = undefined;
        let stop = undefined;
        let arr = Array<Statement>();
        let res = await os.getAll(IDBKeyRange.bound(start, stop, false, true));
        return Promise.resolve(arr);
    }

    async matchStatements(entity: Entity | null, 
            attribute: Attribute | null, 
            value: Value | LiteralRange | null, 
            context: Entity | null): Promise<Array<Statement>> {
        let query: any = {};
        let arr = Array<Statement>();
        if (entity != null) {
            query['entity'] = entity.id;
        }
        if (attribute != null) {
            query['attribute'] = attribute.name;
        }
        //TODO handle values
        if (context != null) {
            query['context'] = context.id;
        }
        return Promise.resolve(arr);
    }
}
