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
  for(var i in ids)  {

    fetchData(i);
  }
}

function getMyListIds()
{
  var sheet=SpreadsheetApp.getActive().getSheetByName("マイリスト情報");
  var idCol=getColByValue(sheet,"マイリストID");
  var lastDateCol=getColByValue(sheet,"最終取得日");
  var maxCol=Math.max(idCol,lastDateCol);
  var maxRow=getRowByValue(sheet,"")-1;
  var range=sheet.getRange(2,1,maxRow-1,maxCol);
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
  try{
    var response = UrlFetchApp.fetch(url);
  } catch(e) {
    var error=e;
    Logger.log(error);
    return error;
  }
  var xml = XmlService.parse(response.getContentText());
  var atom = XmlService.getNamespace('http://www.w3.org/2005/Atom');
  var els = xml.getRootElement().getChildren('entry',atom);
  
  var colNames = ["マイリスト登録時間","タイトル","サムネ","投稿","長さ","再生","マイリス","URL","id","投稿者","タグ"];
  for(var i=0;i<colNames.length;i++) {
    sheet.getRange(1,1+i).setValue(colNames[i]);
  }  
  
  var curRow=2;
  for(var i = 0;i < els.length;i++){
    var el = els[i];
    var title = el.getChild("title",atom).getText();
    var updated = el.getChild("updated",atom).getText();
    var content = el.getChild("content",atom).getText();
    var link = el.getChild("link",atom).getAttribute("href").getValue();
    var id = link.slice(30);
      
    var mvUrl = "http://ext.nicovideo.jp/api/getthumbinfo/"+id;
    var mvResponse = UrlFetchApp.fetch(mvUrl);
    var mvXml = XmlService.parse(mvResponse.getContentText());
    var status = mvXml.getRootElement().getAttribute("status").getValue();
    
    if( status == "ok" ) {
      var thumb = mvXml.getRootElement().getChild("thumb");
      var tags = thumb.getChild("tags").getChildren("tag");
      var nickname = thumb.getChild("user_nickname").getText();
      var thumbnail = thumb.getChild("thumbnail_url").getText();
      var view = thumb.getChild("view_counter").getText();
      var mylist = thumb.getChild("mylist_counter").getText();
      var first = thumb.getChild("first_retrieve").getText();
      var length = thumb.getChild("length").getText();
      
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