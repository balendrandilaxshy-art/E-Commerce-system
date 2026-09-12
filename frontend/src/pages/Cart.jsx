import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useToast } from '../Toast';
import API from '../api';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const subtotal = cart.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity, 0
    );
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        const idempotencyKey = crypto.randomUUID();
        const items = cart.map((item) => ({ productId: item.id, quantity: item.quantity }));
        try {
            const res = await API.post('/api/checkout', { items, idempotencyKey });
            clearCart();
            showToast('Order placed! Proceed to payment.', 'success');
            navigate(`/checkout/${res.data.orderId}`);
        } catch (err) {
            showToast('Checkout failed: ' + (err.response?.data?.error || err.message), 'error');
        }
    };

    const handleRemove = (item) => {
        removeFromCart(item.id);
        showToast(`"${item.name}" removed from cart`, 'info');
    };

    if (cart.length === 0) {
        return (
            <div>
                <div className="page-header">
                    <h2>🛒 Your Cart</h2>
                </div>
                <div className="empty-cart card">
                    <div className="empty-icon">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Browse our store and add some products!</p>
                    <Link to="/"><button className="btn-primary btn-lg">Browse Products</button></Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h2>🛒 Your Cart</h2>
                <p>{cart.length} item{cart.length !== 1 ? 's' : ''} in cart</p>
            </div>

            <div className="cart-layout">
                {/* Items table */}
                <div className="cart-table-wrap">
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Unit Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.category}</div>
                                    </td>
                                    <td>Rs. {parseFloat(item.price).toFixed(2)}</td>
                                    <td>
                                        <div className="qty-control">
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >−</button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >+</button>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>
                                        Rs. {(parseFloat(item.price) * item.quantity).toFixed(2)}
                                    </td>
                                    <td>
                                        <button
                                            className="btn-danger btn-sm"
                                            onClick={() => handleRemove(item)}
                                        >🗑 Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary sidebar */}
                <div className="cart-summary-card">
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Tax (5%)</span>
                        <span>Rs. {tax.toFixed(2)}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>Rs. {total.toFixed(2)}</span>
                    </div>
                    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <button className="btn-success btn-lg" onClick={handleCheckout}>
                            ✅ Proceed to Checkout
                        </button>
                        <Link to="/"><button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>← Continue Shopping</button></Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
