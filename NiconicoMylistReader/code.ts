import { MylistTable, MylistTableRecord } from "./fusiontables";
import { NndMylist, VideoDetail } from "./niconicodouga";
import { W3CTime, arrayToStr } from "./myutility";
import { ControlSheet } from "./sheet";
import { link } from "fs";

/**
 * エントリーポイント
 * FusionTablesに動画情報を保存する場合に使う
 * トリガーをかける場合の対象メソッドの１つ
 */
function main(): void {
    getListedVideoInfoToTable();
}


function getListedVideoInfoToTable(): void {
    let isInTime = true;
    let w3ctime = new W3CTime();
    let startTime = Date.now();
    let controlSheet = new ControlSheet();
    let mylistInfos = controlSheet.getMylistInfoWithResults();
    let tableInfos = controlSheet.getTableInfos();
    let mylistTable = new MylistTable();
    if (tableInfos.videoInfoTable.id === "") {
        tableInfos.videoInfoTable.id = mylistTable.createTable(tableInfos.videoInfoTable.filename);
        controlSheet.setTableIds(tableInfos);
    } else {
        mylistTable.tableId = tableInfos.videoInfoTable.id;
    }
    controlSheet.setLinkTableIdsFilename();
    for (let i = 0; i < mylistInfos.length && isInTime; i++) {
        let mylistInfo = mylistInfos[i].idOrUrl;
        let lastUpdate = mylistInfos[i].last_entry;
        try {
            let mylist = new NndMylist(mylistInfo);
            let videos = mylist.getVideos();
            let lastEntryDate = videos[0]["published"];
            controlSheet.setMylistInfo(i, mylist.getTitle(), mylist.getAuthor(), mylist.getUpdated());
            controlSheet.setlastEntryDate(i, lastEntryDate);
            let counter = 0;
            if (lastUpdate === "" ||
                w3ctime.isT2Latest(lastUpdate, lastEntryDate) ||
                !/(done|latest)/.test(mylistInfos[i].result)) {
                controlSheet.setResult(i, w3ctime.now(), "start");
                let rows = [];
                let tagDbRows = [];
                let newVideos = mylistTable.getNewVideos(videos);

                for (let aVideo of newVideos) {
                    let nowTime = Date.now();
                    if ((nowTime - startTime) > 5 * 60 * 1000) {
                        isInTime = false;
                        break;
                    }
                    if (counter % 100 == 0) {
                        controlSheet.setResult(i, w3ctime.now(), "work in progress " + counter + "/" + newVideos.length);
                    }

                    let videoDetail = new VideoDetail(aVideo.id);
                    let vd = videoDetail.getDetail();
                    if (vd.status == "ok") {
                        if (vd.user_nickname == undefined) {
                            if (vd.ch_name != undefined) {
                                vd.user_nickname = vd.ch_name;
                            } else {
                                vd.user_nickname = "";
                            }
                        }
                        aVideo.title = vd["title"];
                        aVideo.link = vd["watch_url"];
                        aVideo.description = vd["description"];
                        aVideo.thumbnail_url = vd["thumbnail_url"];
                        aVideo.first_retrieve = vd["first_retrieve"];
                        aVideo.length = Number(vd["length"]);
                        aVideo.view_counter = Number(vd["view_counter"]);
                        aVideo.comment_num = Number(vd["comment_num"]);
                        aVideo.mylist_counter = Number(vd["mylist_counter"]);
                        let tags = videoDetail.getTags();
                        aVideo.tag = JSON.stringify(tags);
                        let list = [{ "title": mylist.getTitle(), "link": mylist.getLink(), "registered": mylist.getUpdated() }];
                        aVideo.list_url = JSON.stringify(list);
                        rows.push(aVideo);
                    }
                    counter++;
                }

                if (rows.length > 0) {
                    mylistTable.storeData(rows);
                }
                if (counter == newVideos.length) {
                    controlSheet.setResult(i, w3ctime.now(), "done");
                } else {
                    controlSheet.setResult(i, w3ctime.now(), "interrupted " + counter + "/" + newVideos.length);
                }
            } else {
                controlSheet.setResult(i, w3ctime.now(), "latest");
            }
        } catch (error) {
            let e = error;
            Logger.log(e);
            controlSheet.setResult(i, w3ctime.now(), e); // エラーを記録する．
        }
    }
}

