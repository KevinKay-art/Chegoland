import crypto from 'crypto';

/**
 * M-Pesa STK Push service module (Dual-mode: Live Daraja Sandbox/Production + Local Simulator).
 *
 * - When MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET are configured in environment
 *   variables, this module calls Safaricom Daraja v1 directly
 *   (https://sandbox.safaricom.co.ke or https://api.safaricom.co.ke).
 * - When those env vars are unset, it runs the built-in local simulator so
 *   checkout can be tested immediately without external credentials.
 */

const SANDBOX_SHORTCODE = '174379';
const SANDBOX_PASSKEY =
  'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

export interface StkPushRequest {
  orderId: string;
  orderNumber: string;
  phone: string;
  amountKes: number;
  simulateOutcome?: 'success' | 'failed';
}

export interface StkPushSession {
  mode: 'daraja' | 'simulation';
  checkoutRequestId: string;
  merchantRequestId: string;
  orderId: string;
  orderNumber: string;
  phone: string;
  amountKes: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  resultDesc: string;
  mpesaReceipt?: string;
  createdAtMs: number;
  resolveAtMs: number;
  forcedOutcome?: 'success' | 'failed';
}

const stkSessions = new Map<string, StkPushSession>();

export function isDarajaConfigured(): boolean {
  return Boolean(
    process.env.MPESA_CONSUMER_KEY?.trim() &&
      process.env.MPESA_CONSUMER_SECRET?.trim()
  );
}

function getDarajaBaseUrl(): string {
  return process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}

function getDarajaCredentials() {
  const isProd = process.env.MPESA_ENV === 'production';
  const consumerKey = process.env.MPESA_CONSUMER_KEY?.trim() || '';
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET?.trim() || '';
  const shortcode =
    process.env.MPESA_SHORTCODE?.trim() || (isProd ? '' : SANDBOX_SHORTCODE);
  const passkey =
    process.env.MPESA_PASSKEY?.trim() || (isProd ? '' : SANDBOX_PASSKEY);
  const appBase = process.env.APP_URL?.replace(/\/$/, '') || 'https://example.com';
  const callbackUrl =
    process.env.MPESA_CALLBACK_URL?.trim() || `${appBase}/api/payments/mpesa/callback`;

  return { consumerKey, consumerSecret, shortcode, passkey, callbackUrl };
}

function getDarajaTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
    now.getHours()
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

