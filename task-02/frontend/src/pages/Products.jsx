import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useCart } from '../CartContext';
import { useToast } from '../Toast';

const CATEGORY_IMAGES = {
    Electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    Footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
    Clothing: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
    Accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80';

function ProductImage({ product }) {
    const [imgSrc, setImgSrc] = useState(
        CATEGORY_IMAGES[product.category] || DEFAULT_IMAGE
    );
    const [errored, setErrored] = useState(false);

    return (
        <div className="product-img-wrap">
            {!errored ? (
                <img
                    src={imgSrc}
                    alt={product.name}
                    onError={() => {
                        setErrored(true);
                    }}
                />
            ) : (
                <div className="product-img-placeholder">
                    {product.category === 'Electronics' ? '🎧' :
                        product.category === 'Footwear' ? '👟' :
                            product.category === 'Clothing' ? '👕' : '⌚'}
                </div>
            )}
        </div>
    );
}

export default function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [inStock, setInStock] = useState(false);
    const [loading, setLoading] = useState(true);

    const { addToCart } = useCart();
    const { showToast } = useToast();

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (inStock) params.append('inStock', 'true');

        API.get(`/api/products?${params.toString()}`)
            .then((res) => setProducts(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [search, category, maxPrice, inStock]);

    const handleAdd = (p) => {
        addToCart(p);
        showToast(`"${p.name}" added to cart`, 'success');
    };

    return (
        <div>
            <div className="page-header">
                <h2>🏪 Store Products</h2>
                <p>{products.length} item{products.length !== 1 ? 's' : ''} found</p>
            </div>

            <div className="filters">
                <input
                    className="search-input"
                    type="text"
                    placeholder="🔍  Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    <option value="Electronics">💻 Electronics</option>
                    <option value="Footwear">👟 Footwear</option>
                    <option value="Clothing">👕 Clothing</option>
                    <option value="Accessories">⌚ Accessories</option>
                </select>
                <input
                    type="number"
                    placeholder="Max price (Rs.)"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={{ width: 150 }}
                />
                <label className="filter-label">
                    <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                    />
                    In stock only
                </label>
            </div>

            {loading ? (
                <div className="loading-wrap">
                    <div className="spinner" />
                    <span style={{ color: 'var(--muted)' }}>Loading products…</span>
                </div>
            ) : products.length === 0 ? (
                <div className="loading-wrap">
                    <div style={{ fontSize: 48, opacity: 0.4 }}>🔍</div>
                    <p style={{ color: 'var(--muted)' }}>No products match your filters.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map((p) => (
                        <div key={p.id} className="product-card">
                            <ProductImage product={p} />
                            <div className="product-body">
                                <span className="category-tag">{p.category}</span>
                                <h3><Link to={`/product/${p.id}`} className="product-name-link">{p.name}</Link></h3>
                                <p className="desc">{p.description}</p>
                                <div className="product-footer">
                                    <span className="price-tag">Rs. {p.price}</span>
                                    <span className={`stock-badge ${p.stock > 0 ? 'in' : 'out'}`}>
                                        {p.stock > 0 ? `${p.stock} left` : 'Sold out'}
                                    </span>
                                </div>
                                <button
                                    className="btn-add"
                                    onClick={() => handleAdd(p)}
                                    disabled={p.stock === 0}
                                >
                                    {p.stock === 0 ? 'Out of Stock' : '＋ Add to Cart'}
                                </button>
                                <Link to={`/product/${p.id}`} style={{ display: 'block', marginTop: 6 }}>
                                    <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                                        🔍 View Details
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
