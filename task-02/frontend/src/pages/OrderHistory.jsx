import { useEffect, useState } from 'react';
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

const STATUS_DESC = {
    RESERVED: 'Payment pending — stock is reserved for this order.',
    PAID: 'Payment completed successfully. Eligible for cancellation & refund.',
    FAILED: 'Payment failed. Stock was automatically released.',
    EXPIRED: 'Reservation expired before payment was made.',
    CANCELLED: 'Order cancelled. Stock has been restored.',
    REFUNDED: 'Refund has been processed for this order.',
};

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const { showToast } = useToast();

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await API.get('/api/orders');
            setOrders(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const viewOrder = async (id) => {
        try {
            const res = await API.get(`/api/orders/${id}`);
            setSelectedOrder(res.data);
        } catch (err) { console.error(err); }
    };

    const cancelOrder = async (id, status) => {
        const action = status === 'PAID' ? 'cancel and refund' : 'cancel';
        if (!window.confirm(`Are you sure you want to ${action} this order?`)) return;
        setCancelling(true);
        try {
            await API.post(`/api/orders/${id}/cancel`);
            const msg = status === 'PAID'
                ? '↩️ Order refunded and stock restored.'
                : '🚫 Order cancelled and stock restored.';
            showToast(msg, 'success');
            await fetchOrders();
            setSelectedOrder(null);
        } catch (err) {
            showToast('Error: ' + (err.response?.data?.error || err.message), 'error');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2>📋 Order History</h2>
                    <p>{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
                </div>
                <button className="btn-ghost btn-sm" onClick={fetchOrders} disabled={loading}>
                    🔄 Refresh
                </button>
            </div>

            {loading ? (
                <div className="loading-wrap">
                    <div className="spinner" />
                    <span style={{ color: 'var(--muted)' }}>Loading orders…</span>
                </div>
            ) : orders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.4 }}>📋</div>
                    <h3 style={{ marginBottom: 8 }}>No orders yet</h3>
                    <p style={{ color: 'var(--muted)' }}>Your order history will appear here once you place orders.</p>
                </div>
            ) : (
                <div className="orders-table-wrap">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date &amp; Time</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr
                                    key={o.id}
                                    style={{
                                        background: selectedOrder?.id === o.id ? 'var(--surface2)' : undefined,
                                    }}
                                >
                                    <td style={{ fontWeight: 700 }}>#{o.id}</td>
                                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                                        {new Date(o.created_at).toLocaleString()}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>Rs. {parseFloat(o.total).toFixed(2)}</td>
                                    <td>
                                        <span className={`status ${o.status.toLowerCase()}`}>
                                            {STATUS_ICON[o.status]} {o.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className="btn-ghost btn-sm"
                                            onClick={() => selectedOrder?.id === o.id ? setSelectedOrder(null) : viewOrder(o.id)}
                                        >
                                            {selectedOrder?.id === o.id ? '✕ Hide' : '🔍 View'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrder && (
                <div className="order-detail-card">
                    <div className="order-detail-header">
                        <h3>
                            {STATUS_ICON[selectedOrder.status]}&nbsp;Order #{selectedOrder.id} Details
                        </h3>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <span className={`status ${selectedOrder.status.toLowerCase()}`}>
                                {selectedOrder.status}
                            </span>
                            <button
                                className="btn-ghost btn-sm"
                                onClick={() => setSelectedOrder(null)}
                            >✕ Close</button>
                        </div>
                    </div>

                    {/* Status description */}
                    <p style={{ fontSize: 13, color: 'var(--muted)', margin: '8px 0 16px' }}>
                        {STATUS_DESC[selectedOrder.status]}
                    </p>

                    <div className="divider" />

                    {/* Items */}
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 10px' }}>
                        Order Items
                    </h4>
                    <ul className="items-list" style={{ marginBottom: 16 }}>
                        {selectedOrder.items?.map((item) => (
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>
                            Total:&nbsp;
                            <span style={{ color: 'var(--primary-h)' }}>
                                Rs. {parseFloat(selectedOrder.total).toFixed(2)}
                            </span>
                        </div>

                        {/* Cancel (RESERVED) or Cancel+Refund (PAID) */}
                        {selectedOrder.status === 'RESERVED' && (
                            <button
                                className="btn-warning"
                                onClick={() => cancelOrder(selectedOrder.id, selectedOrder.status)}
                                disabled={cancelling}
                            >
                                {cancelling ? '…Cancelling' : '🚫 Cancel Order'}
                            </button>
                        )}
                        {selectedOrder.status === 'PAID' && (
                            <button
                                className="btn-danger"
                                onClick={() => cancelOrder(selectedOrder.id, selectedOrder.status)}
                                disabled={cancelling}
                            >
                                {cancelling ? '…Processing' : '↩️ Cancel & Refund'}
                            </button>
                        )}

                        {/* Indicate refund/cancel done */}
                        {selectedOrder.status === 'REFUNDED' && (
                            <span style={{ color: '#a5b4fc', fontWeight: 600, fontSize: 13 }}>↩️ Refund processed</span>
                        )}
                        {selectedOrder.status === 'CANCELLED' && (
                            <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13 }}>🚫 Cancelled — stock restored</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

