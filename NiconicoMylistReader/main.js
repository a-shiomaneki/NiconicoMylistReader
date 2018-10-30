/**
 * エントリーポイント
 * FusionTablesに動画情報を保存する場合に使う
 * トリガーをかける場合の対象メソッドの１つ
 */
function getListedVideoInfoToTable() {
    var controlSheet = new ControlSheet();
    var mylistIds = controlSheet.getMylistIds();
    var dbInfos = controlSheet.getDbInfos();
    if (dbInfos.videoInfoDb.dbkey === "") {
        dbInfos.videoInfoDb.dbkey = createTable(dbInfos.videoInfoDb.filename, videoColTitle);
    }
    //if(dbInfos.tagDb.dbkey==""){
    //  dbInfos.tagDb.dbkey=createTable(dbInfos.videoInfoDb.filename,tagColTitle);
    //}
    controlSheet.setDbKeys(dbInfos);
    mylistIds.forEach(function (r, i) {
        var mylistId = r[0];
        var lastUpdate = r[1];
        var w3ctime = new W3CTime();
        try {
            var mylist = new Mylist(mylistId);
            if (lastUpdate === "" || w3ctime.isT2Latest(lastUpdate, mylist.updated())) {
                var rows_1 = [];
                var tagDbRows = [];
                //let videos=[mylist.videos()[0]];
                var videos = mylist.videos();
                var updatedVideos = getUpdatedVideos(dbInfos.videoInfoDb.dbkey, videos);
                updatedVideos.forEach(function (aVideo) {
                    var row = ["updated", "title", "id", "link"].map(function (name) {
                        return aVideo[name];
                    });
                    var videoDetail = new VideoDetail(aVideo.id);
                    var vd = videoDetail.getDetail();
                    if (vd.status == "ok") {
                        //vd.thumbnail_url="=image(\""+vd.thumbnail_url+"\")";
                        if (vd.user_nickname == undefined) {
                            if (vd.ch_name != undefined) {
                                vd.user_nickname = vd.ch_name;
                            }
                            else {
                                vd.user_nickname = "";
                            }
                        }
                        // データの並びを整えて１行分のデータとして準備する．
                        row = row.concat(["description", "thumbnail_url",
                            "first_retrieve", "length", "view_counter",
                            "comment_num", "mylist_counter",
                            "user_nickname"].map(function (name) {
                            return vd[name];
                        }));
                        var tags = videoDetail.getTags();
                        if (tags.length > 1) {
                            //rows.push(row.concat(JSON.stringify(tags)));
                            //rows.push(row.concat(tags.join(",")));
                            //rows.push(row);
                            var id = videoDetail.id;
                            tags.forEach(function (t) {
                                //tagDbRows.push([id,t]);
                                rows_1.push(row.concat(t));
                            });
                        }
                    }
                    else { // 動画がコミュニティ限定など公開されていない場合
                        var compNum = videoColTitle.length - row.length;
                        for (var i_1 = 0; i_1 < compNum; i_1++) {
                            row.push("");
                        }
                        rows_1.push(row);
                    }
                });
                if (rows_1.length > 0) {
                    var rowsStr = arrayToStr(rows_1);
                    var tagDbRowsStr = arrayToStr(tagDbRows);
                    //let rowsStr = JSON.stringify(rows);
                    //setVideoInfos(mylistId,rows);
                    //ControlSheet.setResult(i,mylist.updated());
                    storeData(rowsStr, dbInfos.videoInfoDb.dbkey);
                    //storeData(tagDbRowsStr,dbInfos.tagDb.dbkey);
                }
                controlSheet.setResult(i, mylist.updated());
            }
        }
        catch (error) {
            var e = error;
            Logger.log(e);
            controlSheet.setError(i, e); // エラーを記録する．
        }
    });
}
//# sourceMappingURL=main.js.map