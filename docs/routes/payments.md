# Payment Routes

Base path:

`/api/payment`

The current implementation should use a development/test payment provider rather than a real banking provider.

## POST /api/payment/request

Creates a payment request for an existing unpaid order.

Typical flow:

```text
Order
  |
  v
Payment Request
  |
  v
Test Payment Provider
  |
  v
Payment URL / reference
```

## GET /api/payment/verify

Verifies a payment using the provider reference.

Development mode may simulate a successful payment.

After successful verification:

```text
Payment.status = PAID
Order.status   = PROCESSING
```

Failed payment:

```text
Payment.status = FAILED
```

## Payment status

```text
PENDING
PAID
FAILED
REFUNDED
```

## Important

Do not mark an order as paid merely because the frontend says payment succeeded.

The backend must verify the payment with the payment provider.
