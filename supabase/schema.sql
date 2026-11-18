-- =====================================================================
--  HOF-PIZZA · Datenbank für Supabase
--  Einmal komplett im Supabase SQL-Editor ausführen (New query → Run).
--  Das Skript ist wiederholbar: Funktionen werden ersetzt, Tabellen und
--  vorhandene Daten bleiben erhalten.
--
--  Sicherheit: Alle Tabellen sind per Row Level Security gesperrt.
--  Die Website greift ausschließlich über die Funktionen unten zu.
--  Admin-Funktionen prüfen jedes Mal das Sitzungs-Token.
-- =====================================================================

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- pg_net wird für die Push-Benachrichtigung (ntfy.sh) gebraucht.
-- Falls nicht verfügbar, läuft alles andere trotzdem.
do $$ begin
  create extension if not exists pg_net;
exception when others then
  raise notice 'pg_net nicht verfügbar – Push-Benachrichtigungen deaktiviert.';
end $$;

-- ---------------------------------------------------------------------
--  Tabellen
-- ---------------------------------------------------------------------
create table if not exists settings (
  id                    int primary key default 1 check (id = 1),
  base_price            numeric(8,2) not null default 5,
  max_toppings          int not null default 8,
  max_pizzas_per_order  int not null default 2,
  slot_minutes          int not null default 10,
  reserve_percent       int not null default 10,
  cancel_hours_before   int not null default 1,
  admin_username        text not null default 'dani',
  admin_password_hash   text,
  ntfy_topic            text not null default ''
);

create table if not exists admin_sessions (
  token       text primary key,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '30 days'
);

create table if not exists events (
  id              uuid primary key default gen_random_uuid(),
  title           text not null default 'Pizza-Abend',
  date            date not null,
  pickup_start    text not null default '18:00',
  pickup_end      text not null default '21:00',
  order_deadline  text not null default '',
  orders_open     boolean not null default true,
  notes           text not null default '',
  created_at      timestamptz not null default now()
);

create table if not exists ingredients (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text not null default '',
  glyph             text not null default 'mozzarella',
  price             numeric(8,2) not null default 0,
  unit              text not null default 'g',
  amount_per_pizza  numeric(10,2) not null default 0,
  is_active         boolean not null default true,
  is_sauce          boolean not null default false,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now()
);

create table if not exists drinks (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text not null default '',
  price         numeric(8,2) not null default 0,
  illustration  text not null default 'cola',
  available     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists pizzas (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  description           text not null default '',
  base_price            numeric(8,2) not null default 10,
  default_ingredients   uuid[] not null default '{}',
  optional_ingredients  uuid[] not null default '{}',
  on_menu               boolean not null default true,
  is_active             boolean not null default true,
  sort_order            int not null default 0,
  created_at            timestamptz not null default now()
);

create table if not exists orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text not null unique,
  event_id       uuid not null references events(id) on delete cascade,
  customer_name  text not null,
  pickup_time    text not null,               -- 'YYYY-MM-DDTHH:MM' (Ortszeit)
  status         text not null default 'eingegangen'
                 check (status in ('eingegangen','in_bearbeitung','abholbereit','abgeholt','storniert')),
  total          numeric(8,2) not null default 0,
  note           text not null default '',
  items          jsonb not null default '[]',
  drinks         jsonb not null default '[]',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  canceled_at    timestamptz,
  canceled_via   text
);
create index if not exists orders_event_idx on orders(event_id);
-- Ein Abholslot kann nur von einer aktiven Bestellung belegt sein.
create unique index if not exists orders_slot_unique
  on orders(event_id, pickup_time) where status <> 'storniert';

alter table settings        enable row level security;
alter table admin_sessions  enable row level security;
alter table events          enable row level security;
alter table ingredients     enable row level security;
alter table drinks          enable row level security;
alter table pizzas          enable row level security;
alter table orders          enable row level security;

do $$ begin
  execute 'revoke all on settings, admin_sessions, events, ingredients, drinks, pizzas, orders from anon, authenticated';
exception when undefined_object then null;  -- lokale Postgres-Instanz ohne Supabase-Rollen
end $$;

insert into settings (id) values (1) on conflict do nothing;

-- ---------------------------------------------------------------------
--  Hilfsfunktionen
-- ---------------------------------------------------------------------
create or replace function _now_local() returns timestamp
language sql stable as $$ select (now() at time zone 'Europe/Berlin') $$;

