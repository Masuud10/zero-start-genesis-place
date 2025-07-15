-- Create database function for handling inventory transactions atomically
CREATE OR REPLACE FUNCTION handle_inventory_transaction(
  p_item_id integer,
  p_quantity_change integer,
  p_transaction_type text,
  p_user_id uuid,
  p_supplier_id integer DEFAULT NULL,
  p_notes text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_quantity integer;
  v_new_quantity integer;
  v_transaction_id integer;
BEGIN
  -- Get current quantity and lock the row for update
  SELECT current_quantity INTO v_current_quantity
  FROM inventory_items
  WHERE id = p_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory item not found';
  END IF;

  -- Calculate new quantity
  v_new_quantity := v_current_quantity + p_quantity_change;

  -- Ensure we don't go below zero
  IF v_new_quantity < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', v_current_quantity, ABS(p_quantity_change);
  END IF;

  -- Update inventory item quantity
  UPDATE inventory_items 
  SET 
    current_quantity = v_new_quantity,
    updated_at = now()
  WHERE id = p_item_id;

  -- Insert transaction record
  INSERT INTO stock_transactions (
    item_id,
    quantity_change,
    transaction_type,
    user_id,
    supplier_id,
    notes,
    transaction_date
  ) VALUES (
    p_item_id,
    p_quantity_change,
    p_transaction_type,
    p_user_id,
    p_supplier_id,
    p_notes,
    now()
  ) RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'old_quantity', v_current_quantity,
    'new_quantity', v_new_quantity
  );
END;
$$;