/**
 * エントリーポイント
 * FusionTablesに動画情報を保存する場合に使う
 * トリガーをかける場合の対象メソッドの１つ
 */

function getListedVideoInfoToTable() {
    let controlSheet = new ControlSheet();
    let mylistIds = controlSheet.getMylistIds();
    let dbInfos = controlSheet.getDbInfos();
    if (dbInfos.videoInfoDb.dbkey === "") {
        dbInfos.videoInfoDb.dbkey = createTable(dbInfos.videoInfoDb.filename,
                                                videoColTitle);
    }
    //if(dbInfos.tagDb.dbkey==""){
    //  dbInfos.tagDb.dbkey=createTable(dbInfos.videoInfoDb.filename,tagColTitle);
    //}
    controlSheet.setDbKeys(dbInfos);

    for (let i = 0; i < mylistIds.length;i++) {
        let mylistId = mylistIds[i].mylistId;
        let lastUpdate = mylistIds[i].lastUpdate;
        let w3ctime = new W3CTime();
        try {
            let mylist = new Mylist(mylistId);
            if (lastUpdate === "" || w3ctime.isT2Latest(lastUpdate,
                                                        mylist.updated())) {
                let rows = [];
                let tagDbRows = [];
                //let videos=[mylist.videos()[0]];
                let videos = mylist.videos();
                let updatedVideos = getUpdatedVideos(dbInfos.videoInfoDb.dbkey, videos);
                updatedVideos.forEach((aVideo) => {
                    let row = ["updated", "title", "id", "link"].map((name) => {
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
                        row = row.concat(["description", "thumbnail_url",
                            "first_retrieve", "length", "view_counter",
                            "comment_num", "mylist_counter",
                            "user_nickname"].map((name) => {
                            return vd[name];
                        }));
                        let tags = videoDetail.getTags();
                        if (tags.length > 1) {
                            //rows.push(row.concat(JSON.stringify(tags)));
                            //rows.push(row.concat(tags.join(",")));
                            //rows.push(row);
                            let id = videoDetail.id;
                            tags.forEach((t) => {
                                //tagDbRows.push([id,t]);
                                rows.push(row.concat(t));
                            });
                        }

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
                    //let rowsStr = JSON.stringify(rows);
                    //setVideoInfos(mylistId,rows);
                    //ControlSheet.setResult(i,mylist.updated());
                    storeData(rowsStr, dbInfos.videoInfoDb.dbkey);
                    //storeData(tagDbRowsStr,dbInfos.tagDb.dbkey);
                }
                controlSheet.setResult(i, mylist.updated());
            }
        } catch (error) {
            let e = error;
            Logger.log(e);
            controlSheet.setError(i, e); // エラーを記録する．
        }
    });
}

