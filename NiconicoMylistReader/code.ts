import { MylistTable, MylistTableRecord } from "./fusiontables";
import { NndMylist, VideoDetail } from "./niconicodouga";
import { W3CTime, arrayToStr } from "./myutility";
import { ControlSheet } from "./sheet";
import { link } from "fs";
import { listenerCount } from "cluster";

/**
 * エントリーポイント
 * FusionTablesに動画情報を保存する場合に使う
 * トリガーをかける場合の対象メソッドの１つ
 */
function main(): void {
    getListedVideoInfoToTable();
}


function getListedVideoInfoToTable(): void {
    let w3ctime = new W3CTime();
    let startTime = Date.now();
    let startTimeStr = w3ctime.IsoFormat(startTime);
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
                let newRows = [];
                let existRows = [];
                let tagDbRows = [];
                let video = mylistTable.getNewAndBeUpdateVideos(videos);

                for (let aVideo of video.news) {
                    if (!isInTime(startTime)) break;
                    showCounter(controlSheet, i, w3ctime.now(), counter, video.news.length + video.exists.length);

                    let videoDetail = new VideoDetail(aVideo.id);
                    let vd = videoDetail.getDetail();
                    if (vd.status == "ok") {
                        vd = setNickname(vd);
                        aVideo.title = vd["title"];
                        aVideo.link = vd["watch_url"];
                        aVideo.description = vd["description"];
                        aVideo.thumbnail_url = vd["thumbnail_url"];
                        aVideo.first_retrieve = vd["first_retrieve"];
                        aVideo.length = vd["length"];
                        aVideo.view_counter = vd["view_counter"];
                        aVideo.comment_num = vd["comment_num"];
                        aVideo.mylist_counter = vd["mylist_counter"];
                        aVideo.user_nickname = vd["user_nickname"];
                        let tags = videoDetail.getTags();
                        aVideo.tag = JSON.stringify(tags);
                        let list = [{ "title": mylist.getTitle(), "link": mylist.getLink(), "registered": mylist.getUpdated() }];
                        aVideo.list_url = JSON.stringify(list);
                        newRows.push(aVideo);
                    }
                    counter++;
                }
                for (let aVideo of video.exists) {
                    if (!isInTime(startTime)) break;
                    showCounter(controlSheet, i, w3ctime.now(), counter, video.news.length + video.exists.length);

                    let lists = JSON.parse(aVideo.list_url);
                    let result = lists.some((aList) => {
                        aList.link == mylist.link;
                    });
                    if (result) {
                        let newList = {
                            "title": mylist.getTitle(),
                            "link": mylist.getLink(),
                            "registered": startTimeStr
                        }
                        lists.push(newList);
                    }
                    counter++;
                }

                if (newRows.length > 0) {
                    mylistTable.storeData(newRows);
                }
                if (existRows.length > 0) {
                    mylistTable.updateData(newRows);
                }
                if (counter == video.news.length + video.exists.length) {
                    controlSheet.setResult(i, w3ctime.now(), "done");
                } else {
                    controlSheet.setResult(i, w3ctime.now(), "interrupted " + counter + "/" + (video.news.length + video.exists.length));
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

function setNickname(vd: { [key: string]: string }) {
    if (vd["user_nickname"] == undefined) {
        if (vd["ch_name"] != undefined) {
            vd["user_nickname"] = vd["ch_name"];
        } else {
            vd["user_nickname"] = "";
        }
    }
    return vd;
}

function isInTime(startTime: number): boolean {
    let nowTime = Date.now();
    if ((nowTime - startTime) < 5 * 60 * 1000) {
        return true;
    } else {
        return false;
    }
}

function showCounter(controlSheet, i, now, counter, max) {
    if (counter % 100 == 0) {
        controlSheet.setResult(i, now, "work in progress " + counter + "/" + max);
    }
}