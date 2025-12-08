-- PrintForge Seed Data
-- Run this after schema.sql in your Supabase SQL Editor
-- 
-- IMPORTANT: Make sure you have run schema.sql FIRST before running this file!
-- The schema creates all necessary tables (categories, materials, products, etc.)

-- ============================================
-- VERIFY TABLES EXIST (will error if schema.sql wasn't run)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    RAISE EXCEPTION 'Table "categories" does not exist. Please run schema.sql first!';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'materials') THEN
    RAISE EXCEPTION 'Table "materials" does not exist. Please run schema.sql first!';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    RAISE EXCEPTION 'Table "products" does not exist. Please run schema.sql first!';
  END IF;
END $$;

-- ============================================
-- SEED CATEGORIES
-- ============================================

INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Home & Office', 'home-office', 'Functional and decorative items for your home and workspace', 1),
  ('Tech Accessories', 'tech-accessories', 'Stands, holders, and organizers for your devices', 2),
  ('Art & Decor', 'art-decor', 'Artistic prints and decorative pieces', 3),
  ('Toys & Games', 'toys-games', 'Fun and creative playthings for all ages', 4),
  ('Tools & Hardware', 'tools-hardware', 'Functional tools and replacement parts', 5),
  ('Hobby & Craft', 'hobby-craft', 'Items for hobbyists and craft enthusiasts', 6),
  ('Custom Prints', 'custom-prints', 'Upload your own designs for printing', 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED MATERIALS
-- ============================================

INSERT INTO materials (name, slug, description, price_per_cm3, colors, properties, min_layer_height, max_layer_height) VALUES
  (
    'PLA',
    'pla',
    'Eco-friendly and beginner-friendly bioplastic. Perfect for decorative items and prototypes.',
    0.05,
    '[
      {"name": "Black", "hex": "#1a1a1a", "premium": false, "price_modifier": 0},
      {"name": "White", "hex": "#ffffff", "premium": false, "price_modifier": 0},
      {"name": "Red", "hex": "#ef4444", "premium": false, "price_modifier": 0},
      {"name": "Blue", "hex": "#3b82f6", "premium": false, "price_modifier": 0},
      {"name": "Green", "hex": "#22c55e", "premium": false, "price_modifier": 0},
      {"name": "Yellow", "hex": "#eab308", "premium": false, "price_modifier": 0},
      {"name": "Orange", "hex": "#f97316", "premium": false, "price_modifier": 0},
      {"name": "Purple", "hex": "#a855f7", "premium": false, "price_modifier": 0},
      {"name": "Pink", "hex": "#ec4899", "premium": false, "price_modifier": 0},
      {"name": "Grey", "hex": "#6b7280", "premium": false, "price_modifier": 0},
      {"name": "Silk Gold", "hex": "#d4af37", "premium": true, "price_modifier": 3},
      {"name": "Silk Silver", "hex": "#c0c0c0", "premium": true, "price_modifier": 3}
    ]'::jsonb,
    '{"strength": 6, "flexibility": 3, "heat_resistance": 4, "detail": 8, "food_safe": true, "uv_resistant": false}'::jsonb,
    0.1,
    0.3
  ),
  (
    'PETG',
    'petg',
    'Strong and water-resistant. Ideal for functional parts and outdoor use.',
    0.07,
    '[
      {"name": "Black", "hex": "#1a1a1a", "premium": false, "price_modifier": 0},
      {"name": "White", "hex": "#ffffff", "premium": false, "price_modifier": 0},
      {"name": "Clear", "hex": "#e5e7eb", "premium": false, "price_modifier": 0},
      {"name": "Blue", "hex": "#3b82f6", "premium": false, "price_modifier": 0},
      {"name": "Red", "hex": "#ef4444", "premium": false, "price_modifier": 0},
      {"name": "Green", "hex": "#22c55e", "premium": false, "price_modifier": 0}
    ]'::jsonb,
    '{"strength": 8, "flexibility": 4, "heat_resistance": 7, "detail": 7, "food_safe": true, "uv_resistant": true}'::jsonb,
    0.1,
    0.3
  ),
  (
    'Resin',
    'resin',
    'Ultra-detailed prints with smooth surface finish. Perfect for miniatures and jewelry.',
    0.12,
    '[
      {"name": "Grey", "hex": "#6b7280", "premium": false, "price_modifier": 0},
      {"name": "White", "hex": "#ffffff", "premium": false, "price_modifier": 0},
      {"name": "Black", "hex": "#1a1a1a", "premium": false, "price_modifier": 0},
      {"name": "Clear", "hex": "#e5e7eb", "premium": true, "price_modifier": 5},
      {"name": "Flesh", "hex": "#fdbba8", "premium": true, "price_modifier": 3}
    ]'::jsonb,
    '{"strength": 5, "flexibility": 2, "heat_resistance": 5, "detail": 10, "food_safe": false, "uv_resistant": false}'::jsonb,
    0.025,
    0.1
  ),
  (
    'TPU Flexible',
    'tpu',
    'Rubber-like flexible material. Great for phone cases, gaskets, and wearables.',
    0.10,
    '[
      {"name": "Black", "hex": "#1a1a1a", "premium": false, "price_modifier": 0},
      {"name": "White", "hex": "#ffffff", "premium": false, "price_modifier": 0},
      {"name": "Red", "hex": "#ef4444", "premium": false, "price_modifier": 0},
      {"name": "Blue", "hex": "#3b82f6", "premium": false, "price_modifier": 0}
    ]'::jsonb,
    '{"strength": 7, "flexibility": 10, "heat_resistance": 6, "detail": 5, "food_safe": false, "uv_resistant": true}'::jsonb,
    0.15,
    0.3
  ),
  (
    'Nylon',
    'nylon',
    'Industrial-grade strength and durability. Ideal for mechanical parts and gears.',
    0.15,
    '[
      {"name": "Natural", "hex": "#f5f5f4", "premium": false, "price_modifier": 0},
      {"name": "Black", "hex": "#1a1a1a", "premium": false, "price_modifier": 0}
    ]'::jsonb,
    '{"strength": 9, "flexibility": 5, "heat_resistance": 8, "detail": 6, "food_safe": false, "uv_resistant": true}'::jsonb,
    0.15,
    0.3
  ),
  (
    'Carbon Fiber PETG',
    'carbon-fiber',
    'Carbon fiber reinforced for exceptional stiffness. Perfect for structural applications.',
    0.20,
    '[
      {"name": "Black", "hex": "#1a1a1a", "premium": false, "price_modifier": 0}
    ]'::jsonb,
    '{"strength": 10, "flexibility": 2, "heat_resistance": 8, "detail": 6, "food_safe": false, "uv_resistant": true}'::jsonb,
    0.2,
    0.3
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED PRODUCTS
-- ============================================

