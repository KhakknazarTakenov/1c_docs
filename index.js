import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import timeout from "connect-timeout";
import fs from "fs";
import './global.js';

import {logMessage} from "./logger/logger.js";
import {decryptText, encryptText, generateCryptoKeyAndIV} from "./services/crypto.js";
import {DealsService} from "./services/deals.js";
import {DocumentsService} from "./services/documents.js";
import axios from "axios";

const envPath = path.join(process.cwd(), '.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = 3689;

const BASE_URL = "/bx_1c_docs/";

app.use(cors({
    origin: "*",
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(timeout('20m'));

app.post(BASE_URL+"bx_add_deal_handler/", async (req, res) => {
    try {
        const dealId = req.query.deal_id;
        const bxLink = req.query.bx_link;
        const docsIdsUFId = req.query.docs_uf_id;

        const dealsService = new DealsService(bxLink);
        const documentsService = new DocumentsService(bxLink);
        const deal = await dealsService.getDealFromBx(dealId);

        const docsIds = deal[docsIdsUFId].includes(",") ? deal[docsIdsUFId].split(",").map(docId => Number(docId)) : deal[docsIdsUFId];

        let documents = (await documentsService.getDocumentsByIds(docsIds)).map(doc => {
            return {
                doc_id: doc.id,
                doc_title: doc.title,
                doc_type: doc.docType,
                doc_date_create: doc.dateCreate,
                doc_date_modify: doc.dateModify,
                doc_status: doc.status,
                doc_total_price: doc.total,
                doc_assigned_id: doc.responsibleId
            }
        });
        for (let doc of documents) {
            doc.products = (await documentsService.getDocProducts(doc.doc_id)).map(product => {
                return {
                    product_id: product.elementId,
                    product_amount: product.amount,
                    product_price: product.purchasingPrice
                }
            });
        }

        console.log(deal["TITLE"], documents);

        const resp = await axios.post("http://35.229.169.39/integration/hs/bitrix/documents/", { documents: documents }, { headers: { "Content-Type": "application/json" } });
        logMessage(LOG_TYPES.I, BASE_URL+"bx_add_deal_handler/", resp.data);

        logMessage(LOG_TYPES.A, BASE_URL+"bx_delete_deal_handler/", `${dealId} deal created in bx`);
        res.status(200).json({"status": true, "status_msg": "success", "documents": documents})
    } catch (error) {
        logMessage(LOG_TYPES.E, BASE_URL+"bx_add_deal_handler/error", error);
        res.status(500).json({"status": false, "status_msg": "error", "message": "Server error"});
    }
})

app.post(BASE_URL+"bx_delete_deal_handler/", async (req, res) => {
    try {
        const dealId = req.query.deal_id;
        const bxLink = req.query.bx_link;
        const docsIdsUFId = req.query.docs_uf_id;

        console.log(dealId)

        logMessage(LOG_TYPES.A, BASE_URL+"bx_delete_deal_handler/", `${dealId} deal deleted in bx`);
        res.status(200).json({"status": true, "status_msg": "success", "message": `${dealId} deleted from bx`});
    } catch (error) {
        logMessage(LOG_TYPES.E, BASE_URL+"bx_add_deal_handler/error", error);
        res.status(500).json({"status": false, "status_msg": "error", "message": "Server error"});
    }
})

app.post(BASE_URL+"bx_update_deal_handler/", async (req, res) => {
    try {
        const dealId = req.query.deal_id;
        const bxLink = req.query.bx_link;
        const docsIdsUFId = req.query.docs_uf_id;

        const dealsService = new DealsService(bxLink);
        const documentsService = new DocumentsService(bxLink);
        const deal = await dealsService.getDealFromBx(dealId);

        const docsIds = deal[docsIdsUFId].includes(",") ? deal[docsIdsUFId].split(",").map(docId => Number(docId)) : deal[docsIdsUFId];

        let documents = (await documentsService.getDocumentsByIds(docsIds)).map(doc => {
            return {
                doc_id: doc.id,
                doc_title: doc.title,
                doc_type: doc.docType,
                doc_date_create: doc.dateCreate,
                doc_date_modify: doc.dateModify,
                doc_status: doc.status,
                doc_total_price: doc.total
            }
        });
        for (let doc of documents) {
            doc.products = (await documentsService.getDocProducts(doc.doc_id)).map(product => {
                return {
                    product_id: product.elementId,
                    product_amount: product.amount,
                    product_price: product.purchasingPrice
                }
            });
        }

        console.log(deal["TITLE"], documents);

        logMessage(LOG_TYPES.A, BASE_URL+"bx_delete_deal_handler/", `${dealId} deal updated in bx`);
        res.status(200).json({"status": true, "status_msg": "success", "message": `${dealId} deleted from bx`});
    } catch (error) {
        logMessage(LOG_TYPES.E, BASE_URL+"bx_add_deal_handler/error", error);
        res.status(500).json({"status": false, "status_msg": "error", "message": "Server error"});
    }
})

app.post(BASE_URL+"bx_process_deal_handler/", async (req, res) => {
    try {
        const dealId = req.query.deal_id;
        const bxLink = req.query.bx_link;
        const docsIdsUFId = req.query.docs_uf_id;

        const dealsService = new DealsService(bxLink);
        const documentsService = new DocumentsService(bxLink);
        const deal = await dealsService.getDealFromBx(dealId);

        const docsIds = deal[docsIdsUFId].includes(",") ? deal[docsIdsUFId].split(",").map(docId => Number(docId)) : deal[docsIdsUFId];

        let documents = (await documentsService.getDocumentsByIds(docsIds)).map(doc => {
            return {
                doc_id: doc.id,
                doc_title: doc.title,
                doc_type: doc.docType,
                doc_date_create: doc.dateCreate,
                doc_date_modify: doc.dateModify,
                doc_status: doc.status,
                doc_total_price: doc.total
            }
        });
        for (let doc of documents) {
            doc.products = (await documentsService.getDocProducts(doc.doc_id)).map(product => {
                return {
                    product_id: product.elementId,
                    product_amount: product.amount,
                    product_price: product.purchasingPrice
                }
            });
        }

        console.log(deal["TITLE"], documents);

        logMessage(LOG_TYPES.A, BASE_URL+"bx_delete_deal_handler/", `${dealId} deal processed in bx`);
        res.status(200).json({"status": true, "status_msg": "success", "message": `${dealId} deleted from bx`});
    } catch (error) {
        logMessage(LOG_TYPES.E, BASE_URL+"bx_add_deal_handler/error", error);
        res.status(500).json({"status": false, "status_msg": "error", "message": "Server error"});
    }
})

app.post(BASE_URL + "init/", async (req, res) => {
    try {
        const bxLink = req.body.bx_link;
        if (!bxLink) {
            res.status(400).json({
                "status": false,
                "status_msg": "error",
                "message": "Необходимо предоставить ссылку входящего вебхука!"
            });
            return;
        }

        const keyIv = generateCryptoKeyAndIV();
        const bxLinkEncrypted = await encryptText(bxLink, keyIv.CRYPTO_KEY, keyIv.CRYPTO_IV);

        const bxLinkEncryptedBase64 = Buffer.from(bxLinkEncrypted, 'hex').toString('base64');

        const envPath = path.resolve(process.cwd(), '.env');
        const envContent = `CRYPTO_KEY=${keyIv.CRYPTO_KEY}\nCRYPTO_IV=${keyIv.CRYPTO_IV}\nBX_LINK=${bxLinkEncryptedBase64}\n`;

        fs.writeFileSync(envPath, envContent, 'utf8');

        res.status(200).json({
            "status": true,
            "status_msg": "success",
            "message": "Система готова работать с вашим битриксом!",
        });
    } catch (error) {
        logMessage(LOG_TYPES.E, BASE_URL + "/init", error);
        res.status(500).json({
            "status": false,
            "status_msg": "error",
            "message": "Server error"
        });
    }
});

app.post(BASE_URL + "receive_deal_from_1c/", async (req, res) => {
    try {
        const data = req.body;
        logMessage(LOG_TYPES.I, BASE_URL+"receive_deal_from_1c/", JSON.stringify(data ? data : {}, null, 2));
        res.status(200).json({ "status": true, received: data });
    } catch (error) {
        logMessage(LOG_TYPES.E, BASE_URL + "receive_deal_from_1c/", error);
        res.status(500).json({
            "status": false,
            "status_msg": "error",
            "message": "Server error"
        });
    }
});

app.listen(PORT, async () => {
    console.log(`App running on port ${PORT}`)
})
// https://e688-92-47-152-253.ngrok-free.app/bx_1c_docs/bx_add_deal_handler?deal_id={{ID}}&docs_uf_id=UF_CRM_1733217774701&bx_link=https://gamechanger.bitrix24.kz/rest/24/z0rhac3djth3n4wc/