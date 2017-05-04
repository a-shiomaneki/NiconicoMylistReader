function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "取り込み",
    functionName : "getAllData"
  }];
  spreadsheet.addMenu("メニュー", entries);
};

function testGetMyListIds()
{
  var ids=getMyListIds();
  for(var i in ids)
  {
    Logger.log(i+" "+ids[i]);
  }
}

function getAllData()
{
  var ids=getMyListIds();
  for(var i in ids)
  {
    fetchData(i);
  }
}

function getMyListIds()
{
  var sheet=SpreadsheetApp.getActive().getSheetByName("マイリスト情報");
  var idCol=getColByValue(sheet,"マイリストID");
  var lastDateCol=getColByValue(sheet,"最終取得日");
  var maxCol=Math.max(idCol,lastDateCol);
  var maxRow=getRowByValue(sheet,"");
  var range=sheet.getRange(2,1,maxRow,maxCol);
  var vls =range.getValues();
  
  var ret={};
  for each(var v in vls)
  {
    ret[v[idCol-1]]=v[lastDateCol-1];
  }
  return ret;      
}

function fetchData(id){
  var sheet = SpreadsheetApp.getActive().getSheetByName(id);
  var mylist = sheet.getName();
  var url = "http://www.nicovideo.jp/mylist/"+mylist+"?rss=atom";
  var response = UrlFetchApp.fetch(url);
  var xml = Xml.parse(response.getContentText(), false);
  var els = xml.getElement().getElements("entry");
  
  var colNames = ["マイリスト登録時間","タイトル","サムネ","投稿","長さ","再生","マイリス","URL","id","投稿者","タグ"];
  for(var i=0;i<colNames.length;i++) {
    sheet.getRange(1,1+i).setValue(colNames[i]);
  }  
  
  var curRow=2;
  for(var i = 0;i < els.length;i++){
    var el = els[i];
    var title = el.getElement("title").getText();
    var updated = el.getElement("updated").getText();
    var content = el.getElement("content").getText();
    var link = el.getElement("link").getAttribute("href").getValue();
    var id = link.slice(30);
      
    var mvUrl = "http://ext.nicovideo.jp/api/getthumbinfo/"+id;
    var mvResponse = UrlFetchApp.fetch(mvUrl);
    var mvXml = Xml.parse(mvResponse.getContentText(), false);
    var status = mvXml.getElement().getAttribute("status").getValue();
    
    if( status == "ok" ) {
      var thumb = mvXml.getElement().getElement("thumb");
      var tags = thumb.getElement("tags").getElements("tag");
      var nickname = thumb.getElement("user_nickname").getText();
      var thumbnail = thumb.getElement("thumbnail_url").getText();
      var view = thumb.getElement("view_counter").getText();
      var mylist = thumb.getElement("mylist_counter").getText();
      var first = thumb.getElement("first_retrieve").getText();
      var length = thumb.getElement("length").getText();
      
      for(var j = 0; j < tags.length; j++) {
        sheet.getRange(curRow,1).setValue(updated);
        sheet.getRange(curRow,2).setValue(title);
        sheet.getRange(curRow,3).setFormula("=image(\""+thumbnail+"\")");
        sheet.getRange(curRow,4).setValue(first);
        sheet.getRange(curRow,5).setValue(length);
        sheet.getRange(curRow,6).setValue(view);
        sheet.getRange(curRow,7).setValue(mylist);
        
        sheet.getRange(curRow,8).setValue(link);
        sheet.getRange(curRow,9).setValue(id);
        sheet.getRange(curRow,10).setValue(nickname);
        var tag = "'"+tags[j].getText();
        sheet.getRange(curRow,11).setValue(tag);
        curRow++;
      }
    }

  }
};

function getColByValue(sheet,val) {
  var range = sheet.getRange("1:1");
  var values = range.getValues()[0];

  for(var i=0; i<values.length; i++) {
    if( values[i] == val ) {
      return i+1;
    }
  }
  return 'undefined';
}

function getRowByValue(sheet,val) {
  var range = sheet.getRange("A:A");
  var values = range.getValues();
  
  for(var i=0; i<values.length; i++) {
    if( values[i][0] == val ) {
      return i+1;
    }
  }
  return 'undefined';
}
