import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

interface InquiryRecord {
  referenceId: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  receivedAt: string;
}

interface OrderItemInput {
  id: string;
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

interface OrderDraftRecord {
  orderReference: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: 'mtn_momo' | 'airtel_money' | 'card' | 'cash_on_delivery';
  items: OrderItemInput[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'recorded_awaiting_gateway';
  createdAt: string;
}

const inquiryLog: InquiryRecord[] = [];
const orderDrafts: OrderDraftRecord[] = [];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s()-]{6,20}$/;

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'scholarpack-storefront' });
  });

  app.post('/api/contact', async (req, res) => {
    const body = req.body ?? {};
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    const errors: Record<string, string> = {};
    if (fullName.length < 2) {
      errors.fullName = 'Please enter your full name (at least 2 characters).';
    }
    if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!PHONE_PATTERN.test(phone)) {
      errors.phone = 'Please provide a valid phone or WhatsApp number.';
    }
    if (message.length < 10) {
      errors.message = 'Please include a short message (at least 10 characters).';
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        ok: false,
        error: 'Please check the highlighted fields and try again.',
        fieldErrors: errors,
      });
      return;
    }

    const referenceId = `INQ-${Date.now().toString(36).toUpperCase()}`;
    const record: InquiryRecord = {
      referenceId,
      fullName,
      email,
      phone,
      message,
      receivedAt: new Date().toISOString(),
    };

    inquiryLog.push(record);
    if (inquiryLog.length > 200) inquiryLog.shift();

    // Note: No external SMTP / email relay is configured in this local environment.
    // We record the inquiry cleanly on the server and return a real reference ID.
    res.status(201).json({
      ok: true,
      referenceId,
      receivedAt: record.receivedAt,
      deliveryMode: 'server_recorded',
      notice:
        'Your inquiry has been saved to our store desk queue. Email/SMS dispatch requires connecting your mail provider in production.',
    });
  });

  app.post('/api/checkout/session', async (req, res) => {
    const body = req.body ?? {};
    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const customerPhone = typeof body.customerPhone === 'string' ? body.customerPhone.trim() : '';
    const paymentMethod = body.paymentMethod;
    const rawItems = Array.isArray(body.items) ? body.items : [];

    const allowedMethods = ['mtn_momo', 'airtel_money', 'card', 'cash_on_delivery'];
    if (customerName.length < 2) {
      res.status(400).json({ ok: false, error: 'Please enter a recipient name.' });
      return;
    }
    if (!PHONE_PATTERN.test(customerPhone)) {
      res.status(400).json({ ok: false, error: 'Please enter a valid mobile number for order updates.' });
      return;
    }
    if (!allowedMethods.includes(paymentMethod)) {
      res.status(400).json({ ok: false, error: 'Please select a valid payment method.' });
      return;
    }
    if (rawItems.length === 0) {
      res.status(400).json({ ok: false, error: 'Your shopping bag is currently empty.' });
      return;
    }

    const items: OrderItemInput[] = rawItems.map((item: Record<string, unknown>) => ({
      id: String(item.id ?? ''),
      name: String(item.name ?? 'School Item'),
      quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)),
      price: Math.max(0, Number(item.price) || 0),
      variant: typeof item.variant === 'string' ? item.variant : undefined,
    }));

    const subtotal = Number(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    );
    const deliveryFee = subtotal >= 75 ? 0 : 6.5;
    const total = Number((subtotal + deliveryFee).toFixed(2));
    const orderReference = `SP-${Math.floor(100000 + Math.random() * 900000)}`;

    const draft: OrderDraftRecord = {
      orderReference,
      customerName,
      customerPhone,
      paymentMethod,
      items,
      subtotal,
      deliveryFee,
      total,
      status: 'recorded_awaiting_gateway',
      createdAt: new Date().toISOString(),
    };

    orderDrafts.push(draft);
    if (orderDrafts.length > 200) orderDrafts.shift();

    res.status(201).json({
      ok: true,
      order: draft,
      gatewayReadyNotice:
        'Order reservation recorded locally. Connect your live Mobile Money or card gateway credentials in /api/checkout/session to process live charges.',
    });
  });

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', async (_req, res) => {
      const indexHtml = await fs.readFile(path.join(distDir, 'index.html'), 'utf-8');
      res.status(200).set({ 'Content-Type': 'text/html' }).send(indexHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarPack server listening on http://localhost:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
