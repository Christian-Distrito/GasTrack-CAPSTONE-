-- =========================================================
-- COMPANY
-- =========================================================

CREATE TABLE company (
    company_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL UNIQUE,
    dti_reg_no VARCHAR(50) NOT NULL UNIQUE,
    doe_no VARCHAR(50),
    primary_branch VARCHAR(100),
    address VARCHAR(255) NOT NULL
);


-- =========================================================
-- ROLE
-- =========================================================

CREATE TABLE role (
    role_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);


-- =========================================================
-- USER
-- =========================================================

CREATE TABLE app_user (
    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_company
        FOREIGN KEY (company_id)
        REFERENCES company(company_id),

    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id)
        REFERENCES role(role_id),

    CONSTRAINT chk_user_status
        CHECK (status IN ('Active', 'Inactive', 'Suspended'))
);


-- =========================================================
-- CATEGORY
-- =========================================================

CREATE TABLE category (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category VARCHAR(100) NOT NULL UNIQUE
);


-- =========================================================
-- BRAND
-- =========================================================

CREATE TABLE brand (
    brand_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    brand VARCHAR(100) NOT NULL UNIQUE
);


-- =========================================================
-- SUPPLIER
-- =========================================================

CREATE TABLE supplier (
    supplier_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(150),
    address VARCHAR(255),
    contact VARCHAR(30),
    lead_time_days INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_supplier_lead_time
        CHECK (lead_time_days >= 0),

    CONSTRAINT chk_supplier_status
        CHECK (status IN ('Active', 'Inactive'))
);


-- =========================================================
-- PRODUCT
-- =========================================================

CREATE TABLE product (
    product_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category_id INTEGER NOT NULL,
    brand_id INTEGER NOT NULL,
    supplier_id INTEGER NOT NULL,
    unit VARCHAR(30) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    cost_price DECIMAL(12,2) NOT NULL,
    reorder_level INTEGER NOT NULL,
    image_url VARCHAR(500),
    ar_model_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES category(category_id),

    CONSTRAINT fk_product_brand
        FOREIGN KEY (brand_id)
        REFERENCES brand(brand_id),

    CONSTRAINT fk_product_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES supplier(supplier_id),

    CONSTRAINT chk_product_unit_price
        CHECK (unit_price >= 0),

    CONSTRAINT chk_product_cost_price
        CHECK (cost_price >= 0),

    CONSTRAINT chk_product_reorder_level
        CHECK (reorder_level >= 0),

    CONSTRAINT chk_product_status
        CHECK (status IN ('Active', 'Inactive'))
);


-- =========================================================
-- BRANCH
-- =========================================================

CREATE TABLE branch (
    branch_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INTEGER NOT NULL,
    branch_name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    contact_no VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'Active',

    CONSTRAINT fk_branch_company
        FOREIGN KEY (company_id)
        REFERENCES company(company_id),

    CONSTRAINT chk_branch_status
        CHECK (status IN ('Active', 'Inactive'))
);


-- =========================================================
-- WAREHOUSE
-- =========================================================

CREATE TABLE warehouse (
    warehouse_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INTEGER NOT NULL,
    warehouse_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_warehouse_company
        FOREIGN KEY (company_id)
        REFERENCES company(company_id),

    CONSTRAINT chk_warehouse_status
        CHECK (status IN ('Active', 'Inactive'))
);


-- =========================================================
-- INVENTORY
-- =========================================================

CREATE TABLE inventory (
    inventory_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    warehouse_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    stock_on_hand INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES warehouse(warehouse_id),

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES product(product_id),

    CONSTRAINT chk_inventory_stock
        CHECK (stock_on_hand >= 0),

    CONSTRAINT uq_inventory_warehouse_product
        UNIQUE (warehouse_id, product_id)
);


-- =========================================================
-- INVENTORY TRANSACTION
-- =========================================================

CREATE TABLE inventory_transaction (
    transaction_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    inventory_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    reason VARCHAR(30) NOT NULL,
    reference_no VARCHAR(50),
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(255),

    CONSTRAINT fk_transaction_inventory
        FOREIGN KEY (inventory_id)
        REFERENCES inventory(inventory_id),

    CONSTRAINT fk_transaction_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(user_id),

    CONSTRAINT chk_transaction_type
        CHECK (transaction_type IN ('Stock In', 'Stock Out')),

    CONSTRAINT chk_transaction_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_transaction_reason
        CHECK (
            reason IN (
                'Purchase',
                'Sale',
                'Damaged',
                'Lost',
                'Transfer',
                'Adjustment'
            )
        )
);


-- =========================================================
-- TRANSFER
-- =========================================================

