import {Bitrix} from "@2bad/bitrix";
import {logMessage} from "../logger/logger.js";

const pageSize = 50;

class DocumentsService {
    constructor(link) {
        this.bx = Bitrix(link);
    }

    getDocumentsByIds(ids) {
        return new Promise(async (resolve, reject) => {
            try {
                const allResults = [];

                let res;

                let start = 0;
                let total = 0;

                do {
                    res = await this.bx.call("catalog.document.list",
                        {
                            filter: { id: ids },
                            start: start
                        }
                    )

                    total = res.total;
                    start += pageSize;

                    allResults.push(...res.result.documents);
                    if (res.total < pageSize) {
                        break;
                    }
                } while(start < total);
                resolve(allResults);
            } catch (error) {
                logMessage(LOG_TYPES.E, "DocumentsService.getDocumentsByIds", error);
                resolve(null)
            }
        })
    }

    getDocProducts(docId) {
        return new Promise(async (resolve, reject) => {
            try {
                const allResults = [];

                let res;

                let start = 0;
                let total = 0;

                do {
                    res = await this.bx.call("catalog.document.element.list",
                        {
                            filter: { docId: docId },
                            start: start
                        }
                    )

                    total = res.total;
                    start += pageSize;

                    allResults.push(...res.result.documentElements);
                    if (res.total < pageSize) {
                        break;
                    }
                } while(start < total);
                resolve(allResults);
            } catch (error) {
                logMessage(LOG_TYPES.E, "DocumentsService.getDocumentsByIds", error);
                resolve(null)
            }
        })
    }
}

export { DocumentsService }