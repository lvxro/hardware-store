-- T-024: pedidos de la tienda.
-- Se crea un pedido cuando el cliente toca "Pagar con Mercado Pago" (api/checkout.js) y se
-- actualiza cuando Mercado Pago avisa el pago (api/webhook.js). El id es el mismo número que
-- viaja a Mercado Pago como "external_reference".
create table public.pedidos (
  id uuid primary key,
  creado timestamptz not null default now(),
  estado text not null default 'pendiente',  -- pendiente, aprobado, rechazado, reintegrado...
  correo text,                               -- el de la cuenta, si el cliente inició sesión
  items jsonb not null,                      -- [{ id, nombre, marca, cantidad, precio }]
  total numeric not null check (total >= 0),
  pago_id text,                              -- número de operación de Mercado Pago
  medio text,                                -- credit_card, account_money, etc.
  cuotas int,
  mail_enviado timestamptz,                  -- cuándo salió el comprobante (null = todavía no)
  stock_descontado boolean not null default false  -- T-025: si ya se descontó el stock de este pedido
);

-- Seguridad: la web no puede leer ni escribir esta tabla. Solo las funciones de Vercel,
-- con la clave secreta (SUPABASE_SERVICE_ROLE_KEY), que se saltea estas reglas.
alter table public.pedidos enable row level security;
