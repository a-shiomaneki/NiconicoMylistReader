//QUnit.helpers(this);

function doGet( e ) {
  QUnit.urlParams( e.parameter );
  QUnit.config({
    title: "NiconicoMylistReaderのユニットテスト"
  });
  QUnit.load( myTests );
  return QUnit.getHtml();
};

function myTests() {
  module("ControlSheet正常テスト",{
    setup: function(){
      //control = new ControlSheet();
    }
  });

  test("getMylistIdsのテスト", function() {
    var ids = ControlSheet.getMylistIds();
    ok(ids[0][0]==54869962);
  });
  
  test("setResultのテスト", function() {
    var ids = ControlSheet.getMylistIds();
    ok(ids[0][0]==54869962);
   
    var t='2017-05-11T21:56:12+09:00';
    ControlSheet.setResult(0,t);
    ids = ControlSheet.getMylistIds();
    ok(t===ids[0][1]);
  });
  
  test("setErrorのテスト", function() {
    var ids = ControlSheet.getMylistIds();   
    var e='エラー';
    ControlSheet.setError(0,e);
    ids = ControlSheet.getMylistIds();
    ok(e===ids[0][2]);
  });
  
  module("W3CTimet正常テスト",{
    setup: function(){
      //w3ct = new W3CTime();
    }
  });
  
  test("parseのテスト", function() {
    var ts='2017-05-11T21:56:12+09:00';
    var t=W3CTime.parse(ts);
    ok(typeof t =="number");
  });
  test("isT2Latestのテスト", function() {
    var ts1='2017-05-11T21:56:12+09:00';
    var ts2='2016-10-02T20:17:23+09:00';
    ok(W3CTime.isT2Latest(ts1,ts2)==false);
    ok(W3CTime.isT2Latest(ts2,ts1)==true);
  });
  
  module("Mylist正常テスト",{
    setup: function(){  
    }
  });

  test("コンストラクタのテスト", function() {
    var mylist=new Mylist(23220687);
    ok(typeof mylist =="object");
  });
  
  test("updatedのテスト", function() {
    var mylist=new Mylist(23220687);
    ok( mylist.updated() == '2017-04-17T18:26:37+09:00');
  });  
  test("videosのテスト", function() {
    var mylist=new Mylist(23220687);
    ok( mylist.videos() instanceof Array);
  });
   test("getDetailsのテスト", function() {
    var mylist=new Mylist(23220687);
    ok( mylist.videos() instanceof Array);
  }); 
  test("getTagsのテスト", function() {
    var mylist=new Mylist(23220687);
    ok( mylist.videos() instanceof Array);
  }); 
}