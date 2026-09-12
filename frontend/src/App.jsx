import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import ProductDetails from './pages/ProductDetails';
import { useCart } from './CartContext';

function App() {
    const { cart } = useCart();
    const location = useLocation();

    const navLink = (to, label, icon) => {
        const active = location.pathname === to;
        return (
            <Link
                to={to}
                style={{
                    color: active ? 'var(--text)' : 'var(--muted)',
                    background: active ? 'var(--surface2)' : 'transparent',
                }}
            >
                {icon} {label}
            </Link>
        );
    };

    return (
        <div className="app">
            <nav className="navbar">
                <Link to="/" className="logo">
                    <div className="logo-icon">🛒</div>
                    <span>Techloom POS</span>
                </Link>
                <div className="nav-links">
                    {navLink('/', 'Products', '🏪')}
                    {navLink('/orders', 'Orders', '📋')}
                    <Link to="/cart" className="cart-link">
                        🛒 Cart
                        {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                    </Link>
                </div>
            </nav>

            <div className="container">
                <Routes>
                    <Route path="/" element={<Products />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout/:orderId" element={<Checkout />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
