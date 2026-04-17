export function getTossSecretKey() {
  const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;

  if (!secretKey) {
    throw new Error("TOSS_PAYMENTS_SECRET_KEY가 없습니다.");
  }

  return secretKey;
}

export function getTossAuthHeader() {
  return `Basic ${Buffer.from(`${getTossSecretKey()}:`).toString("base64")}`;
}

export async function cancelTossPayment(params: {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
  idempotencyKey?: string;
}) {
  const response = await fetch(
    `https://api.tosspayments.com/v1/payments/${params.paymentKey}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: getTossAuthHeader(),
        "Content-Type": "application/json",
        "Idempotency-Key":
          params.idempotencyKey ?? `cancel-${params.paymentKey}`,
      },
      body: JSON.stringify({
        cancelReason: params.cancelReason,
        ...(typeof params.cancelAmount === "number"
          ? { cancelAmount: params.cancelAmount }
          : {}),
      }),
    }
  );

  const data = await response.json();

  return {
    response,
    data,
  };
}
