import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { useCart } from '../CartContext';
import { useToast } from '../Toast';

const CATEGORY_IMAGES = {
    Electronics: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    Footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    Clothing: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
    Accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
};

const CATEGORY_EMOJI = { Electronics: '💻', Footwear: '👟', Clothing: '👕', Accessories: '⌚' };

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgErr, setImgErr] = useState(false);
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [added, setAdded] = useState(false);

    useEffect(() => {
        setLoading(true);
        setImgErr(false);
        API.get(`/api/products/${id}`)
            .then((res) => setProduct(res.data))
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAdd = () => {
        if (!product) return;
        addToCart(product);
        showToast(`"${product.name}" added to cart`, 'success');
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    if (loading) {
        return (
            <div className="loading-wrap">
                <div className="spinner" />
                <span style={{ color: 'var(--muted)' }}>Loading product…</span>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '60px 24px', marginTop: 32 }}>
                <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.4 }}>🔍</div>
                <h2 style={{ marginBottom: 8 }}>Product not found</h2>
                <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
                    This product may have been removed or doesn't exist.
                </p>
                <Link to="/"><button className="btn-primary">← Back to Products</button></Link>
            </div>
        );
    }

    const imgSrc = CATEGORY_IMAGES[product.category];

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <button className="btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
            </div>

            <div className="product-detail">
                {/* Image panel */}
                <div className="pd-image-wrap">
                    {imgSrc && !imgErr ? (
                        <img src={imgSrc} alt={product.name} onError={() => setImgErr(true)} />
                    ) : (
                        <div className="pd-img-placeholder">
                            {CATEGORY_EMOJI[product.category] || '📦'}
                        </div>
                    )}
                </div>

                {/* Info panel */}
                <div className="pd-info">
                    <span className="category-tag">{product.category}</span>
                    <h1>{product.name}</h1>
                    <p className="pd-desc">{product.description}</p>

                    <div className="pd-price">Rs. {parseFloat(product.price).toFixed(2)}</div>

                    <div style={{ marginBottom: 24 }}>
                        <span className={`stock-badge ${product.stock > 0 ? 'in' : 'out'}`}>
                            {product.stock > 0 ? `✅ ${product.stock} in stock` : '❌ Out of stock'}
                        </span>
                    </div>

                    <div className="pd-actions">
                        <button
                            className={added ? 'btn-success btn-lg' : 'btn-primary btn-lg'}
                            onClick={handleAdd}
                            disabled={product.stock === 0}
                            style={{ flex: 1 }}
                        >
                            {added ? '✅ Added to Cart!' : '＋ Add to Cart'}
                        </button>
                        <Link to="/cart">
                            <button className="btn-ghost btn-lg">🛒 View Cart</button>
                        </Link>
                    </div>

                    <div className="divider" style={{ marginTop: 28 }} />
                    <div className="pd-meta">
                        <div className="pd-meta-row"><span>SKU</span><span>#{product.id}</span></div>
                        <div className="pd-meta-row"><span>Category</span><span>{product.category}</span></div>
                        <div className="pd-meta-row"><span>Availability</span>
                            <span style={{ color: product.stock > 0 ? 'var(--green)' : 'var(--red)' }}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
