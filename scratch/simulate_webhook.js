const orderId = "8ee8840f-fc05-4045-88be-aa310dd3846d";
fetch('https://www.shaadilink.com.pk/api/payment/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-sfpy-signature': 'fake_sig'
  },
  body: JSON.stringify({
    type: 'payment.succeeded',
    notification: {
      reference: orderId,
      state: 'PAID'
    }
  })
}).then(r => r.json().then(data => console.log(r.status, data)));