CREATE TABLE transfer (
    transfer_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    from_warehouse_id INTEGER NOT NULL,
    to_warehouse_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    transfer_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    remarks VARCHAR(255),

    CONSTRAINT fk_transfer_from_warehouse
        FOREIGN KEY (from_warehouse_id)
        REFERENCES warehouse(warehouse_id),

    CONSTRAINT fk_transfer_to_warehouse
        FOREIGN KEY (to_warehouse_id)
        REFERENCES warehouse(warehouse_id),

    CONSTRAINT fk_transfer_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(user_id),

    CONSTRAINT chk_transfer_different_warehouses
        CHECK (from_warehouse_id <> to_warehouse_id),

    CONSTRAINT chk_transfer_status
        CHECK (
            status IN (
                'Pending',
                'Completed',
                'Cancelled'
            )
        )
);


-- =========================================================
-- TRANSFER DETAIL
-- =========================================================

CREATE TABLE transfer_detail (
    transfer_detail_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transfer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,

    CONSTRAINT fk_transfer_detail_transfer
        FOREIGN KEY (transfer_id)
        REFERENCES transfer(transfer_id),

    CONSTRAINT fk_transfer_detail_product
        FOREIGN KEY (product_id)
        REFERENCES product(product_id),

    CONSTRAINT chk_transfer_detail_quantity
        CHECK (quantity > 0)
);


-- =========================================================
-- CUSTOMER
-- =========================================================

CREATE TABLE customer (
    customer_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER,
    customer_type VARCHAR(20) NOT NULL,
    contact_no VARCHAR(30) NOT NULL,
    address VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(user_id),

    CONSTRAINT chk_customer_type
        CHECK (
            customer_type IN (
                'Commercial',
                'Residential'
            )
        ),

    CONSTRAINT chk_customer_status
        CHECK (
            status IN (
                'Active',
                'Inactive'
            )
        )
);


-- =========================================================
-- ORDER
-- =========================================================

CREATE TABLE orders (
    order_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_type VARCHAR(20) NOT NULL,
    order_status VARCHAR(30) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    remarks VARCHAR(255),

    CONSTRAINT fk_order_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(customer_id),

    CONSTRAINT chk_order_type
        CHECK (
            order_type IN (
                'Walk-in',
                'Pickup',
                'Delivery'
            )
        ),

    CONSTRAINT chk_order_status
        CHECK (
            order_status IN (
                'Pending',
                'Confirmed',
                'Completed',
                'Cancelled'
            )
        ),

    CONSTRAINT chk_order_total
        CHECK (total_amount >= 0)
);


-- =========================================================
-- ORDER DETAILS
-- =========================================================

CREATE TABLE order_details (
    order_detail_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,

    CONSTRAINT fk_order_detail_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id),

    CONSTRAINT fk_order_detail_product
        FOREIGN KEY (product_id)
        REFERENCES product(product_id),

    CONSTRAINT chk_order_detail_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_order_detail_unit_price
        CHECK (unit_price >= 0),

    CONSTRAINT chk_order_detail_subtotal
        CHECK (subtotal >= 0)
);


-- =========================================================
-- SALES
-- =========================================================

CREATE TABLE sales (
    sale_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INTEGER,
    customer_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    sale_no VARCHAR(50) NOT NULL UNIQUE,
    sale_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sales_discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    remarks VARCHAR(255),

    CONSTRAINT fk_sales_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id),

    CONSTRAINT fk_sales_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(customer_id),

    CONSTRAINT fk_sales_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(user_id),

    CONSTRAINT chk_sales_discount
        CHECK (sales_discount >= 0),

    CONSTRAINT chk_sales_total
        CHECK (total_amount >= 0)
);


-- =========================================================
-- PAYMENT
-- =========================================================

CREATE TABLE payment (
    payment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payment_type VARCHAR(20) NOT NULL,
    sale_id INTEGER,
    purchase_order_id INTEGER,
    payment_method VARCHAR(30) NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reference_no VARCHAR(50),
    remarks VARCHAR(255),

    CONSTRAINT fk_payment_sale
        FOREIGN KEY (sale_id)
        REFERENCES sales(sale_id),

    CONSTRAINT chk_payment_type
        CHECK (
            payment_type IN (
                'Sale',
                'Purchase'
            )
        ),

    CONSTRAINT chk_payment_method
        CHECK (
            payment_method IN (
                'Cash',
                'GCash',
                'Cheque',
                'Bank Transfer',
                'Credit'
            )
        ),

    CONSTRAINT chk_payment_amount
        CHECK (amount_paid > 0),

    CONSTRAINT chk_payment_reference
        CHECK (
            (payment_type = 'Sale' AND sale_id IS NOT NULL AND purchase_order_id IS NULL)
            OR
            (payment_type = 'Purchase' AND purchase_order_id IS NOT NULL AND sale_id IS NULL)
        )
);


-- =========================================================
-- DELIVERY
-- =========================================================

