ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;

CREATE POLICY store_isolation ON products USING
(store_id = current_setting('app.current_store_id', true));

