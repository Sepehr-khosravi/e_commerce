const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 15000);

try {
  console.log("Testing Node.js fetch...");

  const response = await fetch(
    "https://sandbox.zarinpal.com/pg/v4/payment/request.json",
    {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant_id: "YOUR_TEST_MERCHANT_ID",
        amount: 10000,
        currency: "IRR",
        description: "Node.js test",
        callback_url: "http://localhost:3000/payment/callback",
      }),
    }
  );

  console.log("STATUS:", response.status);
  console.log("BODY:", await response.text());
} catch (error) {
  console.error("ERROR:", error);
} finally {
  clearTimeout(timeout);
}