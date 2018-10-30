var W3CTime = /** @class */ (function () {
    function W3CTime() {
    }
    W3CTime.prototype.parse = function (t) {
        var r = t.replace(/T/, " ").replace(/-/g, "/").replace(/\+(.*):(.*)/, " GMT+$1$2");
        return Date.parse(r);
    };
    W3CTime.prototype.isT2Latest = function (t1, t2) {
        var ts = [t1, t2].map(this.parse);
        return (ts[0] < ts[1]);
    };
    return W3CTime;
}());
function arrayToStr(ar) {
    var str = ar.map(function (r, i) {
        try {
            return r.map(function (c) {
                return ("\"" + c.replace(/"/g, "\"\"") + "\"");
            }).join(",");
        }
        catch (error) {
            Logger.log(error);
        }
    }).join("\n");
    return str;
}
//# sourceMappingURL=myUtility.js.map