async function fetchDarajaAccessToken(): Promise<string> {
  const { consumerKey, consumerSecret } = getDarajaCredentials();
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const res = await fetch(
    `${getDarajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Daraja OAuth failed (${res.status}): ${body}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('Daraja OAuth did not return an access_token.');
  }
  return data.access_token;
}

export function normalizeKenyanMsisdn(phone: string): string {
  const digits = phone.replace(/[\s\-()]/g, '');
  if (digits.startsWith('+254')) return digits.slice(1);
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  return digits;
}

export async function initiateStkPush(req: StkPushRequest): Promise<StkPushSession> {
  const msisdn = normalizeKenyanMsisdn(req.phone);
  const now = Date.now();

  if (isDarajaConfigured()) {
    const { shortcode, passkey, callbackUrl } = getDarajaCredentials();
    const timestamp = getDarajaTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    const token = await fetchDarajaAccessToken();

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.max(1, Math.round(req.amountKes)),
      PartyA: msisdn,
      PartyB: shortcode,
      PhoneNumber: msisdn,
      CallBackURL: callbackUrl,
      AccountReference: req.orderNumber,
      TransactionDesc: `CHEGOLAND Dairy ${req.orderNumber}`,
    };

    const res = await fetch(`${getDarajaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResponseCode?: string;
      ResponseDescription?: string;
      errorMessage?: string;
    };

    if (!res.ok || data.ResponseCode !== '0' || !data.CheckoutRequestID) {
      throw new Error(
        data.errorMessage ||
          data.ResponseDescription ||
          'Daraja STK Push request was rejected.'
      );
    }

    const session: StkPushSession = {
      mode: 'daraja',
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID || `MR_${Date.now()}`,
      orderId: req.orderId,
      orderNumber: req.orderNumber,
      phone: msisdn,
      amountKes: req.amountKes,
      status: 'PENDING',
      resultDesc: data.ResponseDescription || 'Success. Request accepted for processing',
      createdAtMs: now,
      resolveAtMs: now,
    };
    stkSessions.set(session.checkoutRequestId, session);
    return session;
  }

  // Local simulation fallback when Daraja keys are not configured
  const checkoutRequestId = `ws_CO_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const merchantRequestId = `MR_${crypto.randomBytes(5).toString('hex').toUpperCase()}`;

  const defaultOutcome: 'success' | 'failed' =
    req.simulateOutcome ?? (msisdn.endsWith('0000') ? 'failed' : 'success');

  const session: StkPushSession = {
    mode: 'simulation',
    checkoutRequestId,
    merchantRequestId,
    orderId: req.orderId,
    orderNumber: req.orderNumber,
    phone: msisdn,
    amountKes: req.amountKes,
    status: 'PENDING',
    resultDesc: 'Success. Request accepted for processing',
    createdAtMs: now,
    resolveAtMs: now + 3200,
    forcedOutcome: defaultOutcome,
  };

  stkSessions.set(checkoutRequestId, session);
  return session;
}

export async function queryStkStatus(
  checkoutRequestId: string
): Promise<StkPushSession | null> {
  const session = stkSessions.get(checkoutRequestId);
  if (!session) return null;

  if (session.mode === 'daraja' && session.status === 'PENDING') {
    try {
      const { shortcode, passkey } = getDarajaCredentials();
      const timestamp = getDarajaTimestamp();
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
      const token = await fetchDarajaAccessToken();

      const res = await fetch(`${getDarajaBaseUrl()}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          ResultCode?: string | number;
          ResultDesc?: string;
        };
        if (String(data.ResultCode) === '0') {
          session.status = 'SUCCESS';
          session.resultDesc = data.ResultDesc || 'Payment confirmed via Daraja.';
          session.mpesaReceipt =
            session.mpesaReceipt || `MPESA_${checkoutRequestId.slice(-8).toUpperCase()}`;
        } else if (data.ResultCode !== undefined) {
          session.status = 'FAILED';
          session.resultDesc = data.ResultDesc || 'M-Pesa transaction did not complete.';
        }
      }
    } catch {
      // Keep PENDING if Daraja query is still processing or transiently unreachable
    }
    return session;
  }

  if (
    session.mode === 'simulation' &&
    session.status === 'PENDING' &&
    Date.now() >= session.resolveAtMs
  ) {
    if (session.forcedOutcome === 'failed') {
      session.status = 'FAILED';
      session.resultDesc = 'Request cancelled by user or insufficient M-Pesa balance.';
    } else {
      session.status = 'SUCCESS';
      session.resultDesc = 'The service request is processed successfully.';
      session.mpesaReceipt = `UBK${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    }
  }

  return session;
}

export function applyDarajaCallback(body: unknown): StkPushSession | null {
  const cb = (body as { Body?: { stkCallback?: Record<string, unknown> } })?.Body
    ?.stkCallback;
  if (!cb) return null;

  const checkoutRequestId = String(cb.CheckoutRequestID || '');
  const session = stkSessions.get(checkoutRequestId);
  if (!session) return null;

  const resultCode = Number(cb.ResultCode);
  const resultDesc = String(cb.ResultDesc || '');

  if (resultCode === 0) {
    session.status = 'SUCCESS';
    session.resultDesc = resultDesc || 'The service request is processed successfully.';
    const items =
      (cb.CallbackMetadata as { Item?: Array<{ Name: string; Value?: unknown }> })
        ?.Item || [];
    const receiptItem = items.find((i) => i.Name === 'MpesaReceiptNumber');
    if (receiptItem?.Value) {
      session.mpesaReceipt = String(receiptItem.Value);
    }
  } else {
    session.status = 'FAILED';
    session.resultDesc = resultDesc || 'M-Pesa payment failed or was cancelled.';
  }

  return session;
}

export async function forceStkOutcome(
  checkoutRequestId: string,
  outcome: 'success' | 'failed'
): Promise<StkPushSession | null> {
  const session = stkSessions.get(checkoutRequestId);
  if (!session) return null;

  session.mode = 'simulation';
  session.forcedOutcome = outcome;
  session.resolveAtMs = Date.now();
  return queryStkStatus(checkoutRequestId);
}
