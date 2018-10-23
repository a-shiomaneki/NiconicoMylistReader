function ControlSheet(){
};
ControlSheet.prototype={
  sheet:SpreadsheetApp.getActive().getSheetByName("コントロールシート"),
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
  getDbInfos:function(){
    var vs=this.sheet.getRange(2,4,this.sheet.getLastRow()-1,3).getValues();
    for(var i=0;i<vs.length;i++){
      if(vs[i][0]==''){
        break;
      }
    }
    vs.splice(i);
   
    var items=['filename','dbkey'];
    var infos={};
    vs.forEach(function(r,i){
      var key=r[0];
      r.shift();
      var rItems={};
      items.forEach(function(item,j){
        rItems[item]=r[j];
      });
      infos[key]=rItems;
    });
    return infos;
  },
  setDbKeys:function(dbInfos){
    var vs=this.sheet.getRange(2,4,this.sheet.getLastRow()-1,3).getValues();
    for(var i=0;i<vs.length;i++){
      if(vs[i][0]==''){
        break;
      }
    }
    vs.splice(i);
    var rs= vs.map(function(row){
      return [dbInfos[row[0]].dbkey];
    });
    this.sheet.getRange(2,6,vs.length,1).setValues(rs);
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