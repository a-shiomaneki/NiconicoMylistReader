/**
 * SpreadSheetを開いたときにメニューを作成する．
 */
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "取り込み",
    functionName : "getListedVideoInfo"
  }];
  spreadsheet.addMenu("スクリプト", entries);
}

/**
 * エントリーポイント
 * 各マイリスト用のスプレッシートに動画情報を保存する．
 * トリガーをかけるのに用いるメソッドの１つ．
 */
function getListedVideoInfo() {
  var controlSheet = new ControlSheet;
  var mylistIds = controlSheet.getMylistIds();
  mylistIds.forEach(function(r,i){
    var mylistId = r[0];
    var lastUpdate = r[1];
    
    try{
      var mylist = new Mylist(mylistId);
      if(  lastUpdate == "" ||  W3CTime.isT2Latest(lastUpdate,mylist.updated()) ){
        var rows = [];        
        mylist.videos().forEach(function(aVideo){    
          var row=['updated','title','id','link'].map(function(name){
            return aVideo[name];
          });
          var videoDetail = new VideoDetail(aVideo.id);
          var vd = videoDetail.getDetail();
          if( vd.status == 'ok'){
            vd.thumbnail_url="=image(\""+vd.thumbnail_url+"\")";
            if( vd.user_nickname == undefined ){
              if(vd.ch_name != undefined){
                vd.user_nickname=vd.ch_name;
              }else{
                vd.user_nickname="";
              }
            }
            // データの並びを整えて１行分のデータとして準備する．
            row = row.concat(['thumbnail_url','first_retrieve','length','view_counter','mylist_counter','user_nickname'].map(function(name){
              return vd[name];
            }));
            var tags = videoDetail.getTags();
            if( tags.length > 1 ){
              tags.forEach(function(t){
                rows.push(row.concat([t]));
              });
            }else{
              rows.push(row.concat(['']));
            }
          }else{ // 動画がコミュニティ限定など公開されていない場合
            var compNum = 11-row.length;
            for(var i=0;i<compNum;i++){
              row.push('');
            }
            rows.push(row);
          }
        });
        setVideoInfos(mylistId,rows);
        controlSheet.setResult(i,mylist.updated());
      }
    }catch(error){
      var e=error;
      Logger.log(e);
      ControlSheet.setError(i,e); // エラーを記録する．
    }
  });
}

