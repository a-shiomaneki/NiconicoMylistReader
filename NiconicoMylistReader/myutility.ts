export class W3CTime {
    tz = "JST";
    readonly format = "yyyy-MM-dd'T'HH:mm:ss'+09:00'"
    parse(t: string) {
        let r: string = t.replace(/T/, " ").replace(/-/g, "/").replace(/\+(.*):(.*)/, " GMT+$1$2");
        return Date.parse(r);
    }
    isT2Latest(t1: string, t2: string): boolean {
        let ts = [t1, t2].map(this.parse);
        return (ts[0] < ts[1]);
    }
    IsoFormat(date:Date) {
        return Utilities.formatDate(date, this.tz, this.format);
    }
    now() {
        return this.IsoFormat(new Date());
    }
}


export function arrayToStr(ar: any[]): string {
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