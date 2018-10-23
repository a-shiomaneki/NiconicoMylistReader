function storeData(str,dbid){
  do{
    try{
      var rowsBlob = Utilities.newBlob(str, "application/octet-stream");
      FusionTables.Table.importRows(dbid, rowsBlob);
      rows = "";
      rowsBlob = "";
      isDone = true;
      Logger.log("importRows:OK");
    }catch(error){
      do{
        var e=error;
        try{
          var rowsBlob = Utilities.newBlob(str, "application/octet-stream");
          FusionTables.Table.importRows(dbid, rowsBlob);
          rows = "";
          rowsBlob = "";
          isDone = true;
          Logger.log("importRows:OK");
        }catch(error){
          var e=error;
          Logger.log(e);
          if(e.message.lastIndexOf("try again")>0){
            isDone = false;
          }else{
            throw e;
          }
        }
    }while(isDone==false);
      var e=error;
      Logger.log(e);
      if(e.message.lastIndexOf("try again")>0){
        isDone = false;
      }else{
        throw e;
      }
    }
  }while(isDone==false);
}

var videoColTitle=['updated','title','id','link','description','thumbnail_url','first_retrieve','length','view_counter','comment_num','mylist_counter','user_nickname','tag'];
var tagColTitle=['id','tag'];
function createTable(name, columnTitle) {
  var resource = {
  "name": name,
  "isExportable": false,
  "kind": "fusiontables#table",
  };
  var post=columnTitle.map(function(t){
    var type;
    switch(t){
      case 'updated':
      case 'first_retrieve':
      case 'length':
        type='DATETIME';
        break;
      case 'view_counter':
      case 'mylist_counter':
        type='NUMBER';
        break;
      default:
        type='STRING';
        break;
    }
    var c={         
      "name": t,
      "type": type,
      "kind": "fusiontables#column"
    };
    return c;
  });
  resource.columns=post;
  return FusionTables.Table.insert(resource).tableId;
}

function getUpdatedVideos(key,videos){
  var sql = "SELECT id, updated FROM "+key+";";
  var rows = FusionTables.Query.sql(sql).rows;
  var ids = {};
  if(rows != undefined){
    if(rows.length >= 1){
      rows.forEach(function(r){
        ids[r[0]]=r[1];
      });  
    }
  }
  var results = [];
  videos.forEach(function(v){
    var id = v["id"];
    var update = ids[id];
    if(update == undefined){
      results.push(v);
    }
  });
    
  return results;
}