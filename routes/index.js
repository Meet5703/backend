// phonePePayment.js

const express = require("express");
const router = express.Router();
const store = require("store");
const axios = require("axios");
const sha256 = require("sha256");
const uniqid = require("uniqid");

// GET home page
router.get("/", async function (req, res, next) {
  res.render("index", {
    page_respond_data:
      "Please Pay & Respond From The Payment Gateway Will Come In This Section"
  });
});

// PAY
router.get("/pay", async function (req, res, next) {
  let tx_uuid = uniqid();
  store.set("uuid", { tx: tx_uuid });

  let normalPayLoad = {
    merchantId: "PGTESTPAYUAT",
    merchantTransactionId: tx_uuid,
    merchantUserId: "MUID123",
    amount: 10000,
    redirectUrl: "https://65afac7cd916fd02bd4a0096--frntendprj.netlify.app/",
    redirectMode: "POST",
    callbackUrl: "https://65afac7cd916fd02bd4a0096--frntendprj.netlify.app/",
    mobileNumber: "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE"
    }
  };

  let saltKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
  let saltIndex = 1;

  let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
  let base64String = bufferObj.toString("base64");

  let string = base64String + "/pg/v1/pay" + saltKey;

  let sha256_val = sha256(string);
  let checksum = sha256_val + "###" + saltIndex;

  axios
    .post(
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
      {
        request: base64String
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          accept: "application/json"
        }
      }
    )
    .then(function (response) {
      res.redirect(response.data.data.instrumentResponse.redirectInfo.url);
    })
    .catch(function (error) {
      res.render("index", { page_respond_data: JSON.stringify(error) });
    });
});

// PAY RETURN
router.all(
  "https://65afac7cd916fd02bd4a0096--frntendprj.netlify.app/",
  async function (req, res) {
    if (
      req.body.code == "PAYMENT_SUCCESS" &&
      req.body.merchantId &&
      req.body.transactionId &&
      req.body.providerReferenceId
    ) {
      if (req.body.transactionId) {
        let saltKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
        let saltIndex = 1;

        let surl =
          "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/PGTESTPAYUAT/" +
          req.body.transactionId;

        let string =
          "/pg/v1/status/PGTESTPAYUAT/" + req.body.transactionId + saltKey;

        let sha256_val = sha256(string);
        let checksum = sha256_val + "###" + saltIndex;

        axios
          .get(surl, {
            headers: {
              "Content-Type": "application/json",
              "X-VERIFY": checksum,
              "X-MERCHANT-ID": req.body.transactionId,
              accept: "application/json"
            }
          })
          .then(function (response) {
            res.send(JSON.stringify(response.data));
          })
          .catch(function (error) {
            res.render("index", { page_respond_data: JSON.stringify(error) });
          });
      } else {
        res.render("index", { page_respond_data: "Sorry!! Error1" });
      }
    } else {
      res.render("index", { page_respond_data: "Sorry!! Error2" });
    }
  }
);

module.exports = router;
