﻿import { arrayToStr } from "./myutility";
import { NndMylistVideoEntry, NndMylist } from "./niconicodouga";

namespace FusionTables {
    export interface TableResource {
        "kind": "fusiontables#table",
        "tableId": string,
        "name": string,
        "columns": [
            ColumnResource
        ],
        "description": string,
        "isExportable": boolean,
        "attribution": string,
        "attributionLink": string,
        "baseTableIds": [
            string
        ],
        "sql": string
    }
    export interface ColumnResource {
        "kind": "fusiontables#column",
        "columnId": number,
        "name": string,
        "type": string,
        "baseColumn": {
            "tableIndex": number,
            "columnId": number
        }
    }
    export interface Table {
        importRows(tableId: string, rowsBlob: GoogleAppsScript.Base.Blob): { [key: string]: any };
        insert(resource: { [key: string]: any }): TableResource;
        remove(dbid: string): void;
    }
    export interface Query {
        sql(sql: string): { [key: string]: any };
    }
    export interface FusionTables {
        Table: Table;
        Query: Query;
    }
}
declare var FusionTables: FusionTables.FusionTables;

export type JsonList = string;
export type JsonArray = string;
export type IsoDate = string;
export type URL = string;

export class MylistTableRecord {
    title: string = "";
    id: string = "";
    link: URL = "";
    description: string = "";
    thumbnail_url: URL = "";
    first_retrieve: IsoDate = "";
    length: number = 0;
    view_counter: number = 0;
    comment_num: number = 0;
    mylist_counter: number = 0;
    user_nickname: string = "";
    tag: JsonArray = "[]";
    list_url: JsonList = "{}";
}

export class MylistTable {
    tableId: string = "";
    static videoColTitle: string[] = ["title", "id", "link", "description",
        "thumbnail_url", "first_retrieve", "length", "view_counter", "comment_num",
        "mylist_counter", "user_nickname", "tag", "list_url"];

    storeData(rows: MylistTableRecord[]) {
        // データの並びを整えて１行分のデータとして準備する．
        let arrayOfrowStrs: string[][] = [];
        for (const row of rows) {
            let str: string[] = MylistTable.videoColTitle.map((name) => {
                return row[name];
            });
            arrayOfrowStrs.push(str);
        }
        let rowsStr = arrayToStr(arrayOfrowStrs);
        this._storeData(rowsStr);
    }

    _storeData(str: string): void {
        let rowsBlob: GoogleAppsScript.Base.Blob;
        let isDone: boolean = false;

        do {
            try {
                rowsBlob = Utilities.newBlob(str, "application/octet-stream");
                FusionTables.Table.importRows(this.tableId, rowsBlob);
                isDone = true;
                Logger.log("importRows:OK");
            } catch (error) {
                do {
                    try {
                        rowsBlob = Utilities.newBlob(str, "application/octet-stream");
                        FusionTables.Table.importRows(this.tableId, rowsBlob);
                        Logger.log("importRows:OK");
                    } catch (error) {
                        Logger.log(error);
                        if (error.message.lastIndexOf("try again") > 0) {
                            isDone = false;
                        } else {
                            throw error;
                        }
                    }
                } while (isDone === false);

                Logger.log(error);
                if (error.message.lastIndexOf("try again") > 0) {
                    isDone = false;
                } else {
                    throw error;
                }
            }
        } while (isDone === false);
    }
    createTable(name: string): string {
        let resource: { [key: string]: any } = {
            "name": name,
            "isExportable": false,
            "kind": "fusiontables#table",
        };
        let post: { [key: string]: any } = MylistTable.videoColTitle.map((name: string) => {
            let type: string;
            let formatPattern: string;
            let columnJsonSchema: string;
            switch (name) {
                case "first_retrieve":
                case "length":
                    type = "DATETIME";
                    formatPattern = "NONE";
                    break;
                case "link":
                    type = "STRING";
                    formatPattern = "STRING_LINK";
                    break;
                case "list_url":
                    type = "STRING";
                    formatPattern = "STRING_JSON_LIST";
                    columnJsonSchema = "";
                    break;
                case "thumbnail_url":
                    type = "STRING";
                    formatPattern = "STRING_FOUR_LINE_IMAGE";
                    break;
                case "view_counter":
                case "mylist_counter":
                    type = "NUMBER";
                    formatPattern = "NONE";
                    break;
                case "tag":
                    type = "STRING";
                    //formatPattern = "STRING_JSON_LIST";
                    formatPattern = "STRING_JSON_TEXT";
                    columnJsonSchema = "{ \"type\": \"array\" }";
                    break;
                default:
                    type = "STRING";
                    formatPattern = "NONE";
                    break;
            }
            let c: { [key: string]: string };
            if (formatPattern.match(/JSON/)) {
                c = {
                    "kind": "fusiontables#column",
                    "name": name,
                    "type": type,
                    "formatPattern": formatPattern,
                    "columnJsonSchema": columnJsonSchema
                }
            } else {
                c = {
                    "kind": "fusiontables#column",
                    "name": name,
                    "type": type,
                    "formatPattern": formatPattern
                }
            }
            return c;
        });

        resource.columns = post;
        let response = FusionTables.Table.insert(resource);
        this.tableId = response.tableId;
        return this.tableId;
    }
    getNewVideos(videos: NndMylistVideoEntry[]): MylistTableRecord[] {
        let sql = "SELECT id, list_url FROM " + this.tableId + ";";
        let rows: string[] = FusionTables.Query.sql(sql).rows;
        let ids: { [key: string]: string } = {};
        if (rows != undefined) {
            if (rows.length >= 1) {
                for (const row of rows) {
                    ids[row[0]] = row[1];
                }
            }
        }
        let results: MylistTableRecord[] = [];
        let exists: MylistTableRecord[] = [];
        for (const aVideo of videos) {
            let id = aVideo["id"];
            let list_link = ids[id];
            let row = MylistTable.nndMylistVideoEntryToMylistTableRecord(aVideo);
            if (list_link == undefined) {
                results.push(row);
            } else {
                exists.push(row);
            }
        }
        return results;
    }
    static nndMylistVideoEntryToMylistTableRecord(entry: NndMylistVideoEntry) {
        let result = new MylistTableRecord();
        result.title = entry.title;
        result.link = entry.link;
        result.id = entry.id;
        result.description = entry.content;
        return result;
    }

    deleteTable(): void {
        if (this.tableId) {
            try {
                FusionTables.Table.remove(this.tableId);
            } catch (error) {
                let e = error;
                Logger.log(e);
                throw e;
            }
        }
    }
}