-- Get material and category IDs for reference
DO $$
DECLARE
  cat_home_office UUID;
  cat_tech UUID;
  cat_art UUID;
  cat_toys UUID;
  cat_tools UUID;
  cat_hobby UUID;
  mat_pla UUID;
  mat_petg UUID;
  mat_resin UUID;
  mat_tpu UUID;
BEGIN
  SELECT id INTO cat_home_office FROM categories WHERE slug = 'home-office';
  SELECT id INTO cat_tech FROM categories WHERE slug = 'tech-accessories';
  SELECT id INTO cat_art FROM categories WHERE slug = 'art-decor';
  SELECT id INTO cat_toys FROM categories WHERE slug = 'toys-games';
  SELECT id INTO cat_tools FROM categories WHERE slug = 'tools-hardware';
  SELECT id INTO cat_hobby FROM categories WHERE slug = 'hobby-craft';
  SELECT id INTO mat_pla FROM materials WHERE slug = 'pla';
  SELECT id INTO mat_petg FROM materials WHERE slug = 'petg';
  SELECT id INTO mat_resin FROM materials WHERE slug = 'resin';
  SELECT id INTO mat_tpu FROM materials WHERE slug = 'tpu';

  -- Home & Office Products
  INSERT INTO products (name, slug, description, short_description, category_id, base_price, compare_at_price, images, default_material_id, is_featured, tags, average_rating, review_count) VALUES
    (
      'Geometric Desk Organizer',
      'geometric-desk-organizer',
      'Keep your desk tidy with this modern geometric organizer. Features multiple compartments for pens, scissors, and small accessories. The honeycomb-inspired design adds a contemporary touch to any workspace.',
      'Modern honeycomb desk organizer with multiple compartments',
      cat_home_office,
      29.99,
      39.99,
      '["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800", "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800"]'::jsonb,
      mat_pla,
      true,
      ARRAY['desk', 'organizer', 'office', 'geometric', 'modern'],
      4.8,
      127
    ),
    (
      'Minimalist Planter Set',
      'minimalist-planter-set',
      'Set of 3 elegant planters in different sizes. Perfect for succulents and small plants. Features drainage holes and matching saucers. The clean lines complement any interior style.',
      'Set of 3 modern planters with drainage',
      cat_home_office,
      34.99,
      NULL,
      '["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800"]'::jsonb,
      mat_pla,
      true,
      ARRAY['planter', 'home', 'plants', 'minimalist', 'decor'],
      4.9,
      89
    ),
    (
      'Wall-Mount Key Holder',
      'wall-mount-key-holder',
      'Never lose your keys again! This wall-mounted key holder features 5 hooks and a small shelf for mail or wallet. Easy installation with included hardware.',
      '5-hook key holder with mail shelf',
      cat_home_office,
      19.99,
      24.99,
      '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'::jsonb,
      mat_petg,
      false,
      ARRAY['keys', 'wall mount', 'organizer', 'entryway'],
      4.6,
      203
    ),
    (
      'Floating Bookend Set',
      'floating-bookend-set',
      'Create the illusion of floating books with this clever bookend design. Invisible when in use, these bookends support heavy books securely.',
      'Invisible floating bookend design',
      cat_home_office,
      24.99,
      NULL,
      '["https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800"]'::jsonb,
      mat_petg,
      false,
      ARRAY['books', 'bookend', 'shelf', 'invisible'],
      4.7,
      156
    );

  -- Tech Accessories Products
  INSERT INTO products (name, slug, description, short_description, category_id, base_price, compare_at_price, images, default_material_id, is_featured, tags, average_rating, review_count) VALUES
    (
      'Honeycomb Phone Stand',
      'honeycomb-phone-stand',
      'Adjustable phone stand with unique honeycomb design. Works with any smartphone in portrait or landscape mode. The open design allows for charging while in use.',
      'Adjustable stand with honeycomb pattern',
      cat_tech,
      19.99,
      NULL,
      '["https://images.unsplash.com/photo-1586953208270-767889fa9b0f?w=800"]'::jsonb,
      mat_pla,
      true,
      ARRAY['phone', 'stand', 'holder', 'honeycomb', 'adjustable'],
      4.9,
      312
    ),
    (
      'Modular Cable Clips (Set of 10)',
      'modular-cable-clips',
      'Keep your cables organized with these modular clips. Each clip holds up to 3 cables and can be mounted with adhesive or screws. Link multiple clips together for custom cable management.',
      '10-pack cable management clips',
      cat_tech,
      12.99,
      15.99,
      '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'::jsonb,
      mat_petg,
      false,
      ARRAY['cable', 'management', 'organizer', 'desk', 'clips'],
      4.5,
      567
    ),
    (
      'Laptop Riser Stand',
      'laptop-riser-stand',
      'Ergonomic laptop stand raises your screen to eye level. Features ventilation slots for cooling and cable routing. Supports laptops up to 17 inches.',
      'Ergonomic stand with ventilation',
      cat_tech,
      39.99,
      49.99,
      '["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"]'::jsonb,
      mat_petg,
      true,
      ARRAY['laptop', 'stand', 'ergonomic', 'riser', 'desk'],
      4.8,
      234
    ),
    (
      'Headphone Stand',
      'headphone-stand',
      'Sleek headphone stand to display and store your headphones. Features a cable holder and soft contact points to protect your gear.',
      'Minimalist headphone display stand',
      cat_tech,
      24.99,
      NULL,
      '["https://images.unsplash.com/photo-1545127398-14699f92334b?w=800"]'::jsonb,
      mat_pla,
      false,
      ARRAY['headphone', 'stand', 'holder', 'gaming', 'audio'],
      4.7,
      178
    ),
    (
      'Flexible Phone Case',
      'flexible-phone-case',
      'Custom-fit flexible phone case with shock-absorbing corners. Available for most popular phone models. Slim profile maintains phone aesthetics.',
      'TPU flexible protective case',
      cat_tech,
      14.99,
      NULL,
      '["https://images.unsplash.com/photo-1601593346740-925612772716?w=800"]'::jsonb,
      mat_tpu,
      false,
      ARRAY['phone', 'case', 'flexible', 'protection'],
      4.4,
      423
    );

  -- Art & Decor Products
  INSERT INTO products (name, slug, description, short_description, category_id, base_price, compare_at_price, images, default_material_id, is_featured, tags, average_rating, review_count) VALUES
    (
      'Low Poly Animal Collection',
      'low-poly-animal-collection',
      'Set of 5 geometric low-poly animals: lion, bear, wolf, deer, and eagle. Each piece is approximately 6 inches tall. Perfect for shelf display or as desk companions.',
      'Set of 5 geometric animal sculptures',
      cat_art,
      49.99,
      69.99,
      '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"]'::jsonb,
      mat_pla,
      true,
      ARRAY['art', 'sculpture', 'geometric', 'animals', 'low poly'],
      4.9,
      267
    ),
    (
      'Moon Lamp',
      'moon-lamp',
      'Realistic moon surface texture lamp. Touch-controlled with 3 brightness levels. Includes wooden stand and USB charging cable.',
      'Realistic moon texture night light',
      cat_art,
      34.99,
      44.99,
      '["https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=800"]'::jsonb,
      mat_pla,
      true,
      ARRAY['lamp', 'moon', 'light', 'decor', 'night light'],
      4.8,
      445
    ),
    (
      'Geometric Wall Art (3-Piece)',
      'geometric-wall-art',
      'Three-piece geometric wall art set. Creates a stunning 3D shadow effect. Includes mounting hardware.',
      '3-piece 3D geometric wall decor',
      cat_art,
      44.99,
      NULL,
      '["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800"]'::jsonb,
      mat_pla,
      false,
      ARRAY['wall art', 'geometric', '3D', 'decor', 'modern'],
      4.6,
      189
    ),
    (
      'Crystal Vase',
      'crystal-vase',
      'Elegant vase with crystal-inspired faceted design. Watertight for fresh flowers. Available in clear and frosted finishes.',
      'Faceted crystal-style flower vase',
      cat_art,
      29.99,
      NULL,
      '["https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=800"]'::jsonb,
      mat_resin,
      false,
      ARRAY['vase', 'crystal', 'flowers', 'decor'],
      4.7,
      134
    );

  -- Toys & Games Products
  INSERT INTO products (name, slug, description, short_description, category_id, base_price, compare_at_price, images, default_material_id, is_featured, tags, average_rating, review_count) VALUES
    (
      'Articulated Dragon',
      'articulated-dragon',
      'Fully articulated dragon with movable joints. 14 inches long when stretched out. Print-in-place design requires no assembly.',
      'Poseable dragon with flexible joints',
      cat_toys,
      49.99,
      NULL,
      '["https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=800"]'::jsonb,
      mat_pla,
      true,
      ARRAY['dragon', 'articulated', 'toy', 'fidget', 'fantasy'],
      4.9,
      523
    ),
    (
      'Puzzle Cube Collection',
      'puzzle-cube-collection',
      'Set of 3 mechanical puzzle cubes of varying difficulty. Great for brain training and stress relief. Ages 8+.',
      '3 mechanical puzzle cubes',
      cat_toys,
      24.99,
      29.99,
      '["https://images.unsplash.com/photo-1591991731833-b4807cf7ef94?w=800"]'::jsonb,
      mat_pla,
      false,
      ARRAY['puzzle', 'brain', 'game', 'toy', 'educational'],
      4.5,
      178
    ),
    (
      'Flexi Rex (T-Rex)',
      'flexi-rex',
      'Adorable flexible T-Rex dinosaur. Fully poseable with no assembly required. Available in multiple color combinations.',
      'Cute poseable dinosaur toy',
      cat_toys,
      14.99,
      NULL,
      '["https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=800"]'::jsonb,
      mat_pla,
      true,
      ARRAY['dinosaur', 'rex', 'toy', 'fidget', 'cute'],
      4.8,
      687
    ),
    (
      'Chess Set - Modern Edition',
      'chess-set-modern',
      'Complete chess set with modern minimalist pieces. Includes board and 32 pieces. Board measures 12x12 inches.',
      'Minimalist chess set with board',
      cat_toys,
      59.99,
      79.99,
      '["https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800"]'::jsonb,
      mat_pla,
      false,
      ARRAY['chess', 'game', 'board game', 'modern', 'minimalist'],
      4.7,
      234
    );

  -- Tools & Hardware Products
  INSERT INTO products (name, slug, description, short_description, category_id, base_price, compare_at_price, images, default_material_id, is_featured, tags, average_rating, review_count) VALUES
    (
      'Precision Screwdriver Set Holder',
      'screwdriver-holder',
      'Organized storage for precision screwdrivers. Holds up to 24 bits in a rotating tower design. Non-slip base.',
      'Rotating screwdriver bit organizer',
      cat_tools,
      22.99,
      NULL,
      '["https://images.unsplash.com/photo-1426927308491-6380b6a9936f?w=800"]'::jsonb,
      mat_petg,
      false,
      ARRAY['tools', 'screwdriver', 'organizer', 'holder'],
      4.6,
      189
    ),
    (
      'Adjustable Wrench (Printable)',
      'adjustable-wrench',
      'Functional adjustable wrench for light-duty tasks. Great for demonstrations and educational purposes. Maximum opening: 1 inch.',
      'Print-in-place adjustable wrench',
      cat_tools,
      9.99,
      NULL,
      '["https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800"]'::jsonb,
      mat_petg,
      false,
      ARRAY['wrench', 'tool', 'functional', 'educational'],
      4.3,
      312
    ),
    (
      'Replacement Knobs (6-Pack)',
      'replacement-knobs',
      'Universal replacement knobs for appliances and furniture. 6 different styles included. M4 thread compatible.',
      '6 universal replacement knobs',
      cat_tools,
      16.99,
      19.99,
      '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'::jsonb,
      mat_petg,
      false,
      ARRAY['knobs', 'replacement', 'hardware', 'appliance'],
      4.5,
      145
    );

  -- Hobby & Craft Products
  INSERT INTO products (name, slug, description, short_description, category_id, base_price, compare_at_price, images, default_material_id, is_featured, tags, average_rating, review_count) VALUES
    (
      'Miniature Painting Handle',
      'mini-painting-handle',
      'Ergonomic handle for painting miniatures. Spring-loaded grip accommodates various base sizes. Reduces hand fatigue during long painting sessions.',
      'Ergonomic miniature painting grip',
      cat_hobby,
      18.99,
      NULL,
      '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'::jsonb,
      mat_pla,
      false,
      ARRAY['miniature', 'painting', 'hobby', 'warhammer', 'DnD'],
      4.8,
      423
    ),
    (
      'D&D Dice Tower',
      'dnd-dice-tower',
      'Medieval castle-themed dice tower for tabletop gaming. Ensures fair rolls every time. Includes matching dice tray.',
      'Castle dice tower with tray',
      cat_hobby,
      29.99,
      NULL,
      '["https://images.unsplash.com/photo-1518893883800-45cd0954574b?w=800"]'::jsonb,
      mat_pla,
      true,
      ARRAY['dice', 'tower', 'DnD', 'tabletop', 'gaming'],
      4.9,
      567
    ),
    (
      'Custom Miniatures (28mm Scale)',
      'custom-miniatures',
      'High-detail 28mm scale miniatures for tabletop games. Variety of character classes available. Printed in high-resolution resin.',
      'Detailed gaming miniatures',
      cat_hobby,
      8.99,
      NULL,
      '["https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800"]'::jsonb,
      mat_resin,
      true,
      ARRAY['miniature', 'DnD', 'warhammer', 'tabletop', '28mm'],
      4.9,
      892
    ),
    (
      'Thread Spool Organizer',
      'thread-spool-organizer',
      'Wall-mounted thread organizer holds up to 50 spools. Clear view of all colors at a glance. Easy installation.',
      '50-spool wall thread organizer',
      cat_hobby,
      27.99,
      34.99,
      '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'::jsonb,
      mat_pla,
      false,
      ARRAY['sewing', 'thread', 'organizer', 'craft'],
      4.6,
      156
    );
