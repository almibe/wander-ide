/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export const identifierPatternFull = /^[a-zA-Z_][a-zA-Z0-9-._~:/?#\[\]@!$&'()*+,;%=]*$/;
export const identifierPattern =      /[a-zA-Z_][a-zA-Z0-9-._~:/?#\[\]@!$&'()*+,;%=]*/;
 
export function validateIntegerLiteral(literal: bigint): boolean {
    return literal >= -9223372036854775808n && literal <= 9223372036854775807n;
}

export class Dataset {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    isValid(): boolean {
        return identifierPatternFull.test(this.name);
    }

    equals(other: Dataset): boolean {
        return this.name === other.name;
    }
}

export class Entity {
    readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    isValid(): boolean {
        return identifierPatternFull.test(this.id);
    }
}

export class Attribute {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    isValid(): boolean {
        return identifierPatternFull.test(this.name);
    }
}

export type StringLiteral = string;
export type BooleanLiteral = boolean;
export type LongLiteral = bigint;
export type DoubleLiteral = number;
export type Literal = StringLiteral | BooleanLiteral | LongLiteral | DoubleLiteral;

export type Value = Entity | Literal;

export class Statement {
    readonly entity: Entity;
    readonly attribute: Attribute;
    readonly value: Value;
    readonly context: Entity;

    constructor(entity: Entity, attribute: Attribute, value: Value, context: Entity) {
        this.entity = entity;
        this.attribute = attribute;
        this.value = value;
        this.context = context;
    }

    isValid(): {valid: boolean, invalidParts?: Set<'entity' | 'attribute' | 'value' | 'context'>} {
        let invalidParts = new Set<'entity' | 'attribute' | 'value' | 'context'>();
        if (!this.entity.isValid()) {
            invalidParts.add('entity');
        }
        if (!this.attribute.isValid()) {
            invalidParts.add('attribute');
        }
        if (typeof this.value == 'bigint' && !validateIntegerLiteral(this.value)) {
            invalidParts.add('value');
        }
        if (!this.context.isValid()) {
            invalidParts.add('context');
        }
        if (invalidParts.size === 0) {
            return { valid: true };
        } else {
            return { valid: false, invalidParts};
        }
    }
}

export type StringLiteralRange = { start: string, end: string };
export type LongLiteralRange = { start: bigint, end: bigint }; //TODO make class w/ validate method
export type DoubleLiteralRange = { start: number, end: number };
export type LiteralRange = StringLiteralRange | LongLiteralRange | DoubleLiteralRange;

/**
 * The main interface for interacting with Ligature.
 * It allows for interacting with Datasets outside of transactions,
 * and also allow for interacting with the contents of a specific Dataset inside of a transaction.
 */
export interface Ligature {
    allDatasets(): Promise<Array<Dataset>>;
    datasetExists(dataset: Dataset): Promise<boolean>;
    matchDatasetPrefix(prefix: string): Promise<Array<Dataset>>;
    matchDatasetRange(start: string, end: string): Promise<Array<Dataset>>;
    createDataset(dataset: Dataset): Promise<Dataset>;
    deleteDataset(dataset: Dataset): Promise<Dataset>;
    
    query<T>(dataset: Dataset, fn: (readTx: ReadTx) => Promise<T>): Promise<T>;
 
    write<T>(dataset: Dataset, fn: (writeTx: WriteTx) => Promise<T>): Promise<T>;
 
    /**
     * Close connection with the Store.
     */
    close(deleteDb: boolean): Promise<void>;
 
    isOpen(): boolean;
}

export interface LigatureCursor<T> { //TODO possibly replace Arrays used in ReadTx with this type, also should these return Promises?
    reset(): void
    next(): T | null
    size(): number
    toArray(): Array<T>
}

export interface ReadTx { 
    /**
     * Accepts nothing but returns a Flow of all Statements in the Collection.
     */
    allStatements(): Promise<Array<Statement>>
 
    /**
     * Is passed a pattern and returns a seq with all matching Statements.
     */
    matchStatements(entity: Entity | null, attribute: Attribute | null, value: Value | null, context: Entity | null): Promise<Array<Statement>>
 
    /**
     * Is passed a pattern and returns a seq with all matching Statements.
     */
    matchStatements(entity: Entity | null, attribute: Attribute | null, range: LiteralRange, context: Entity | null): Promise<Array<Statement>>
}

export interface WriteTx {
    /**
     * Returns a new, unique to this collection identifier in the form _:NUMBER
     */
    generateEntity(prefix: string): Promise<Entity>
    addStatement(statement: Statement): Promise<Statement>
    removeStatement(statement: Statement): Promise<Statement>

    /**
     * Cancels this transaction.
     */
    cancel(): any //TODO figure out return type
}