CREATE TABLE delivery (
    delivery_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sale_id INTEGER NOT NULL UNIQUE,
    dr_no VARCHAR(50) NOT NULL UNIQUE,
    delivery_date TIMESTAMP,
    delivered_by_user_id INTEGER,
    delivery_charge DECIMAL(12,2) NOT NULL DEFAULT 0,
    delivery_address VARCHAR(255) NOT NULL,
    delivery_status VARCHAR(30) NOT NULL,
    remarks VARCHAR(255),

    CONSTRAINT fk_delivery_sale
        FOREIGN KEY (sale_id)
        REFERENCES sales(sale_id),

    CONSTRAINT fk_delivery_user
        FOREIGN KEY (delivered_by_user_id)
        REFERENCES app_user(user_id),

    CONSTRAINT chk_delivery_charge
        CHECK (delivery_charge >= 0),

    CONSTRAINT chk_delivery_status
        CHECK (
            delivery_status IN (
                'Pending',
                'Out for Delivery',
                'Delivered',
                'Cancelled'
            )
        )
);


-- =========================================================
-- RESTOCK RECOMMENDATION
-- =========================================================

CREATE TABLE restock_recommendation (
    restock_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id INTEGER NOT NULL,
    supplier_id INTEGER NOT NULL,
    predicted_demand INTEGER NOT NULL,
    recommended_quantity INTEGER NOT NULL,
    forecast_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_restock_product
        FOREIGN KEY (product_id)
        REFERENCES product(product_id),

    CONSTRAINT fk_restock_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES supplier(supplier_id),

    CONSTRAINT chk_predicted_demand
        CHECK (predicted_demand >= 0),

    CONSTRAINT chk_recommended_quantity
        CHECK (recommended_quantity >= 0),

    CONSTRAINT chk_restock_status
        CHECK (
            status IN (
                'Pending',
                'Approved',
                'Rejected',
                'Converted'
            )
        )
);


-- =========================================================
-- PURCHASE ORDER
-- =========================================================

CREATE TABLE purchase_order (
    purchase_order_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    supplier_id INTEGER NOT NULL,
    restock_id INTEGER,
    created_by_user_id INTEGER NOT NULL,
    po_no VARCHAR(50) NOT NULL UNIQUE,
    order_date TIMESTAMP NOT NULL,
    expected_delivery_date DATE,
    status VARCHAR(30) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    remarks VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_po_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES supplier(supplier_id),

    CONSTRAINT fk_po_restock
        FOREIGN KEY (restock_id)
        REFERENCES restock_recommendation(restock_id),

    CONSTRAINT fk_po_user
        FOREIGN KEY (created_by_user_id)
        REFERENCES app_user(user_id),

    CONSTRAINT chk_po_status
        CHECK (
            status IN (
                'Pending',
                'Approved',
                'Received',
                'Cancelled'
            )
        ),

    CONSTRAINT chk_po_total
        CHECK (total_amount >= 0)
);


-- =========================================================
-- PURCHASE ORDER ITEM
-- =========================================================

CREATE TABLE purchase_order_item (
    purchase_order_item_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    purchase_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,

    CONSTRAINT fk_po_item_po
        FOREIGN KEY (purchase_order_id)
        REFERENCES purchase_order(purchase_order_id),

    CONSTRAINT fk_po_item_product
        FOREIGN KEY (product_id)
        REFERENCES product(product_id),

    CONSTRAINT chk_po_item_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_po_item_unit_cost
        CHECK (unit_cost >= 0),

    CONSTRAINT chk_po_item_subtotal
        CHECK (subtotal >= 0)
);


-- =========================================================
-- DATA ACTIVITY LOG
-- =========================================================

CREATE TABLE data_activity_log (
    data_activity_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    activity_type VARCHAR(30) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_format VARCHAR(20) NOT NULL,
    date_from DATE,
    date_to DATE,
    status VARCHAR(20) NOT NULL,
    activity_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_data_activity_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(user_id),

    CONSTRAINT chk_data_activity_type
        CHECK (
            activity_type IN (
                'Import',
                'Export',
                'Generate Report'
            )
        ),

    CONSTRAINT chk_data_activity_status
        CHECK (
            status IN (
                'Successful',
                'Failed'
            )
        )
);


-- =========================================================
-- USER ACTIVITY
-- =========================================================

CREATE TABLE user_activity (
    user_activity_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    activity_type VARCHAR(30) NOT NULL,
    module VARCHAR(50) NOT NULL,
    record_id INTEGER,
    description VARCHAR(500),
    activity_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_activity_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(user_id),

    CONSTRAINT chk_user_activity_type
        CHECK (
            activity_type IN (
                'Login',
                'Logout',
                'Create',
                'Update',
                'Delete',
                'Approve'
            )
        )
);