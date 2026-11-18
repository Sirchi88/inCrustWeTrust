-- =====================================================================
--  HOF-PIZZA · Startdaten (aus der bisherigen Base44-Seite übernommen)
--  Nach schema.sql einmal ausführen. Fügt nur etwas ein, wenn die
--  jeweilige Tabelle noch leer ist – vorhandene Daten bleiben unberührt.
-- =====================================================================

update settings set base_price = 5, max_toppings = 8, max_pizzas_per_order = 2,
                    slot_minutes = 10, reserve_percent = 10
where id = 1 and admin_password_hash is null;

do $$ begin
  if not exists (select 1 from ingredients) then
    insert into ingredients (name, description, glyph, price, unit, amount_per_pizza, is_sauce, sort_order) values
      ('Tomatensoße',  'San Marzano',        'sauce',      0, 'g',      80,  true,  0),
      ('Fior di Latte','Fior di Latte',      'mozzarella', 0, 'g',      100, false, 1),
      ('Salami',       'Salami piccante',    'salami',     0, 'g',      40,  false, 2),
      ('Schinken',     'Kochschinken',       'ham',        0, 'g',      50,  false, 3),
      ('Thunfisch',    'in Olivenöl',        'tuna',       0, 'g',      50,  false, 4),
      ('Champignons',  'frisch geschnitten', 'mushroom',   0, 'g',      40,  false, 5),
      ('Mais',         'süß & knackig',      'corn',       0, 'g',      40,  false, 6),
      ('Oliven',       'Taggiasca',          'olive',      0, 'g',      15,  false, 7),
      ('Zwiebeln',     'rote Zwiebel',       'onion',      0, 'g',      30,  false, 8),
      ('Ei',           'im Ofen gestockt',   'egg',        0, 'stueck', 1,   false, 9),
      ('Rucola',       'wild',               'rucola',     0, 'g',      15,  false, 10),
      ('Basilikum',    'frisch',             'basil',      0, 'g',      2,   false, 11),
      ('Parmesan',     '24 Monate gereift',  'parmesan',   0, 'g',      10,  false, 12);
  end if;

  if not exists (select 1 from drinks) then
    insert into drinks (name, description, price, illustration, sort_order) values
      ('Paulaner Cola',            '0,5 l Flasche', 2.5, 'cola',         1),
      ('Paulaner Spezi',           '0,5 l Flasche', 2.5, 'spezi',        2),
      ('Flötzinger Spezi',         '0,5 l Flasche', 2.5, 'floetz_spezi', 3),
      ('Spezi Energy',             '0,33 l Dose',   3,   'spezi_energy', 4),
      ('Wasser mit Kohlensäure',   '0,5 l Flasche', 2,   'wasser_mit',   5),
      ('Wasser ohne Kohlensäure',  '0,5 l Flasche', 2,   'wasser_ohne',  6),
      ('Nein danke – kein Durst',  'Ohne Getränk',  0,   'kein_durst',   7);
  end if;

  if not exists (select 1 from events) then
    insert into events (title, date, pickup_start, pickup_end, order_deadline, orders_open)
    values ('Familienmittag', '2026-11-22', '11:30', '12:30', '2026-11-22T11:30', false);
  end if;
end $$;
