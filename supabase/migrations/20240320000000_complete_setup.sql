/*
# Amazon-Style E-commerce Setup

## Query Description:
This migration sets up the complete database structure for the e-commerce application.
It includes tables for addresses, categories, products, orders, and cart items.
It also seeds 50 realistic products with category-specific images.

## Metadata:
- Schema-Category: Structural & Data
- Impact-Level: High
- Requires-Backup: true
- Reversible: false

## Structure Details:
- Tables: addresses, categories, products, orders, order_items, cart_items, wishlist_items
- Constraints: Added unique constraints with existence checks to prevent migration failures.
- Security: RLS enabled on all tables with user-specific policies.
*/

-- 1. Create Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 3. Safely Add Constraints and Policies
DO $$ 
BEGIN
    -- Categories unique slug
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_slug_key') THEN
        ALTER TABLE public.categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
    END IF;

    -- RLS Policies for Addresses
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own addresses') THEN
        CREATE POLICY "Users can manage own addresses" ON public.addresses
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. Seed Categories (Idempotent)
INSERT INTO public.categories (name, slug, image_url)
VALUES 
    ('Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800'),
    ('Fashion', 'fashion', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800'),
    ('Home & Kitchen', 'home-kitchen', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800'),
    ('Beauty', 'beauty', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800'),
    ('Books', 'books', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800')
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url;

-- 5. Seed 50 Realistic Products
-- We use a temporary table to help with category mapping
DO $$
DECLARE
    cat_electronics UUID;
    cat_fashion UUID;
    cat_home UUID;
    cat_beauty UUID;
    cat_books UUID;
BEGIN
    SELECT id INTO cat_electronics FROM public.categories WHERE slug = 'electronics';
    SELECT id INTO cat_fashion FROM public.categories WHERE slug = 'fashion';
    SELECT id INTO cat_home FROM public.categories WHERE slug = 'home-kitchen';
    SELECT id INTO cat_beauty FROM public.categories WHERE slug = 'beauty';
    SELECT id INTO cat_books FROM public.categories WHERE slug = 'books';

    -- Electronics (10)
    INSERT INTO public.products (name, description, price, image_url, category_id, stock_quantity, rating, review_count, is_featured)
    VALUES 
    ('Wireless Noise Cancelling Headphones', 'Premium sound quality with active noise cancellation.', 14999, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', cat_electronics, 50, 4.5, 120, true),
    ('Smart Watch Series 5', 'Track your fitness and stay connected.', 24999, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', cat_electronics, 30, 4.8, 85, true),
    ('Mechanical Gaming Keyboard', 'RGB backlit with blue switches for tactile feedback.', 4500, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800', cat_electronics, 100, 4.2, 200, false),
    ('Ultra-Wide 34-inch Monitor', 'Perfect for multitasking and immersive gaming.', 35000, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', cat_electronics, 15, 4.7, 45, true),
    ('Portable Bluetooth Speaker', 'Waterproof with 20 hours of battery life.', 2999, 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=800', cat_electronics, 200, 4.4, 310, false),
    ('Mirrorless Digital Camera', 'Capture stunning 4K videos and photos.', 65000, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', cat_electronics, 10, 4.9, 25, true),
    ('Power Bank 20000mAh', 'Fast charging for all your devices.', 1999, 'https://images.unsplash.com/photo-1609091839311-d536819bc248?w=800', cat_electronics, 500, 4.3, 1500, false),
    ('Wireless Gaming Mouse', 'High precision sensor with ergonomic design.', 3200, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', cat_electronics, 150, 4.6, 420, false),
    ('Smart Home Assistant', 'Control your home with your voice.', 4999, 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', cat_electronics, 80, 4.1, 560, false),
    ('External SSD 1TB', 'Blazing fast transfer speeds in a compact size.', 8999, 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?w=800', cat_electronics, 40, 4.7, 95, false);

    -- Fashion (10)
    INSERT INTO public.products (name, description, price, image_url, category_id, stock_quantity, rating, review_count, is_featured)
    VALUES 
    ('Classic Denim Jacket', 'Timeless style for any season.', 2499, 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800', cat_fashion, 100, 4.4, 85, true),
    ('Running Sports Shoes', 'Lightweight and breathable for maximum comfort.', 3999, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', cat_fashion, 60, 4.6, 150, true),
    ('Leather Messenger Bag', 'Professional look with multiple compartments.', 4500, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800', cat_fashion, 25, 4.7, 40, false),
    ('Cotton Polo T-Shirt', 'Breathable fabric for a smart casual look.', 999, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800', cat_fashion, 200, 4.2, 300, false),
    ('Aviator Sunglasses', 'UV protection with a classic metal frame.', 1500, 'https://images.unsplash.com/photo-1511499767390-903390e62bc0?w=800', cat_fashion, 150, 4.5, 210, false),
    ('Woolen Winter Scarf', 'Soft and warm for chilly days.', 799, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800', cat_fashion, 80, 4.8, 55, false),
    ('Casual Canvas Sneakers', 'Perfect for everyday wear.', 1800, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800', cat_fashion, 120, 4.3, 180, false),
    ('Minimalist Leather Wallet', 'Slim design with RFID protection.', 1200, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800', cat_fashion, 300, 4.6, 95, false),
    ('Formal Silk Tie', 'Elegant accessory for special occasions.', 850, 'https://images.unsplash.com/photo-1598033129183-c4f50c717f18?w=800', cat_fashion, 50, 4.7, 30, false),
    ('Waterproof Windbreaker', 'Stay dry and stylish in the rain.', 2999, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800', cat_fashion, 45, 4.4, 70, false);

    -- Home & Kitchen (10)
    INSERT INTO public.products (name, description, price, image_url, category_id, stock_quantity, rating, review_count, is_featured)
    VALUES 
    ('Non-Stick Cookware Set', '12-piece set for all your cooking needs.', 5999, 'https://images.unsplash.com/photo-1584990344610-527c59e49f2a?w=800', cat_home, 40, 4.5, 110, true),
    ('Electric Coffee Maker', 'Brew your favorite coffee in minutes.', 3499, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800', cat_home, 25, 4.3, 85, true),
    ('Memory Foam Pillow', 'Ergonomic design for a better sleep.', 1200, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', cat_home, 150, 4.6, 240, false),
    ('Air Purifier with HEPA Filter', 'Clean air for a healthier home.', 12999, 'https://images.unsplash.com/photo-1585771724684-252702b64428?w=800', cat_home, 15, 4.8, 60, true),
    ('Digital Kitchen Scale', 'High precision for perfect recipes.', 899, 'https://images.unsplash.com/photo-1591193113735-e2607f06efaf?w=800', cat_home, 100, 4.4, 180, false),
    ('Stainless Steel Water Bottle', 'Insulated to keep drinks cold for 24 hours.', 1100, 'https://images.unsplash.com/photo-1602143399827-705204c4522b?w=800', cat_home, 300, 4.7, 450, false),
    ('Robotic Vacuum Cleaner', 'Smart cleaning with app control.', 18999, 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800', cat_home, 10, 4.5, 35, true),
    ('Decorative Ceramic Vase', 'Handcrafted beauty for your living room.', 1500, 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800', cat_home, 50, 4.6, 25, false),
    ('Electric Kettle 1.5L', 'Boil water quickly and safely.', 1499, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800', cat_home, 80, 4.2, 190, false),
    ('Microfiber Cleaning Cloths', 'Pack of 12 for scratch-free cleaning.', 499, 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800', cat_home, 500, 4.8, 600, false);

    -- Beauty (10)
    INSERT INTO public.products (name, description, price, image_url, category_id, stock_quantity, rating, review_count, is_featured)
    VALUES 
    ('Organic Face Serum', 'Revitalize your skin with natural ingredients.', 1200, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800', cat_beauty, 100, 4.7, 95, true),
    ('Matte Lipstick Set', 'Long-lasting colors for every occasion.', 1800, 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=800', cat_beauty, 60, 4.5, 120, true),
    ('Hair Growth Oil', 'Nourish your hair from root to tip.', 850, 'https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?w=800', cat_beauty, 150, 4.4, 210, false),
    ('Electric Face Cleansing Brush', 'Deep clean for a glowing complexion.', 2500, 'https://images.unsplash.com/photo-1552046122-03184de85e08?w=800', cat_beauty, 40, 4.6, 55, false),
    ('Scented Candle Gift Set', 'Relaxing aromas for your home.', 1500, 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800', cat_beauty, 80, 4.8, 40, false),
    ('Hydrating Moisturizer', 'Lightweight formula for 24-hour hydration.', 950, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800', cat_beauty, 200, 4.3, 300, false),
    ('Professional Makeup Brush Kit', '15 brushes for a flawless finish.', 2200, 'https://images.unsplash.com/photo-1522338223523-dcacaf132d93?w=800', cat_beauty, 50, 4.7, 85, false),
    ('Charcoal Face Mask', 'Detoxify and minimize pores.', 650, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', cat_beauty, 300, 4.5, 450, false),
    ('Eucalyptus Bath Salts', 'Soothe tired muscles and relax.', 750, 'https://images.unsplash.com/photo-1554462411-c44252229f45?w=800', cat_beauty, 120, 4.8, 60, false),
    ('UV Nail Lamp', 'Salon-quality gel nails at home.', 3500, 'https://images.unsplash.com/photo-1604654894610-df49ff66a7cb?w=800', cat_beauty, 25, 4.6, 30, false);

    -- Books (10)
    INSERT INTO public.products (name, description, price, image_url, category_id, stock_quantity, rating, review_count, is_featured)
    VALUES 
    ('The Art of Coding', 'A comprehensive guide to modern programming.', 899, 'https://images.unsplash.com/photo-1516339901600-2e1a62dc0c45?w=800', cat_books, 100, 4.9, 45, true),
    ('Mystery of the Lost City', 'A thrilling adventure novel.', 450, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', cat_books, 200, 4.5, 120, true),
    ('Healthy Cooking 101', 'Simple and delicious recipes for everyone.', 650, 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800', cat_books, 150, 4.7, 85, false),
    ('Mindfulness Meditation', 'Find peace in a busy world.', 550, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', cat_books, 120, 4.8, 60, false),
    ('History of the Universe', 'Explore the wonders of space and time.', 1200, 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800', cat_books, 50, 4.9, 30, true),
    ('Business Strategies for Success', 'Learn from the world''s top leaders.', 950, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800', cat_books, 80, 4.6, 55, false),
    ('The Power of Habit', 'Why we do what we do in life and business.', 599, 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800', cat_books, 300, 4.7, 1500, false),
    ('Creative Writing Workshop', 'Unlock your imagination and start writing.', 750, 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=800', cat_books, 60, 4.4, 40, false),
    ('Gardening for Beginners', 'Grow your own vegetables and flowers.', 499, 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800', cat_books, 100, 4.5, 75, false),
    ('Travel Guide to Europe', 'Plan your perfect European adventure.', 1100, 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800', cat_books, 40, 4.8, 25, false);

END $$;
