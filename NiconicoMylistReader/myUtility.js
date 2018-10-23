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

function arrayToStr(ar){
  var str = ar.map(function(r,i){
    try{
      return r.map(function(c){
        return ('"'+c.replace(/"/g,'""')+'"');
      }).join(',');
    }catch(error){
      var e=error;
      Logger.log(e);
    }
  }).join('\n');
  return str;
}