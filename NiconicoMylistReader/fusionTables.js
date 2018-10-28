"use strict";
exports.__esModule = true;
function storeData(str, dbid) {
    var rowsBlob;
    var isDone = true;
    do {
        try {
            rowsBlob = Utilities.newBlob(str, "application/octet-stream");
            FusionTables.Table.importRows(dbid, rowsBlob);
            isDone = true;
            Logger.log("importRows:OK");
        }
        catch (error) {
            do {
                try {
                    rowsBlob = Utilities.newBlob(str, "application/octet-stream");
                    FusionTables.Table.importRows(dbid, rowsBlob);
                    Logger.log("importRows:OK");
                }
                catch (error) {
                    Logger.log(error);
                    if (error.message.lastIndexOf("try again") > 0) {
                        isDone = false;
                    }
                    else {
                        throw error;
                    }
                }
            } while (isDone == false);
            Logger.log(error);
            if (error.message.lastIndexOf("try again") > 0) {
                isDone = false;
            }
            else {
                throw error;
            }
        }
    } while (isDone == false);
}
var videoColTitle = ['updated', 'title', 'id', 'link', 'description', 'thumbnail_url', 'first_retrieve', 'length', 'view_counter', 'comment_num', 'mylist_counter', 'user_nickname', 'tag'];
var tagColTitle = ['id', 'tag'];
function createTable(name, columnTitle) {
    var resource = {
        "name": name,
        "isExportable": false,
        "kind": "fusiontables#table"
    };
    var post = columnTitle.map(function (t) {
        var type;
        var formatPattern;
        switch (t) {
            case 'updated':
            case 'first_retrieve':
            case 'length':
                type = 'DATETIME';
                formatPattern = 'NONE';
                break;
            case 'link':
                type = 'STRING';
                formatPattern = 'STRING_LINK';
                break;
            case 'thumbnail_url':
                type = 'STRING';
                formatPattern = 'STRING_FOUR_LINE_IMAGE';
                break;
            case 'view_counter':
            case 'mylist_counter':
                type = 'NUMBER';
                formatPattern = 'NONE';
                break;
            default:
                type = 'STRING';
                formatPattern = 'NONE';
                break;
        }
        var c = {
            "name": t,
            "type": type,
            "formatPattern": formatPattern,
            "kind": "fusiontables#column"
        };
        return c;
    });
    resource.columns = post;
    return FusionTables.Table.insert(resource).tableId;
}
function getUpdatedVideos(key, videos) {
    var sql = "SELECT id, updated FROM " + key + ";";
    var rows = FusionTables.Query.sql(sql).rows;
    var ids = {};
    if (rows != undefined) {
        if (rows.length >= 1) {
            rows.forEach(function (r) {
                ids[r[0]] = r[1];
            });
        }
    }
    var results = [];
    videos.forEach(function (v) {
        var id = v["id"];
        var update = ids[id];
        if (update == undefined) {
            results.push(v);
        }
    });
    return results;
}