create or replace function _fmt_dt(ts timestamp) returns text
language sql immutable as $$ select to_char(ts, 'DD.MM.YYYY, HH24:MI') $$;

create or replace function _settings_json(s settings) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'basePrice', s.base_price, 'maxToppings', s.max_toppings,
    'maxPizzasPerOrder', s.max_pizzas_per_order, 'slotMinutes', s.slot_minutes,
    'reservePercent', s.reserve_percent, 'cancelHoursBefore', s.cancel_hours_before,
    'adminUsername', s.admin_username, 'ntfyTopic', s.ntfy_topic)
$$;

create or replace function _event_json(e events) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'id', e.id, 'title', e.title, 'date', to_char(e.date, 'YYYY-MM-DD'),
    'pickupStart', e.pickup_start, 'pickupEnd', e.pickup_end,
    'orderDeadline', e.order_deadline, 'ordersOpen', e.orders_open, 'notes', e.notes)
$$;

create or replace function _ingredient_json(i ingredients) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'id', i.id, 'name', i.name, 'description', i.description, 'glyph', i.glyph,
    'price', i.price, 'unit', i.unit, 'amountPerPizza', i.amount_per_pizza,
    'isActive', i.is_active, 'isSauce', i.is_sauce, 'sortOrder', i.sort_order)
$$;

create or replace function _drink_json(d drinks) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'id', d.id, 'name', d.name, 'description', d.description, 'price', d.price,
    'illustration', d.illustration, 'available', d.available, 'sortOrder', d.sort_order)
$$;

create or replace function _pizza_json(p pizzas) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'id', p.id, 'name', p.name, 'description', p.description, 'basePrice', p.base_price,
    'defaultIngredients', to_jsonb(p.default_ingredients),
    'optionalIngredients', to_jsonb(p.optional_ingredients),
    'onMenu', p.on_menu, 'isActive', p.is_active, 'sortOrder', p.sort_order)
$$;

create or replace function _order_json(o orders) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'id', o.id, 'orderNumber', o.order_number, 'eventId', o.event_id,
    'customerName', o.customer_name, 'pickupTime', o.pickup_time,
    'pickupLabel', substr(o.pickup_time, 12, 5), 'status', o.status,
    'total', o.total, 'note', o.note, 'items', o.items, 'drinks', o.drinks,
    'pizzaCount', jsonb_array_length(o.items),
    'created_date', o.created_at, 'updated_date', o.updated_at,
    'canceledAt', o.canceled_at, 'canceledVia', o.canceled_via,
    'eventDate', to_char(e.date, 'YYYY-MM-DD'), 'eventTitle', e.title,
    'pickupStart', e.pickup_start, 'pickupEnd', e.pickup_end)
  from events e where e.id = o.event_id
$$;

create or replace function _event_is_open(e events) returns boolean
language sql stable as $$
  select e.orders_open
     and e.date >= _now_local()::date
     and (coalesce(e.order_deadline, '') = ''
          or _now_local() < replace(e.order_deadline, 'T', ' ')::timestamp)
$$;

-- Nächster anstehender Termin (heute oder später)
create or replace function _active_event() returns events
language sql stable as $$
  select * from events where date >= _now_local()::date
  order by date, pickup_start limit 1
$$;

create or replace function _slots(e events) returns jsonb
language plpgsql stable as $$
declare
  s settings;
  t timestamp;
  t_end timestamp;
  res jsonb := '[]';
  key text;
begin
  select * into s from settings where id = 1;
  t     := e.date + e.pickup_start::time;
  t_end := e.date + e.pickup_end::time;
  while t < t_end loop
    key := to_char(t, 'YYYY-MM-DD"T"HH24:MI');
    res := res || jsonb_build_object(
      'time', key, 'label', to_char(t, 'HH24:MI'),
      'taken', exists(select 1 from orders o where o.event_id = e.id
                      and o.pickup_time = key and o.status <> 'storniert'));
    t := t + make_interval(mins => greatest(s.slot_minutes, 1));
  end loop;
  return res;
end $$;

