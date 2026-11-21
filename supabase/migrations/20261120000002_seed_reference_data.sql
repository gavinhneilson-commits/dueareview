-- Reference data only. No reviews are seeded: real reviews are written in the admin.
insert into public.categories (slug, name, description, sort_order) values
  ('technology-gadgets', 'Technology & Gadgets', 'Phones, audio, smart home and anything with a charging cable.', 10),
  ('home-kitchen',       'Home & Kitchen',       'Appliances, cookware and the stuff that lives on your worktop.', 20),
  ('fitness-sports',     'Fitness & Sports',     'Kit that promises to make you fitter. We check whether it does.', 30),
  ('tools-diy',          'Tools & DIY',          'Drills, gadgets and garage gear.', 40),
  ('cars-accessories',   'Cars & Accessories',   'Dash cams, chargers, cleaning kit and car tech.', 50),
  ('health-lifestyle',   'Health & Lifestyle',   'Everyday products for looking after yourself. Not medical advice.', 60),
  ('outdoor-travel',     'Outdoor & Travel',     'Bags, camping kit and travel gear.', 70),
  ('budget-finds',       'Budget Finds',         'Cheap stuff that is actually good. Rare, but it happens.', 80),
  ('premium-products',   'Premium Products',     'Expensive stuff. Is it worth it? Let''s find out.', 90),
  ('weird-wonderful',    'Weird & Wonderful',    'Gadgets nobody asked for. We tested them anyway.', 100)
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
  ('social', '{"youtube":"https://www.youtube.com/@dueareview","instagram":"https://www.instagram.com/dueareview","tiktok":"https://www.tiktok.com/@dueareview","x":"","facebook":"","threads":""}'::jsonb),
  ('homepage', '{"hero_review_id":null,"featured_review_ids":[]}'::jsonb),
  ('disclosures', '{"affiliate_short":"Some links on this page are affiliate links. If you buy through them we may earn a small commission, at no extra cost to you. It never affects our scores.","sponsored_short":"This content is sponsored. The sponsor had no control over our verdict or score."}'::jsonb),
  ('contact', '{"email":""}'::jsonb)
on conflict (key) do nothing;
