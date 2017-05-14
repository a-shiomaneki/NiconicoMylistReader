function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "取り込み",
    functionName : "getListedVideoInfo"
  }];
  spreadsheet.addMenu("スクリプト", entries);
};

function getListedVideoInfo(){
  var mylistIds = ControlSheet.getMylistIds();
  mylistIds.forEach(function(r,i){
    var mylistId = r[0];
    var lastUpdate = r[1];
    
    try{
      var mylist = new Mylist(mylistId);
      if(  lastUpdate == "" ||  W3CTime.isT2Latest(lastUpdate,mylist.updated()) ){        
        mylist.videos().forEach(function(aVideo){        
          var videoDetail = new VideoDetail(aVideo.id);
          var vd = videoDetail.getDetail();
          if( vd.status == 'ok'){
            var th=v.getChild("thumb");
            ['thumbnail_url','user_nickname','thumbnail_url','view_counter','mylist_counter','first_retrieve','length'
            ].forEach(function(name){
              data[name] = th.getChildText(name);
            });
            data.thumbnail_url="=image(\""+data.thumbnail_url+"\")";
            // データの並びを整えて１行分のデータとして準備する．
            row = row.concat(['thumbnail_url','first_retrieve','length','view_counter','mylist_counter','user_nickname'].map(function(name){
              return data[name];
            }));
         
            var tags = th.getChild("tags").getChildren("tag").map(function(t){
              return t.getText();
            });
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
        ControlSheet.setResult(i,updated);
      }
    }catch(error){
      var e=error;
      Logger.log(e);
      ControlSheet.setError(i,e); // エラーを記録する．
    }
  });
}

var Mylist=function(id){
  this.id=id;
  this.url = "http://www.nicovideo.jp/mylist/"+id+"?rss=atom";
  this.atom = XmlService.getNamespace('http://www.w3.org/2005/Atom');
  this.root=this.getMylist();
};
Mylist.prototype={
  getMylist:function(){
    var url=this.url;
    try{
      var response = UrlFetchApp.fetch(url);
      var xml = XmlService.parse(response.getContentText());
      this.root = xml.getRootElement();
    }catch(error){
      var e=error;
      Logger.log(e);
      throw e;
    }
    return this.root;
  },
  updated:function(){
    return this.root.getChildText('updated',this.atom);
  },
  videos:function(){
    var atom=this.atom;
    var root=this.root;
    var entries=root.getChildren('entry',atom);
    var infos=[];
    entries.forEach(function(aEntry){
      var info={};
      aEntry.getChildren().forEach(function(elem){
        info[elem.getName()]=elem.getText();
      });
      info.link = aEntry.getChild('link',atom).getAttribute('href').getValue();
      info.id=info.link.slice(30);
      infos.push(info);
    });
    return infos;
  },
};

var VideoDetail=function(id){
  this.id=id;
  this.url = "http://ext.nicovideo.jp/api/getthumbinfo/"+id;
  this.root=this.getVideo();
};
VideoDetail.prototype = {
  getVideo:function(){
    var url=this.url;
    try{
      var response = UrlFetchApp.fetch(url);
      var xml = XmlService.parse(response.getContentText());
      this.root = xml.getRootElement();
    }catch(error){
      var e=error;
      Logger.log(e);
      throw e;
    }
    return this.root; 
  },
  getDetail:function(){
    var root=this.root;
    var detail={};
    detail.status=root.getAttribute('status').getValue();
    if(detail.status=='ok'){
      var elements=root.getChildren();
      elements.forEach(function(elem){
        detail[elem.getName()]=elem.getChildText();
      });
    }
    return detail;
  },
};

function setVideoInfos(id,rows)
{
  var columnItems = ['マイリスト登録時間','タイトル','id','URL','サムネ','投稿','長さ','再生','マイリス','投稿者','タグ'];
  try{
    var sh = SpreadsheetApp.getActive().getSheetByName(id);
    rows.unshift(columnItems);
    var rg = sh.getRange(1,1,rows.length,columnItems.length);
    rg.setValues(rows);
  }catch(error){
    var e=error;
    Logger.log(e);
    throw e;
  }
}

var ControlSheet=function(){
};
ControlSheet={
  sheet:SpreadsheetApp.getActive().getSheetByName("マイリスト情報"),
  getMylistIds:function(){
    var r=this.sheet.getRange(2,1,this.sheet.getLastRow()-1,3);
    var ids = r.getValues();
    return ids;
  },
  setResult:function(i,updated){
    this.sheet.getRange(2+i,2,1,2).setValues([[updated,'']]);
  },
  setError:function(i,error){
    this.sheet.getRange(2+i,3).setValue(error);
  },
};

var W3CTime=function(){
};
W3CTime={
  parse:function(t){
    var r=t.replace(/T/,' ').replace(/-/g,'/').replace(/\+(.*):(.*)/,' GMT+$1$2');
    return Date.parse(r);
  },
  isT2Latest:function(t1,t2){
    var ts = [t1,t2].map( this.parse );
    return (ts[0] < ts[1]);
  },
};