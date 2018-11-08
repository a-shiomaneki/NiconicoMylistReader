/**
 * エントリーポイント
 * FusionTablesに動画情報を保存する場合に使う
 * トリガーをかける場合の対象メソッドの１つ
 */

function getListedVideoInfoToTable(): void {
    let controlSheet = new ControlSheet();
    let mylistIds = controlSheet.getMylistIds();
    let dbInfos = controlSheet.getTableInfos();
    if (dbInfos.videoInfoTable.tableId === "") {
        dbInfos.videoInfoTable.tableId = createTable(dbInfos.videoInfoTable.filename,
            videoColTitle);
        controlSheet.setTableIds(dbInfos);
    }
    for (let i = 0; i < mylistIds.length; i++) {
        let mylistId = mylistIds[i].mylistId;
        let lastUpdate = mylistIds[i].lastUpdate;
        let w3ctime = new W3CTime();
        try {
            let mylist = new Mylist(mylistId);
            let videos = mylist.videos();
            let lastEntryDate = videos[0]["published"];
            if (lastUpdate === "" || w3ctime.isT2Latest(lastUpdate,
                lastEntryDate)) {
                let rows = [];
                let tagDbRows = [];
                let updatedVideos = getUpdatedVideos(dbInfos.videoInfoTable.tableId, videos);
                updatedVideos.forEach((aVideo) => {
                    let row = ["title", "id", "link"].map((name) => {
                        return aVideo[name];
                    });
                    let videoDetail = new VideoDetail(aVideo.id);
                    let vd = videoDetail.getDetail();
                    if (vd.status == "ok") {
                        //vd.thumbnail_url="=image(\""+vd.thumbnail_url+"\")";
                        if (vd.user_nickname == undefined) {
                            if (vd.ch_name != undefined) {
                                vd.user_nickname = vd.ch_name;
                            } else {
                                vd.user_nickname = "";
                            }
                        }
                        // データの並びを整えて１行分のデータとして準備する．

                        row = ["title", "video_id", "watch_url",
                            "description", "thumbnail_url",
                            "first_retrieve", "length", "view_counter",
                            "comment_num", "mylist_counter",
                            "user_nickname"].map((name) => {
                                return vd[name];
                            });
                        let tags = videoDetail.getTags();
                        row = row.concat([JSON.stringify(tags), mylist.getLink(),aVideo["updated"]]);
                        rows.push(row);
                    } else { // 動画がコミュニティ限定など公開されていない場合
                        let compNum = videoColTitle.length - row.length;
                        for (let i = 0; i < compNum; i++) {
                            row.push("");
                        }
                        rows.push(row);
                    }
                });

                if (rows.length > 0) {
                    let rowsStr = arrayToStr(rows);
                    let tagDbRowsStr = arrayToStr(tagDbRows);
                    storeData(rowsStr, dbInfos.videoInfoTable.tableId);
                }
                controlSheet.setResult(i, lastEntryDate);
                controlSheet.setError(i, "");
            }
        } catch (error) {
            let e = error;
            Logger.log(e);
            controlSheet.setError(i, e); // エラーを記録する．
        }
    }
}

