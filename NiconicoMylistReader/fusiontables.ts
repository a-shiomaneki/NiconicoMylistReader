import { arrayToStr } from "./myutility";
import { NndMylistVideoEntry, NndMylist } from "./niconicodouga";
import { MylistInfo } from "./sheet";

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
    export interface TaskResource {
        "kind": "fusiontables#task",
        "taskId": number,
        "started": boolean,
        "progress": string,
        "type": string
    }
    export interface TaskList {
        "kind": "fusiontables#taskList",
        "totalItems": number,
        "nextPageToken": string,
        "items": TaskResource[]
    }
    export interface Table {
        importRows(tableId: string, rowsBlob: GoogleAppsScript.Base.Blob): { [key: string]: any };
        insert(resource: { [key: string]: any }): TableResource;
        remove(dbid: string): void;
    }
    export interface Query {
        sql(sql: string): { [key: string]: any };
    }
    export interface Task {
        get(tableId: string, taskId: string): Task;
        list(tablesId: string): TaskList;
    }
    export interface FusionTables {
        Table: Table;
        Query: Query;
        Task: Task;
    }
}
declare var FusionTables: FusionTables.FusionTables;

export type JsonList = string;
export type JsonArray = string;
export type IsoDate = string;
export type URL = string;

export class MylistTableRecord {
    rowid: string = "";
    title: string = "";
    id: string = "";
    link: URL = "";
    description: string = "";
    thumbnail_url: URL = "";
    first_retrieve: IsoDate = "";
    length: string = "";
    view_counter: string = "";
    comment_num: string = "";
    mylist_counter: string = "";
    user_nickname: string = "";
    tag: JsonArray = "[]";
    list_url: JsonArray = "[]";
}

export class MylistTable {
    tableId: string = "";
    static videoColTitle: ReadonlyArray<string> = ["title", "id", "link", "description",
        "thumbnail_url", "first_retrieve", "length", "view_counter", "comment_num",
        "mylist_counter", "user_nickname", "tag", "list_url"];

    storeData(rows: MylistTableRecord[]): number {
        // データの並びを整えて１行分のデータとして準備する．
        let arrayOfrowStrs: string[][] = [];
        for (const row of rows) {
            let str: string[] = [];
            for (const name of MylistTable.videoColTitle) {
                str.push(row[name]);
            }
            arrayOfrowStrs.push(str);
        }
        let rowsStr = arrayToStr(arrayOfrowStrs);

        let rowsBlob: GoogleAppsScript.Base.Blob;
        let isDone: boolean = false;
        let response: { [key: string]: any };

        do {
            try {
                rowsBlob = Utilities.newBlob(rowsStr, "application/octet-stream");
                response = FusionTables.Table.importRows(this.tableId, rowsBlob);
                isDone = true;
                Logger.log("importRows:OK");
            } catch (error) {
                do {
                    try {
                        rowsBlob = Utilities.newBlob(rowsStr, "application/octet-stream");
                        response = FusionTables.Table.importRows(this.tableId, rowsBlob);
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
        let numRowsReceived: number = response["numRowsReceived"];
        return numRowsReceived;
    }
    getDataByRowid(videos: MylistTableRecord[]) {
        let rowids = videos.map((row) => { return row.rowid; });
        let rowidsStr = videos.reduce((acc, cur) => {
            return acc + ((acc) ? "," : "") + "\"" + cur.rowid + "\"";
        }, "");
        let videoColTitle = Object.getOwnPropertyNames(videos[0]);
        let selectCols = videoColTitle.reduce((acc, cur) => {
            return acc + ((acc) ? "," : "") + cur;
        }, "");
        let sql = "SELECT " + selectCols + " FROM " + this.tableId + " WHERE rowid IN (" + rowidsStr + ");";
        let response = FusionTables.Query.sql(sql);
        let rows: string[] = response.rows;

        let results: MylistTableRecord[] = [];
        for (const row of rows) {
            let record = new MylistTableRecord();
            for (let i = 0; i < videoColTitle.length; i++) {
                record[videoColTitle[i]] = row[i];
            }
            results.push(record);
        }
        return results;
    }
    updateData(videos: MylistTableRecord[]) {
        let rowidsStr = videos.reduce((acc, cur) => {
            return acc + ((acc) ? "," : "") + "\"" + cur.rowid + "\"";
        }, "");
        let sql = "DELETE FROM " + this.tableId + " WHERE rowid IN (" + rowidsStr + ");";
        let response = FusionTables.Query.sql(sql);
        return this.storeData(videos);
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
                    columnJsonSchema = JSON.stringify(
                        {
                            "type": "array",
                            "properties": {
                                "title": { "type": "string" },
                                "link": { "type": "string", "format": "uri" },
                                "registered": { "type": "string", "format": "date-time" }
                            }
                        });
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
                    formatPattern = "STRING_JSON_LIST";
                    //formatPattern = "STRING_JSON_TEXT";
                    columnJsonSchema = JSON.stringify(
                        {
                            "type": "array",
                            "items": { "type": "string" }
                        });
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
    getNewAndBeUpdateVideos(videos: NndMylistVideoEntry[]): { news: MylistTableRecord[]; exists: MylistTableRecord[]; } {
        let sql = "SELECT id, rowid FROM " + this.tableId + ";";
        let rows: string[] = FusionTables.Query.sql(sql).rows;
        let ids: { [key: string]: string } = {};
        if (rows != undefined) {
            if (rows.length >= 1) {
                for (const row of rows) {
                    ids[row[0]] = row[1];
                }
            }
        }
        let news: MylistTableRecord[] = [];
        let exists: MylistTableRecord[] = [];
        for (const aVideo of videos) {
            let id = aVideo["id"];
            let row = MylistTable.nndMylistVideoEntryToMylistTableRecord(aVideo);
            row.rowid = ids[id];
            if (id in ids) {
                exists.push(row);
            } else {
                news.push(row);
            }
        }
        return { news, exists };
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
    waitTask() {
        while (true) {
            let taskList = FusionTables.Task.list(this.tableId);
            if (!taskList.items) break;
        }
    }
}
