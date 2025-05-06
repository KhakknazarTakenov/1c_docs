import {Bitrix} from "@2bad/bitrix";
import {logMessage} from "../logger/logger.js";

class DealsService {
    constructor(link) {
        this.bx = Bitrix(link);
    }

    getDealFromBx(id) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve((await this.bx.deals.get(id)).result);
            } catch (error) {
                logMessage(LOG_TYPES.E, "DealsService.getDealFromBx", error);
                resolve(null)
            }
        })
    }

    deleteDealInBx(id) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await this.bx.call("crm.deal.delete", { id: id }));
            } catch (error) {
                logMessage(LOG_TYPES.E, "DealsService.getDealFromBx", error);
                resolve(null)
            }
        })
    }

    updateDealInBx(id, updatingFields) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await this.bx.deals.update(id, updatingFields));
            } catch (error) {
                logMessage(LOG_TYPES.E, "DealsService.getDealFromBx", error);
                resolve(null)
            }
        })
    }
}

export { DealsService }