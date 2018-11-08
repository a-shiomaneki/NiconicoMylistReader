/**
 * エントリーポイント
 * FusionTablesに動画情報を保存する場合に使う
 * トリガーをかける場合の対象メソッドの１つ
 */

function getListedVideoInfoToTable(): void {
    let controlSheet = new ControlSheet();
    let mylistInfos = controlSheet.getMylistInfos();
    let tableInfos = controlSheet.getTableInfos();
    if (tableInfos.videoInfoTable.id === "") {
        tableInfos.videoInfoTable.id = createTable(tableInfos.videoInfoTable.filename,
            videoColTitle);
        controlSheet.setTableIds(tableInfos);
    }
    for (let i = 0; i < mylistInfos.length; i++) {
        let mylistInfo = mylistInfos[i].idOrUrl;
        let lastUpdate = mylistInfos[i].last_entry;
        let w3ctime = new W3CTime();
        try {
            let mylist = new NndMylist(mylistInfo);
            let videos = mylist.getVideos();
            let lastEntryDate = videos[0]["published"];
            if (lastUpdate === "" || w3ctime.isT2Latest(lastUpdate,
                lastEntryDate)) {
                let rows = [];
                let tagDbRows = [];
                let updatedVideos = getUpdatedVideos(tableInfos.videoInfoTable.id, videos);
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
                    storeData(rowsStr, tableInfos.videoInfoTable.id);
                }
                controlSheet.setResult(i,mylist.getTitle(),mylist.getAuthor(),mylist.getUpdated(), lastEntryDate,w3ctime.now(),"");
             }
        } catch (error) {
            let e = error;
            Logger.log(e);
            controlSheet.setError(i, e); // エラーを記録する．
        }
    }
}

