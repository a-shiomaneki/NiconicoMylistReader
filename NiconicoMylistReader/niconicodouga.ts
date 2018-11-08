class Mylist {
    id: string;
    link: string;
    rss_url: string;
    atom: GoogleAppsScript.XML_Service.Namespace;
    root: GoogleAppsScript.XML_Service.Element;

    constructor(id: string) {
        this.id = id;
        this.link = "https://www.nicovideo.jp/mylist/" + id;
        this.rss_url = this.link + "?rss=atom";
        this.atom = this.getAtom();
        this.root = this.getMylist();
    }
    getAtom() {
        let atom: GoogleAppsScript.XML_Service.Namespace;
        try {
            atom = XmlService.getNamespace("http://www.w3.org/2005/Atom");
        } catch (error) {
            let e = error;
            Logger.log(e);
            throw e;
        }
        return atom;
    }
    getMylist() {
        let root: GoogleAppsScript.XML_Service.Element;
        try {
            let response = UrlFetchApp.fetch(this.rss_url);
            let xml = XmlService.parse(response.getContentText());
            root = xml.getRootElement();
        } catch (error) {
            let e = error;
            Logger.log(e);
            throw e;
        }
        return root;
    }
    updated() {
        return this.root.getChildText("updated", this.atom);
    }
    title() {
        return this.root.getChildText("title", this.atom);
    }
    videos() {
        let entries = this.root.getChildren("entry", this.atom);
        let infos: { [key: string]: string }[] = [];
        entries.forEach(function (aEntry) {
            let info = {};
            for (const elem of aEntry.getChildren()) {
                let name = elem.getName();
                if (name == "link") {
                    info["link"] = elem.getAttribute("href").getValue();
                } else {
                    info[name] = elem.getText();
                }
            }
            let posOfDelimiter = info["link"].lastIndexOf("/");
            info["id"] = info["link"].slice(posOfDelimiter + 1);
            infos.push(info);
        });
        return infos;
    }
    getLink() {
        return this.link;
    }
}

class VideoDetail {
    id: string;
    url: string;
    root: GoogleAppsScript.XML_Service.Element;
    constructor(id) {
        this.id = id;
        this.url = "https://ext.nicovideo.jp/api/getthumbinfo/" + id;
        this.root = this.getVideo();
    }
    getVideo() {
        let url = this.url;
        let root: GoogleAppsScript.XML_Service.Element;
        let response: GoogleAppsScript.URL_Fetch.HTTPResponse;
        try {
            try {
                /* 1st. try*/
                response = UrlFetchApp.fetch(url);
            } catch (error) {
                /* 2nd. try*/
                response = UrlFetchApp.fetch(url);
            }
            let xml = XmlService.parse(response.getContentText());
            root = xml.getRootElement();
        } catch (error) {
            let e = error;
            Logger.log(e);
            throw e;
        }
        return root;
    }
    getDetail(): { [key: string]: string } {
        let detail = {};
        detail["status"] = this.root.getAttribute("status").getValue();
        if (detail["status"] == "ok") {
            let elements = this.root.getChild("thumb").getChildren();
            elements.forEach(function (elem) {
                detail[elem.getName()] = elem.getText();
            });
        }
        return detail;
    }
    getTags() {
        let tags = this.root.getChild("thumb").getChild("tags").getChildren("tag").map((t) => {
            return t.getText();
        });
        return tags;
    }
}