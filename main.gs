function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "取り込み",
    functionName : "getAllData"
  }];
  spreadsheet.addMenu("スクリプト", entries);
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
  ids.forEach(fetchData);
}

function getMyListIds()
{
  var sheet=SpreadsheetApp.getActive().getSheetByName("マイリスト情報");
  var values = sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues().map(function(v){return v[0];});

  return values;
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
  sheet.getRange(1,1,1,colNames.length).setValues([colNames]);
  
  var rows=[];
  els.forEach(function(el,i){
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

      var p=[updated,title,"=image(\""+thumbnail+"\")",first,length,view,mylist,link,id,nickname];
      tags.forEach(function(t,j){
        rows.push(p.concat([t.getText()]));
      });
    }
  });
  sheet.getRange(2,1,rows.length,rows[0].length).setValues(rows);
};