END $$;

-- ============================================
-- SEED COUPONS
-- ============================================

INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order, usage_limit, valid_until) VALUES
  ('WELCOME10', 'Welcome discount for new customers', 'percentage', 10, 25, NULL, NOW() + INTERVAL '1 year'),
  ('FIRST20', 'First order 20% off', 'percentage', 20, 50, 1000, NOW() + INTERVAL '6 months'),
  ('FREESHIP', 'Free shipping on orders over $50', 'fixed', 9.99, 50, NULL, NOW() + INTERVAL '3 months'),
  ('BULK25', 'Bulk order discount', 'percentage', 25, 200, 100, NOW() + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- SEED SAMPLE REVIEWS
-- ============================================

DO $$
DECLARE
  prod_desk_organizer UUID;
  prod_phone_stand UUID;
  prod_dragon UUID;
BEGIN
  SELECT id INTO prod_desk_organizer FROM products WHERE slug = 'geometric-desk-organizer';
  SELECT id INTO prod_phone_stand FROM products WHERE slug = 'honeycomb-phone-stand';
  SELECT id INTO prod_dragon FROM products WHERE slug = 'articulated-dragon';

  -- Reviews for Geometric Desk Organizer
  INSERT INTO reviews (product_id, rating, title, comment, is_verified) VALUES
    (prod_desk_organizer, 5, 'Perfect for my workspace', 'This organizer is exactly what I needed. The geometric design looks great and it holds everything perfectly. Print quality is excellent!', true),
    (prod_desk_organizer, 5, 'Better than expected', 'Arrived quickly and the quality exceeded my expectations. The compartments are the perfect size for pens, scissors, and small items.', true),
    (prod_desk_organizer, 4, 'Great design, minor issue', 'Love the design and functionality. The only minor issue is one of the compartments is a bit tight for thicker markers. Otherwise perfect!', true),
    (prod_desk_organizer, 5, 'Received many compliments', 'Everyone who visits my office comments on this organizer. Its both functional and a conversation starter.', true);

  -- Reviews for Honeycomb Phone Stand
  INSERT INTO reviews (product_id, rating, title, comment, is_verified) VALUES
    (prod_phone_stand, 5, 'Best phone stand ever', 'I have tried many phone stands and this is by far the best. The honeycomb design allows for great airflow when charging.', true),
    (prod_phone_stand, 5, 'Stable and stylish', 'Very stable even when using the phone while its on the stand. The design is unique and matches my setup perfectly.', true),
    (prod_phone_stand, 4, 'Good for most phones', 'Works great with my phone in a case. The adjustable angle is nice. Would be 5 stars if it came in more colors.', true);

  -- Reviews for Articulated Dragon
  INSERT INTO reviews (product_id, rating, title, comment, is_verified) VALUES
    (prod_dragon, 5, 'Kids love it!', 'Bought this for my son and he plays with it constantly. The joints move smoothly and its surprisingly durable.', true),
    (prod_dragon, 5, 'Amazing print quality', 'The detail on this dragon is incredible. Every scale is perfectly printed. A true work of art!', true),
    (prod_dragon, 5, 'Great fidget toy', 'Perfect desk toy for keeping hands busy during calls. The articulation is smooth and satisfying.', true),
    (prod_dragon, 4, 'Beautiful but fragile', 'Looks amazing and the articulation is great. Just be careful as some of the thinner parts are delicate.', true);
END $$;

-- Verify seed data
SELECT 'Categories:' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Materials:', COUNT(*) FROM materials
UNION ALL
SELECT 'Products:', COUNT(*) FROM products
UNION ALL
SELECT 'Coupons:', COUNT(*) FROM coupons
UNION ALL
SELECT 'Reviews:', COUNT(*) FROM reviews;
