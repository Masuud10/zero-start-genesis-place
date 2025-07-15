-- Phase 1: Inventory Management Database Schema
-- Creating comprehensive inventory management tables with proper RLS policies

-- Table for inventory item categories (e.g., "Stationery", "Lab Equipment", "Sports Gear")
CREATE TABLE public.inventory_categories (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table for suppliers
CREATE TABLE public.inventory_suppliers (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone_number TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table for the inventory items themselves
CREATE TABLE public.inventory_items (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
    supplier_id BIGINT REFERENCES public.inventory_suppliers(id) ON DELETE SET NULL,
    sku TEXT, -- Stock Keeping Unit
    reorder_level INT NOT NULL DEFAULT 0,
    current_quantity INT NOT NULL DEFAULT 0, -- This will be updated by triggers
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(school_id, sku) DEFERRABLE INITIALLY DEFERRED
);

-- Table for all stock movements (the ledger)
CREATE TABLE public.stock_transactions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    item_id BIGINT REFERENCES public.inventory_items(id) ON DELETE CASCADE NOT NULL,
    transaction_type TEXT NOT NULL, -- e.g., 'stock_in', 'stock_out', 'adjustment'
    quantity_change INT NOT NULL, -- Can be positive (stock in) or negative (stock out)
    notes TEXT,
    transaction_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_inventory_categories_school_id ON public.inventory_categories(school_id);
CREATE INDEX idx_inventory_suppliers_school_id ON public.inventory_suppliers(school_id);
CREATE INDEX idx_inventory_items_school_id ON public.inventory_items(school_id);
CREATE INDEX idx_inventory_items_category_id ON public.inventory_items(category_id);
CREATE INDEX idx_inventory_items_supplier_id ON public.inventory_items(supplier_id);
CREATE INDEX idx_stock_transactions_item_id ON public.stock_transactions(item_id);
CREATE INDEX idx_stock_transactions_user_id ON public.stock_transactions(user_id);
CREATE INDEX idx_stock_transactions_date ON public.stock_transactions(transaction_date);

-- Enable Row-Level Security on all new tables
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_categories
CREATE POLICY "Finance officers can manage categories for their school" 
ON public.inventory_categories FOR ALL 
USING (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() = 'finance_officer'
)
WITH CHECK (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() = 'finance_officer'
);

CREATE POLICY "School staff can view categories for their school" 
ON public.inventory_categories FOR SELECT 
USING (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')
);

CREATE POLICY "System admins can manage all categories" 
ON public.inventory_categories FOR ALL 
USING (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'))
WITH CHECK (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

-- RLS Policies for inventory_suppliers
CREATE POLICY "Finance officers can manage suppliers for their school" 
ON public.inventory_suppliers FOR ALL 
USING (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() = 'finance_officer'
)
WITH CHECK (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() = 'finance_officer'
);

CREATE POLICY "School staff can view suppliers for their school" 
ON public.inventory_suppliers FOR SELECT 
USING (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')
);

CREATE POLICY "System admins can manage all suppliers" 
ON public.inventory_suppliers FOR ALL 
USING (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'))
WITH CHECK (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

-- RLS Policies for inventory_items
CREATE POLICY "Finance officers can manage items for their school" 
ON public.inventory_items FOR ALL 
USING (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() = 'finance_officer'
)
WITH CHECK (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() = 'finance_officer'
);

CREATE POLICY "School staff can view items for their school" 
ON public.inventory_items FOR SELECT 
USING (
    school_id = get_current_user_school_id() AND 
    get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')
);

CREATE POLICY "System admins can manage all items" 
ON public.inventory_items FOR ALL 
USING (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'))
WITH CHECK (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

-- RLS Policies for stock_transactions
CREATE POLICY "Finance officers can manage transactions for their school items" 
ON public.stock_transactions FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.inventory_items i 
        WHERE i.id = item_id 
        AND i.school_id = get_current_user_school_id()
    ) AND get_current_user_role() = 'finance_officer'
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.inventory_items i 
        WHERE i.id = item_id 
        AND i.school_id = get_current_user_school_id()
    ) AND get_current_user_role() = 'finance_officer'
);

CREATE POLICY "School staff can view transactions for their school items" 
ON public.stock_transactions FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.inventory_items i 
        WHERE i.id = item_id 
        AND i.school_id = get_current_user_school_id()
    ) AND get_current_user_role() IN ('principal', 'school_owner', 'teacher', 'finance_officer')
);

CREATE POLICY "System admins can manage all transactions" 
ON public.stock_transactions FOR ALL 
USING (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'))
WITH CHECK (get_current_user_role() IN ('elimisha_admin', 'edufam_admin'));

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_categories_updated_at
  BEFORE UPDATE ON public.inventory_categories
  FOR EACH ROW EXECUTE FUNCTION update_inventory_updated_at();

CREATE TRIGGER update_inventory_suppliers_updated_at
  BEFORE UPDATE ON public.inventory_suppliers
  FOR EACH ROW EXECUTE FUNCTION update_inventory_updated_at();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_inventory_updated_at();

-- Create trigger to automatically update current_quantity when stock transactions are created
CREATE OR REPLACE FUNCTION update_item_quantity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the current quantity of the item
  UPDATE public.inventory_items 
  SET current_quantity = current_quantity + NEW.quantity_change,
      updated_at = NOW()
  WHERE id = NEW.item_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_item_quantity_on_transaction
  AFTER INSERT ON public.stock_transactions
  FOR EACH ROW EXECUTE FUNCTION update_item_quantity();