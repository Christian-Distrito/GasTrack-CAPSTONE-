import React, { useMemo, useState } from "react";
import { Search, ChevronDown, ShoppingCart, ImageOff, Wallet, Minus, Plus, X } from "lucide-react";
import PaymentModal from "./PaymentModal";
import "./PosTerminal.css";

// ---------------------------------------------------------------------------
// Mock product catalog — replace with real data / API call
// ---------------------------------------------------------------------------

const products = [
  { id: "p1", category: "Gasul", name: "Gasul LPG 2.7kg", stock: 5, price: 249.0 },
  { id: "p2", category: "Gasul", name: "Gasul LPG 7kg", stock: 20, price: 603.0 },
  { id: "p3", category: "Gasul", name: "Gasul LPG 11kg", stock: 10, price: 907.0 },
  { id: "p4", category: "Cylinder", name: "Cylinder 2.7kg", stock: 10, price: 1000.0 },
  { id: "p5", category: "Cylinder", name: "Cylinder 7kg", stock: 25, price: 1800.0 },
  { id: "p6", category: "Cylinder", name: "Cylinder 22kg", stock: 25, price: 3800.0 },
];

const categories = ["All Categories", ...new Set(products.map((p) => p.category))];

const discountOptions = [
  { label: "No Discount", value: 0 },
  { label: "Senior/PWD (5%)", value: 0.05 },
  { label: "Member (10%)", value: 0.1 },
];

const paymentMethods = ["Cash", "GCash", "Card", "Bank Transfer"];
const customerTypes = ["Walk-in", "Regular Customer", "Business Account"];

const VAT_RATE = 0.12;

function formatPeso(amount) {
  return `₱${amount.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Product card
// ---------------------------------------------------------------------------

function ProductCard({ product, onAdd }) {
  return (
    <button type="button" className="product-card" onClick={() => onAdd(product)}>
      <span className="product-category">{product.category}</span>
      <div className="product-image">
        <ImageOff size={28} strokeWidth={1.5} />
      </div>
      <p className="product-name">{product.name}</p>
      <p className="product-stock">Stock: {product.stock}</p>
      <p className="product-price">{formatPeso(product.price)}</p>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Cart line item
// ---------------------------------------------------------------------------

function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <p className="cart-item-name">{item.name}</p>
        <p className="cart-item-price">{formatPeso(item.price)} each</p>
      </div>
      <div className="cart-item-controls">
        <button type="button" className="qty-btn" onClick={() => onDecrement(item.id)} aria-label="Decrease quantity">
          <Minus size={14} />
        </button>
        <span className="qty-value">{item.qty}</span>
        <button type="button" className="qty-btn" onClick={() => onIncrement(item.id)} aria-label="Increase quantity">
          <Plus size={14} />
        </button>
      </div>
      <span className="cart-item-total">{formatPeso(item.price * item.qty)}</span>
      <button type="button" className="cart-item-remove" onClick={() => onRemove(item.id)} aria-label="Remove item">
        <X size={14} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main POS Terminal component
// ---------------------------------------------------------------------------

export default function PosTerminal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [cart, setCart] = useState([]);
  const [discountValue, setDiscountValue] = useState(0);
  const [customerType, setCustomerType] = useState("Walk-in");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === "All Categories" || p.category === category;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, category]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const incrementItem = (id) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)));
  };

  const decrementItem = (id) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const holdCart = () => {
    // Hook this up to your "held orders" storage / API as needed
    console.log("Order held:", cart);
  };

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
  const discount = subtotal * discountValue;
  const vat = (subtotal - discount) * VAT_RATE;
  const total = subtotal - discount + vat;

  const handlePay = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = ({ amountCollected, changeDue, printReceipt }) => {
    // Hook this up to your checkout / payment API
    console.log("Processing payment", {
      cart,
      customerType,
      discountValue,
      paymentMethod,
      total,
      amountCollected,
      changeDue,
      printReceipt,
    });
    setShowPaymentModal(false);
    clearCart();
  };

  return (
    <div className="pos">
      <div className="pos-inner">
        <h1 className="pos-title">POS Terminal</h1>

        {/* Tabs */}
        <div className="pos-tabs">
          <span className="pos-tab active">Cart</span>
        </div>

        <div className="pos-layout">
          {/* Left: product browser */}
          <div className="pos-main">
            <div className="pos-toolbar">
              <div className="pos-search">
                <Search size={16} className="pos-search-icon" />
                <input
                  type="text"
                  placeholder="Search Product"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pos-search-input"
                />
              </div>
              <div className="pos-select-wrap">
                <select
                  className="pos-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pos-select-icon" />
              </div>
            </div>

            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
              {filteredProducts.length === 0 && (
                <p className="no-results">No products match your search.</p>
              )}
            </div>
          </div>

          {/* Right: cart + checkout */}
          <div className="pos-sidebar">
            {/* Cart Summary */}
            <div className="pos-panel">
              <div className="pos-panel-header">
                <ShoppingCart size={16} />
                <span>Cart Summary</span>
              </div>
              <div className="pos-panel-body">
                <div className="cart-actions">
                  <button type="button" className="cart-action-btn" onClick={holdCart}>
                    Hold
                  </button>
                  <button type="button" className="cart-action-btn" onClick={clearCart}>
                    Clear
                  </button>
                </div>

                <div className="cart-items">
                  {cart.length === 0 ? (
                    <p className="cart-empty">Cart is empty. Tap a product to add it.</p>
                  ) : (
                    cart.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onIncrement={incrementItem}
                        onDecrement={decrementItem}
                        onRemove={removeItem}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Checkout */}
            <div className="pos-panel">
              <div className="pos-panel-header">
                <Wallet size={16} />
                <span>Checkout</span>
              </div>
              <div className="pos-panel-body">
                <div className="pos-select-wrap full-width">
                  <select
                    className="pos-select"
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                  >
                    {customerTypes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pos-select-icon" />
                </div>

                <div className="checkout-row-selects">
                  <div className="pos-select-wrap">
                    <select
                      className="pos-select"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                    >
                      {discountOptions.map((d) => (
                        <option key={d.label} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pos-select-icon" />
                  </div>

                  <div className="pos-select-wrap">
                    <select
                      className="pos-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="">Select Payment Method</option>
                      {paymentMethods.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pos-select-icon" />
                  </div>
                </div>

                <div className="checkout-summary">
                  <div className="checkout-line">
                    <span>Subtotal:</span>
                    <span>{formatPeso(subtotal)}</span>
                  </div>
                  <div className="checkout-line">
                    <span>Discount:</span>
                    <span>{formatPeso(discount)}</span>
                  </div>
                  <div className="checkout-line">
                    <span>VAT (12%):</span>
                    <span>{formatPeso(vat)}</span>
                  </div>
                  <div className="checkout-line checkout-total">
                    <span>Total</span>
                    <span>{formatPeso(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="pay-btn"
                  onClick={handlePay}
                  disabled={cart.length === 0}
                >
                  Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        totalAmount={total}
        onCancel={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}