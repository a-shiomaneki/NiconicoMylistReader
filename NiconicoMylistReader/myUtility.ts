
class W3CTime {
    parse(t: string): number {
        let r: string = t.replace(/T/, " ").replace(/-/g, "/").replace(/\+(.*):(.*)/, " GMT+$1$2");
        return Date.parse(r);
    }
    isT2Latest(t1: string, t2: string): boolean {
        let ts: number[] = [t1, t2].map(this.parse);
        return (ts[0] < ts[1]);
    }
}

function arrayToStr(ar: any[]): string {
    let str: string = ar.map(function (r: any, i: number): string[] {
        try {
            return r.map(function (c: any): string {
                return ("\"" + c.replace(/"/g, "\"\"") + "\"");
            }).join(",");
        } catch (error) {
            Logger.log(error);
        }
    }).join("\n");
    return str;
}