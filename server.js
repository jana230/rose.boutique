const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

let storeSettings = {
  logoText: 'ROSE.BOUTIQUE',
  logoUrl: ''
};

let products = [
  { id: 1, name: 'Sabrina', price: 220, badge: 'ECO', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Brielle', price: 200, badge: 'ECO', img: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Naomi', price: 235, badge: 'ECO', img: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80' }
];

let reviews = [
  { id: 1, name: 'سارة أحمد', rating: 5, comment: 'الشنطة تحفة والجودة خيالية بجد!' },
  { id: 2, name: 'مريم علي', rating: 5, comment: 'التصميم مودرن جداً والتغليف راقي أوي.' }
];

let videos = [
  { id: 1, title: 'Unboxing Sabrina Bag ✨', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
];

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let role = 'user';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === 'admin-secret-token') role = 'admin';
  }
  req.user = { role };
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else return res.status(403).json({ success: false, message: 'مقتصر على الأدمن فقط!' });
};

// --- API اللوجو والبراند ---
app.get('/api/settings', (req, res) => res.json({ success: true, data: storeSettings }));

app.put('/api/settings/logo', verifyToken, adminOnly, (req, res) => {
  const { logoUrl, logoText } = req.body;
  if (logoUrl !== undefined) storeSettings.logoUrl = logoUrl;
  if (logoText) storeSettings.logoText = logoText;
  res.json({ success: true, message: 'تم تحديث لوجو البراند بنجاح', data: storeSettings });
});

// --- API المنتجات ---
app.get('/api/products', (req, res) => res.json({ success: true, data: products }));

app.post('/api/products', verifyToken, adminOnly, (req, res) => {
  const { name, price, badge, img } = req.body;
  const newProduct = { id: Date.now(), name, price: Number(price), badge: badge || 'NEW', img: img || 'https://via.placeholder.com/300' };
  products.push(newProduct);
  res.status(201).json({ success: true, message: 'تمت إضافة المنتج بنجاح', data: newProduct });
});

app.put('/api/products/:id', verifyToken, adminOnly, (req, res) => {
  const productId = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === productId);
  if (index === -1) return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
  products[index] = { ...products[index], ...req.body };
  res.json({ success: true, message: 'تم تحديث المنتج بنجاح', data: products[index] });
});

app.delete('/api/products/:id', verifyToken, adminOnly, (req, res) => {
  products = products.filter(p => p.id !== parseInt(req.params.id));
  res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
});

// --- API التقييمات ---
app.get('/api/reviews', (req, res) => res.json({ success: true, data: reviews }));

app.post('/api/reviews', (req, res) => {
  const { name, rating, comment } = req.body;
  if (!name || !comment) return res.status(400).json({ success: false, message: 'جميع البيانات مطلوبة' });
  const newReview = { id: Date.now(), name, rating: Number(rating) || 5, comment };
  reviews.unshift(newReview);
  res.status(201).json({ success: true, message: 'شكراً لتقييمك!', data: newReview });
});

app.delete('/api/reviews/:id', verifyToken, adminOnly, (req, res) => {
  reviews = reviews.filter(r => r.id !== parseInt(req.params.id));
  res.json({ success: true, message: 'تم حذف التقييم بنجاح' });
});

// --- API الفيديوهات ---
app.get('/api/videos', (req, res) => res.json({ success: true, data: videos }));

app.post('/api/videos', verifyToken, adminOnly, (req, res) => {
  const { title, videoUrl } = req.body;
  if (!videoUrl) return res.status(400).json({ success: false, message: 'الفيديو مطلوب' });
  const newVideo = { id: Date.now(), title: title || 'فيديو جديد', videoUrl };
  videos.unshift(newVideo);
  res.status(201).json({ success: true, message: 'تم إضافة الفيديو بنجاح', data: newVideo });
});

app.delete('/api/videos/:id', verifyToken, adminOnly, (req, res) => {
  videos = videos.filter(v => v.id !== parseInt(req.params.id));
  res.json({ success: true, message: 'تم حذف الفيديو بنجاح' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));