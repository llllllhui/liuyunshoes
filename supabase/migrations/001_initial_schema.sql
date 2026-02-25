-- 产品表
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('new', 'hot', 'classic')),
  description TEXT,
  price DECIMAL(10,2),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 产品图片表
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 客户咨询表
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 管理员表
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- 启用 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 公开读取产品
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

-- 公开读取产品图片
CREATE POLICY "Public read product images" ON product_images
  FOR SELECT USING (true);

-- 允许插入咨询
CREATE POLICY "Public insert inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- 只有认证用户可以管理产品
CREATE POLICY "Authenticated manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- 只有认证用户可以管理图片
CREATE POLICY "Authenticated manage images" ON product_images
  FOR ALL USING (auth.role() = 'authenticated');

-- 管理员策略（简化版，实际使用需要更严格的认证）
CREATE POLICY "Admin full access" ON admins
  FOR ALL USING (true) WITH CHECK (true);
