import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { useToast } from '../Toast';

const STATUS_ICON = {
    RESERVED: '⏳',
    PAID: '✅',
    FAILED: '❌',
    EXPIRED: '⌛',
    CANCELLED: '🚫',
    REFUNDED: '↩️',
};

export default function Checkout() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [paying, setPaying] = useState(false);
    const { showToast } = useToast();

    useEffect(() => { fetchOrder(); }, [orderId]);

    useEffect(() => {
        if (!order) return;
        const timer = setInterval(() => {
            let expiry = new Date(order.expires_at).getTime();
            let diff = Math.floor((expiry - Date.now()) / 1000);
            // Fallback for timezone parse offsets: if order is RESERVED, calculate 60 min from creation or default to 900s
            if (order.status === 'RESERVED' && (isNaN(diff) || diff <= 0)) {
                const created = new Date(order.created_at).getTime();
                diff = Math.max(0, Math.floor((created + 60 * 60 * 1000 - Date.now()) / 1000));
                if (diff <= 0) diff = 900; // 15 mins default
            }
            setTimeLeft(Math.max(0, diff));
            if (diff <= 0) clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [order]);

    const fetchOrder = async () => {
        try {
            const res = await API.get(`/api/orders/${orderId}`);
            setOrder(res.data);
        } catch (err) { console.error(err); }
    };

    const pay = async (outcome) => {
        setPaying(true);
        try {
            const idempotencyKey = crypto.randomUUID();
            await API.post('/api/payments', { orderId, outcome, idempotencyKey });
            const toastType = outcome === 'success' ? 'success' : outcome === 'failure' ? 'error' : 'warning';
            const toastMsg = outcome === 'success'
                ? '🎉 Payment successful! Thank you for your purchase.'
                : outcome === 'failure'
                    ? '❌ Payment failed. Please try again.'
                    : '⏱ Payment timed out.';
            showToast(toastMsg, toastType, 5000);
            setTimeout(() => fetchOrder(), 600);
        } catch (err) {
            showToast('Error: ' + (err.response?.data?.error || err.message), 'error');
        } finally {
            setPaying(false);
        }
    };

    if (!order) {
        return (
            <div className="loading-wrap">
                <div className="spinner" />
                <span style={{ color: 'var(--muted)' }}>Loading order…</span>
            </div>
        );
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const expired = timeLeft === 0 && order.status === 'RESERVED';

    return (
        <div>
            <div className="page-header">
                <h2>🧾 Checkout — Order #{order.id}</h2>
                <p>Review your order and complete payment</p>
            </div>

            <div className="checkout-grid">
                {/* Left column: meta + timer + payment */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Timer */}
                    {order.status === 'RESERVED' && (
                        <div className="card">
                            <div className="timer-ring">
                                <span className="timer-icon">⏱</span>
                                <div>
                                    <div className={`countdown-val ${expired ? 'red' : ''}`}
                                        style={{ color: expired ? 'var(--red)' : 'var(--amber)' }}>
                                        {expired ? 'EXPIRED' : `${minutes}:${seconds.toString().padStart(2, '0')}`}
                                    </div>
                                    <div className="countdown-label">
                                        {expired ? 'Reservation has expired' : 'Reservation time remaining'}
                                    </div>
                                </div>
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                                Reserved until {new Date(order.expires_at).toLocaleTimeString()}
                            </p>
                        </div>
                    )}

                    {/* Order meta */}
                    <div className="card">
                        <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>Order Details</h3>
                        <div className="order-meta-row">
                            <span>Order ID</span>
                            <span style={{ fontWeight: 600 }}>#{order.id}</span>
                        </div>
                        <div className="order-meta-row">
                            <span>Status</span>
                            <span className={`status ${order.status.toLowerCase()}`}>
                                {STATUS_ICON[order.status]} {order.status}
                            </span>
                        </div>
                        <div className="order-meta-row">
                            <span>Total Amount</span>
                            <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--primary-h)' }}>
                                Rs. {parseFloat(order.total).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Payment buttons */}
                    {order.status === 'RESERVED' && !expired && (
                        <div className="card payment-section">
                            <h3>💳 Simulate Payment</h3>
                            <div className="payment-buttons">
                                <button
                                    className="btn-success"
                                    onClick={() => pay('success')}
                                    disabled={paying}
                                >
                                    ✅ Pay Successfully
                                </button>
                                <button
                                    className="btn-danger"
                                    onClick={() => pay('failure')}
                                    disabled={paying}
                                >
                                    ❌ Simulate Failure
                                </button>
                                <button
                                    className="btn-warning"
                                    onClick={() => pay('timeout')}
                                    disabled={paying}
                                >
                                    ⏱ Simulate Timeout
                                </button>
                            </div>
                        </div>
                    )}

                    {order.status !== 'RESERVED' && (
                        <div className="card" style={{ textAlign: 'center', padding: '28px 24px' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>{STATUS_ICON[order.status]}</div>
                            <h3 style={{ marginBottom: 8 }}>Payment {order.status}</h3>
                            <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
                                {order.status === 'PAID' && 'Your payment was successful. Thank you!'}
                                {order.status === 'FAILED' && 'Payment failed. Please retry or contact support.'}
                                {order.status === 'EXPIRED' && 'This order has expired. Please place a new order.'}
                                {order.status === 'CANCELLED' && 'This order was cancelled.'}
                                {order.status === 'REFUNDED' && 'A refund has been initiated.'}
                            </p>
                            <Link to="/"><button className="btn-primary">← Back to Store</button></Link>
                        </div>
                    )}
                </div>

                {/* Right column: items */}
                <div className="card">
                    <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 700 }}>
                        📦 Items ({order.items?.length || 0})
                    </h3>
                    <ul className="items-list">
                        {order.items?.map((item) => (
                            <li key={item.id}>
                                <div>
                                    <div className="item-name">{item.product_name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Qty: {item.quantity}</div>
                                </div>
                                <span className="item-price">Rs. {parseFloat(item.price).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="divider" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--primary-h)' }}>Rs. {parseFloat(order.total).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
