const rawBody = `{"data":{"token":"D8TBFJLF09HC73BUTCIG","client_id":"sec_d9655eda-c6c1-4bc4-8225-b630375f9b53","type":"payment:created","endpoint":"https://www.shaadilink.com.pk/api/payment/webhook","notification":{"tracker":"track_98c77634-d7d0-4699-8a10-64a0b7cbd933","reference":"286402","intent":"CYBERSOURCE","fee":"222.80","net":"6576.20","user":"abc@sds.com","state":"PAID","amount":"6799.00","currency":"PKR","metadata":{"order_id":"20f7cee7-5509-4c5b-85d0-3b7cda40b4fe","source":"custom"}},"delivery_attempts":2,"resource":"notification","next_attempt_at":"2026-06-23T16:45:02Z","created_at":"2026-06-23T16:43:59Z"}}`;

fetch('http://localhost:3000/api/payment/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: rawBody
}).then(r => r.json().then(data => console.log(r.status, data))).catch(console.error);