-- Push-Nachricht an Dani via ntfy.sh (kostenlos, ohne Konto).
create or replace function _notify(p_title text, p_message text, p_tags text[]) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare topic text;
begin
  select ntfy_topic into topic from settings where id = 1;
  if coalesce(topic, '') = '' then return; end if;
  begin
    execute 'select net.http_post(url := $1, body := $2, headers := $3)'
      using 'https://ntfy.sh',
            jsonb_build_object('topic', topic, 'title', p_title, 'message', p_message,
                               'tags', to_jsonb(p_tags), 'click', ''),
            '{"Content-Type":"application/json"}'::jsonb;
  exception when others then
    raise notice 'Benachrichtigung fehlgeschlagen: %', sqlerrm;
  end;
end $$;

create or replace function _require_admin(p_token text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if p_token is null or not exists (
    select 1 from admin_sessions where token = p_token and expires_at > now()
  ) then
    raise exception 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.';
  end if;
end $$;

-- ---------------------------------------------------------------------
--  Öffentliche Funktionen (Website)
-- ---------------------------------------------------------------------
create or replace function public_home() returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare e events; s settings;
begin
  select * into s from settings where id = 1;
  e := _active_event();
  return jsonb_build_object(
    'event', case when e.id is null then null else _event_json(e) end,
    'open',  case when e.id is null then false else _event_is_open(e) end,
    'drinks', coalesce((select jsonb_agg(jsonb_build_object('id', d.id, 'name', d.name,
                 'illustration', d.illustration) order by d.sort_order, d.created_at)
               from drinks d where d.available and d.illustration <> 'kein_durst'), '[]'),
    'settings', jsonb_build_object('slotMinutes', s.slot_minutes, 'basePrice', s.base_price));
end $$;

create or replace function public_order_form() returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare e events; s settings;
begin
  select * into s from settings where id = 1;
  e := _active_event();
  return jsonb_build_object(
    'event', case when e.id is null then null else _event_json(e) end,
    'open',  case when e.id is null then false else _event_is_open(e) end,
    'slots', case when e.id is null then '[]'::jsonb else _slots(e) end,
    'sauce', (select jsonb_build_object('id', i.id, 'name', i.name, 'glyph', i.glyph, 'price', i.price)
              from ingredients i where i.is_sauce and i.is_active
              order by i.sort_order limit 1),
    'toppings', coalesce((select jsonb_agg(jsonb_build_object('id', i.id, 'name', i.name,
                   'glyph', i.glyph, 'price', i.price, 'description', i.description)
                   order by i.sort_order, i.created_at)
                 from ingredients i where i.is_active and not i.is_sauce), '[]'),
    'drinks', coalesce((select jsonb_agg(jsonb_build_object('id', d.id, 'name', d.name,
                 'description', d.description, 'price', d.price, 'illustration', d.illustration)
                 order by d.sort_order, d.created_at)
               from drinks d where d.available), '[]'),
    'settings', jsonb_build_object('maxPizzasPerOrder', s.max_pizzas_per_order,
                 'slotMinutes', s.slot_minutes, 'maxToppings', s.max_toppings,
                 'basePrice', s.base_price));
end $$;

create or replace function public_slots(p_event_id uuid) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare e events;
begin
  select * into e from events where id = p_event_id;
  if e.id is null then raise exception 'Termin nicht gefunden.'; end if;
  return jsonb_build_object('slots', _slots(e));
end $$;

create or replace function place_order(payload jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  s settings; e events; sauce ingredients; tp ingredients; d drinks;
  v_name text := btrim(coalesce(payload->>'name', ''));
  v_pickup text := coalesce(payload->>'pickupTime', '');
  v_pizza jsonb; v_drink jsonb;
  v_ids uuid[]; v_names text[]; v_glyphs text[]; v_price numeric;
  v_items jsonb := '[]'; v_drinks jsonb := '[]'; v_total numeric := 0;
  v_qty int; v_number text; v_count int;
begin
  select * into s from settings where id = 1;
  select * into e from events where id = (payload->>'eventId')::uuid;
  if e.id is null then raise exception 'Termin nicht gefunden.'; end if;
  if not _event_is_open(e) then raise exception 'Für diesen Termin sind keine Bestellungen mehr möglich.'; end if;
  if length(v_name) < 2 then raise exception 'Bitte gib deinen Namen an.'; end if;
  if length(v_name) > 80 then raise exception 'Der Name ist zu lang.'; end if;

  v_count := jsonb_array_length(coalesce(payload->'pizzas', '[]'));
  if v_count < 1 then raise exception 'Bitte stelle mindestens eine Pizza zusammen.'; end if;
  if v_count > s.max_pizzas_per_order then
    raise exception 'Maximal % Pizzen pro Bestellung.', s.max_pizzas_per_order;
  end if;

  -- gleichzeitige Bestellungen für denselben Termin nacheinander abarbeiten
  perform pg_advisory_xact_lock(hashtext(e.id::text));

  if not exists (select 1 from jsonb_array_elements(_slots(e)) x
                 where x->>'time' = v_pickup) then
    raise exception 'Bitte wähle eine gültige Abholzeit.';
  end if;
  if exists (select 1 from orders where event_id = e.id and pickup_time = v_pickup
             and status <> 'storniert') then
    raise exception 'Diese Abholzeit wurde gerade vergeben – bitte wähle eine andere.';
  end if;

  select * into sauce from ingredients where is_sauce and is_active order by sort_order limit 1;

  for v_pizza in select * from jsonb_array_elements(payload->'pizzas') loop
    select coalesce(array_agg(x::uuid), '{}') into v_ids
      from jsonb_array_elements_text(coalesce(v_pizza->'ingredientIds', '[]')) x;
    if array_length(v_ids, 1) > s.max_toppings then
      raise exception 'Maximal % Zutaten pro Pizza.', s.max_toppings;
    end if;
    if (select count(*) from ingredients where id = any(v_ids) and is_active and not is_sauce)
       <> coalesce(array_length(v_ids, 1), 0) then
      raise exception 'Eine gewählte Zutat ist nicht mehr verfügbar. Bitte lade die Seite neu.';
    end if;
    v_names := case when sauce.id is null then '{}' else array[sauce.name] end;
    v_glyphs := case when sauce.id is null then '{}' else array[sauce.glyph] end;
    v_price := s.base_price;
    for tp in select * from ingredients where id = any(v_ids) order by sort_order, created_at loop
      v_names := v_names || tp.name;
      v_glyphs := v_glyphs || tp.glyph;
      v_price := v_price + tp.price;
    end loop;
    v_items := v_items || jsonb_build_object(
      'id', gen_random_uuid(), 'pizzaName', 'Eigene Pizza',
      'ingredientIds', to_jsonb(v_ids), 'ingredients', to_jsonb(v_names),
      'glyphs', to_jsonb(v_glyphs), 'price', round(v_price, 2));
    v_total := v_total + v_price;
  end loop;

  for v_drink in select * from jsonb_array_elements(coalesce(payload->'drinks', '[]')) loop
    select * into d from drinks where id = (v_drink->>'drinkId')::uuid and available;
    if d.id is null then raise exception 'Ein Getränk ist nicht mehr verfügbar.'; end if;
    continue when d.illustration = 'kein_durst';
    v_qty := least(greatest(coalesce((v_drink->>'quantity')::int, 1), 1), 10);
    v_drinks := v_drinks || jsonb_build_object(
      'id', gen_random_uuid(), 'drinkId', d.id, 'drinkName', d.name,
      'quantity', v_qty, 'price', round(d.price * v_qty, 2));
    v_total := v_total + d.price * v_qty;
  end loop;

  loop
    v_number := 'HP-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 4));
    exit when not exists (select 1 from orders where order_number = v_number);
  end loop;

  insert into orders (order_number, event_id, customer_name, pickup_time, total, items, drinks)
  values (v_number, e.id, v_name, v_pickup, round(v_total, 2), v_items, v_drinks);

  perform _notify(
    '🍕 Neue Bestellung ' || v_number,
    v_name || ' · ' || substr(v_pickup, 12, 5) || ' Uhr · ' || v_count ||
      case when v_count = 1 then ' Pizza' else ' Pizzen' end ||
      ' · ' || replace(to_char(round(v_total, 2), 'FM9990.00'), '.', ',') || ' €',
    array['pizza']);

  return jsonb_build_object('orderNumber', v_number);
end $$;

create or replace function get_order(p_order_number text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare o orders;
begin
  select * into o from orders where order_number = upper(btrim(p_order_number));
  if o.id is null then return jsonb_build_object('order', null); end if;
  return jsonb_build_object('order', _order_json(o) - 'note');
end $$;

create or replace function _cancel_until(e events) returns timestamp
language sql stable as $$
  select (e.date + e.pickup_start::time)
       - make_interval(hours => (select cancel_hours_before from settings where id = 1))
$$;

create or replace function lookup_order_for_cancel(p_order_number text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare o orders; e events;
begin
  select * into o from orders where order_number = upper(btrim(p_order_number));
  if o.id is null then
    raise exception 'Zu dieser Bestellnummer haben wir nichts gefunden. Bitte prüfe die Schreibweise.';
  end if;
  if o.status = 'storniert' then raise exception 'Diese Bestellung ist bereits storniert.'; end if;
  if o.status = 'abgeholt' then raise exception 'Diese Bestellung wurde bereits abgeholt.'; end if;
  select * into e from events where id = o.event_id;
  return jsonb_build_object(
    'order', jsonb_build_object('orderNumber', o.order_number, 'customerName', o.customer_name,
      'eventDate', to_char(e.date, 'YYYY-MM-DD'), 'pickupLabel', substr(o.pickup_time, 12, 5),
      'pizzaCount', jsonb_array_length(o.items), 'total', o.total, 'status', o.status),
    'cancelUntil', _fmt_dt(_cancel_until(e)),
    'canCancel', _now_local() < _cancel_until(e));
end $$;

create or replace function cancel_order(p_order_number text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare o orders; e events;
begin
  select * into o from orders where order_number = upper(btrim(p_order_number)) for update;
  if o.id is null then raise exception 'Bestellung nicht gefunden.'; end if;
  if o.status = 'storniert' then raise exception 'Diese Bestellung ist bereits storniert.'; end if;
  if o.status in ('abgeholt', 'abholbereit', 'in_bearbeitung') then
    raise exception 'Diese Bestellung ist schon in Arbeit und kann online nicht mehr storniert werden. Bitte melde dich direkt bei Dani.';
  end if;
  select * into e from events where id = o.event_id;
  if _now_local() >= _cancel_until(e) then
    raise exception 'Die Online-Stornierung ist nur bis % Uhr möglich. Bitte melde dich direkt bei Dani.',
      _fmt_dt(_cancel_until(e));
  end if;
  update orders set status = 'storniert', canceled_at = now(), canceled_via = 'kunde', updated_at = now()
   where id = o.id;
  perform _notify('❌ Storniert ' || o.order_number,
    o.customer_name || ' · ' || substr(o.pickup_time, 12, 5) || ' Uhr ist wieder frei.',
    array['x']);
  return jsonb_build_object('orderNumber', o.order_number, 'status', 'storniert');
end $$;

-- ---------------------------------------------------------------------
--  Chefsache (Admin)
-- ---------------------------------------------------------------------
create or replace function admin_needs_setup() returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select admin_password_hash is null from settings where id = 1
$$;

create or replace function admin_login(p_username text, p_password text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare s settings; v_token text;
begin
  select * into s from settings where id = 1 for update;
  if s.admin_password_hash is null then
    -- Ersteinrichtung: die ersten Zugangsdaten werden gespeichert.
    if length(btrim(coalesce(p_username, ''))) < 3 then
      raise exception 'Der Benutzername braucht mindestens 3 Zeichen.';
    end if;
    if length(coalesce(p_password, '')) < 6 then
      raise exception 'Das Passwort braucht mindestens 6 Zeichen.';
    end if;
    update settings set admin_username = btrim(p_username),
           admin_password_hash = crypt(p_password, gen_salt('bf')) where id = 1;
  elsif lower(btrim(coalesce(p_username, ''))) <> lower(s.admin_username)
        or crypt(coalesce(p_password, ''), s.admin_password_hash) <> s.admin_password_hash then
    perform pg_sleep(0.6);
    raise exception 'Benutzername oder Passwort stimmt nicht.';
  end if;
  delete from admin_sessions where expires_at < now();
  v_token := encode(gen_random_bytes(32), 'hex');
  insert into admin_sessions (token) values (v_token);
  return jsonb_build_object('token', v_token);
end $$;

create or replace function admin_logout(p_token text) returns void
language sql security definer set search_path = public, extensions as $$
  delete from admin_sessions where token = p_token
$$;

create or replace function admin_state(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare s settings; e events; v_active uuid;
begin
  perform _require_admin(p_token);
  select * into s from settings where id = 1;
  e := _active_event();
  v_active := coalesce(e.id, (select id from events order by date desc limit 1));
  return jsonb_build_object(
    'admin', jsonb_build_object('username', s.admin_username),
    'settings', _settings_json(s),
    'activeEventId', v_active,
    'events', coalesce((select jsonb_agg(_event_json(x) order by x.date desc, x.pickup_start)
                        from events x), '[]'),
    'orders', coalesce((select jsonb_agg(_order_json(o) order by o.pickup_time, o.created_at)
                        from orders o), '[]'),
    'ingredients', coalesce((select jsonb_agg(_ingredient_json(i) order by i.sort_order, i.created_at)
                             from ingredients i), '[]'),
    'drinks', coalesce((select jsonb_agg(_drink_json(d) order by d.sort_order, d.created_at)
                        from drinks d), '[]'),
    'pizzas', coalesce((select jsonb_agg(_pizza_json(p) order by p.sort_order, p.created_at)
                        from pizzas p), '[]'));
end $$;

-- Termine ----------------------------------------------------------------
create or replace function admin_save_event(p_token text, p_event jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := nullif(p_event->>'id', '')::uuid; v_date date;
begin
  perform _require_admin(p_token);
  v_date := nullif(p_event->>'date', '')::date;
  if v_date is null then raise exception 'Bitte ein Datum angeben.'; end if;
  if coalesce(p_event->>'pickupStart', '') !~ '^\d{2}:\d{2}$'
     or coalesce(p_event->>'pickupEnd', '') !~ '^\d{2}:\d{2}$' then
    raise exception 'Bitte Abholzeiten im Format HH:MM angeben.';
  end if;
  if (p_event->>'pickupEnd') <= (p_event->>'pickupStart') then
    raise exception '„Abholung bis“ muss nach „Abholung ab“ liegen.';
  end if;
  if v_id is null then
    insert into events (title, date, pickup_start, pickup_end, order_deadline, orders_open, notes)
    values (coalesce(nullif(btrim(p_event->>'title'), ''), 'Pizza-Abend'), v_date,
            p_event->>'pickupStart', p_event->>'pickupEnd',
            coalesce(p_event->>'orderDeadline', ''), coalesce((p_event->>'ordersOpen')::boolean, true),
            coalesce(p_event->>'notes', ''))
    returning id into v_id;
  else
    update events set
      title = coalesce(nullif(btrim(p_event->>'title'), ''), 'Pizza-Abend'), date = v_date,
      pickup_start = p_event->>'pickupStart', pickup_end = p_event->>'pickupEnd',
      order_deadline = coalesce(p_event->>'orderDeadline', ''),
      orders_open = coalesce((p_event->>'ordersOpen')::boolean, true),
      notes = coalesce(p_event->>'notes', '')
    where id = v_id;
  end if;
  return jsonb_build_object('id', v_id);
end $$;

create or replace function admin_set_event_open(p_token text, p_event_id uuid, p_open boolean) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _require_admin(p_token);
  update events set orders_open = p_open where id = p_event_id;
end $$;

-- Löscht einen Termin samt aller zugehörigen Bestellungen.
-- Sind noch offene Bestellungen vorhanden, muss p_force = true sein
-- (die Website fragt vorher mit einer Warnung nach).
create or replace function admin_delete_event(p_token text, p_event_id uuid, p_force boolean default false)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare v_open int; v_all int;
begin
  perform _require_admin(p_token);
  select count(*) filter (where status not in ('abgeholt', 'storniert')), count(*)
    into v_open, v_all from orders where event_id = p_event_id;
  if v_open > 0 and not coalesce(p_force, false) then
    raise exception 'Für diesen Termin sind noch % offene Bestellung(en). Bitte bestätige das Löschen.', v_open;
  end if;
  delete from events where id = p_event_id;   -- Bestellungen werden per CASCADE mitgelöscht
  return jsonb_build_object('deletedOrders', v_all);
end $$;

-- Bestellungen -----------------------------------------------------------
create or replace function admin_set_order_status(p_token text, p_order_id uuid, p_status text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _require_admin(p_token);
  if p_status not in ('eingegangen','in_bearbeitung','abholbereit','abgeholt','storniert') then
    raise exception 'Unbekannter Status.';
  end if;
  update orders set status = p_status, updated_at = now(),
    canceled_at = case when p_status = 'storniert' then coalesce(canceled_at, now()) else null end,
    canceled_via = case when p_status = 'storniert' then coalesce(canceled_via, 'admin') else null end
  where id = p_order_id;
exception when unique_violation then
  raise exception 'Die Abholzeit dieser Bestellung ist inzwischen anderweitig vergeben.';
end $$;

create or replace function admin_update_order_customer(p_token text, p_order_id uuid, p_name text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _require_admin(p_token);
  if length(btrim(coalesce(p_name, ''))) < 2 then raise exception 'Bitte einen Namen angeben.'; end if;
  update orders set customer_name = btrim(p_name), updated_at = now() where id = p_order_id;
end $$;

-- Zutaten ----------------------------------------------------------------
create or replace function admin_save_ingredient(p_token text, p_item jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := nullif(p_item->>'id', '')::uuid;
begin
  perform _require_admin(p_token);
  if btrim(coalesce(p_item->>'name', '')) = '' then raise exception 'Bitte einen Namen angeben.'; end if;
  if v_id is null then
    insert into ingredients (name, description, glyph, price, unit, amount_per_pizza, is_active, is_sauce, sort_order)
    values (btrim(p_item->>'name'), coalesce(p_item->>'description', ''), coalesce(p_item->>'glyph', 'mozzarella'),
            coalesce((p_item->>'price')::numeric, 0), coalesce(p_item->>'unit', 'g'),
            coalesce((p_item->>'amountPerPizza')::numeric, 0), coalesce((p_item->>'isActive')::boolean, true),
            coalesce((p_item->>'isSauce')::boolean, false), coalesce((p_item->>'sortOrder')::int,
              (select coalesce(max(sort_order), 0) + 1 from ingredients)))
    returning id into v_id;
  else
    update ingredients set name = btrim(p_item->>'name'), description = coalesce(p_item->>'description', ''),
      glyph = coalesce(p_item->>'glyph', glyph), price = coalesce((p_item->>'price')::numeric, 0),
      unit = coalesce(p_item->>'unit', unit), amount_per_pizza = coalesce((p_item->>'amountPerPizza')::numeric, 0),
      is_active = coalesce((p_item->>'isActive')::boolean, true),
      is_sauce = coalesce((p_item->>'isSauce')::boolean, is_sauce),
      sort_order = coalesce((p_item->>'sortOrder')::int, sort_order)
    where id = v_id;
  end if;
  return jsonb_build_object('id', v_id);
end $$;

create or replace function admin_delete_ingredient(p_token text, p_id uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _require_admin(p_token);
  delete from ingredients where id = p_id;
end $$;

-- Getränke ---------------------------------------------------------------
create or replace function admin_save_drink(p_token text, p_item jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := nullif(p_item->>'id', '')::uuid;
begin
  perform _require_admin(p_token);
  if btrim(coalesce(p_item->>'name', '')) = '' then raise exception 'Bitte einen Namen angeben.'; end if;
  if v_id is null then
    insert into drinks (name, description, price, illustration, available, sort_order)
    values (btrim(p_item->>'name'), coalesce(p_item->>'description', ''), coalesce((p_item->>'price')::numeric, 0),
            coalesce(p_item->>'illustration', 'cola'), coalesce((p_item->>'available')::boolean, true),
            coalesce((p_item->>'sortOrder')::int, (select coalesce(max(sort_order), 0) + 1 from drinks)))
    returning id into v_id;
  else
    update drinks set name = btrim(p_item->>'name'), description = coalesce(p_item->>'description', ''),
      price = coalesce((p_item->>'price')::numeric, 0), illustration = coalesce(p_item->>'illustration', illustration),
      available = coalesce((p_item->>'available')::boolean, true),
      sort_order = coalesce((p_item->>'sortOrder')::int, sort_order)
    where id = v_id;
  end if;
  return jsonb_build_object('id', v_id);
end $$;

create or replace function admin_delete_drink(p_token text, p_id uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _require_admin(p_token);
  delete from drinks where id = p_id;
end $$;

-- Wochenkarte ------------------------------------------------------------
create or replace function admin_save_pizza(p_token text, p_item jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := nullif(p_item->>'id', '')::uuid; v_def uuid[]; v_opt uuid[];
begin
  perform _require_admin(p_token);
  if btrim(coalesce(p_item->>'name', '')) = '' then raise exception 'Bitte einen Namen angeben.'; end if;
  select coalesce(array_agg(x::uuid), '{}') into v_def
    from jsonb_array_elements_text(coalesce(p_item->'defaultIngredients', '[]')) x;
  select coalesce(array_agg(x::uuid), '{}') into v_opt
    from jsonb_array_elements_text(coalesce(p_item->'optionalIngredients', '[]')) x;
  if v_id is null then
    insert into pizzas (name, description, base_price, default_ingredients, optional_ingredients, on_menu, is_active, sort_order)
    values (btrim(p_item->>'name'), coalesce(p_item->>'description', ''), coalesce((p_item->>'basePrice')::numeric, 0),
            v_def, v_opt, coalesce((p_item->>'onMenu')::boolean, true), coalesce((p_item->>'isActive')::boolean, true),
            coalesce((p_item->>'sortOrder')::int, 0))
    returning id into v_id;
  else
    update pizzas set name = btrim(p_item->>'name'), description = coalesce(p_item->>'description', ''),
      base_price = coalesce((p_item->>'basePrice')::numeric, 0), default_ingredients = v_def,
      optional_ingredients = v_opt, on_menu = coalesce((p_item->>'onMenu')::boolean, true),
      is_active = coalesce((p_item->>'isActive')::boolean, true), sort_order = coalesce((p_item->>'sortOrder')::int, 0)
    where id = v_id;
  end if;
  return jsonb_build_object('id', v_id);
end $$;

create or replace function admin_delete_pizza(p_token text, p_id uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _require_admin(p_token);
  delete from pizzas where id = p_id;
end $$;

-- Einstellungen ----------------------------------------------------------
create or replace function admin_save_settings(p_token text, p_settings jsonb) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _require_admin(p_token);
  update settings set
    base_price = least(greatest(coalesce((p_settings->>'basePrice')::numeric, base_price), 0), 40),
    reserve_percent = least(greatest(coalesce((p_settings->>'reservePercent')::int, reserve_percent), 0), 50),
    max_toppings = least(greatest(coalesce((p_settings->>'maxToppings')::int, max_toppings), 1), 15),
    max_pizzas_per_order = least(greatest(coalesce((p_settings->>'maxPizzasPerOrder')::int, max_pizzas_per_order), 1), 5),
    slot_minutes = least(greatest(coalesce((p_settings->>'slotMinutes')::int, slot_minutes), 5), 60),
    cancel_hours_before = least(greatest(coalesce((p_settings->>'cancelHoursBefore')::int, cancel_hours_before), 0), 72),
    ntfy_topic = btrim(coalesce(p_settings->>'ntfyTopic', ntfy_topic))
  where id = 1;
end $$;

create or replace function admin_test_notification(p_token text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform _require_admin(p_token);
  perform _notify('🍕 Test von Chefsache', 'Push-Benachrichtigungen funktionieren!', array['tada']);
end $$;

create or replace function admin_change_credentials(p_token text, p_username text, p_current text, p_new text)
returns void
language plpgsql security definer set search_path = public, extensions as $$
declare s settings;
begin
  perform _require_admin(p_token);
  select * into s from settings where id = 1;
  if crypt(coalesce(p_current, ''), s.admin_password_hash) <> s.admin_password_hash then
    raise exception 'Das aktuelle Passwort stimmt nicht.';
  end if;
  if length(btrim(coalesce(p_username, ''))) < 3 then
    raise exception 'Der Benutzername braucht mindestens 3 Zeichen.';
  end if;
  if coalesce(p_new, '') <> '' and length(p_new) < 6 then
    raise exception 'Das neue Passwort braucht mindestens 6 Zeichen.';
  end if;
  update settings set admin_username = btrim(p_username),
    admin_password_hash = case when coalesce(p_new, '') = '' then admin_password_hash
                               else crypt(p_new, gen_salt('bf')) end
  where id = 1;
  -- andere Sitzungen abmelden
  delete from admin_sessions where token <> p_token;
end $$;

-- ---------------------------------------------------------------------
--  Rechte: interne Hilfsfunktionen sind nicht von außen aufrufbar.
-- ---------------------------------------------------------------------
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p
           join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like '\_%' loop
    execute format('revoke execute on function %s from public', f.sig);
    begin
      execute format('revoke execute on function %s from anon, authenticated', f.sig);
    exception when undefined_object then null;
    end;
  end loop;
end $$;
