const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();

// تمكين CORS للتواصل بين الواجهة الأمامية والخلفية
app.use(cors());
app.use(express.json());

// تهيئة multer لتخزين الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// إنشاء مجلد التحميلات إذا لم يكن موجوداً
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// خدمة الملفات الثابتة
app.use('/uploads', express.static('uploads'));

// نقطة النهاية لرفع الملفات
app.post('/upload', upload.array('files'), (req, res) => {
  try {
    const uploadedFiles = req.files.map(file => {
      return {
        id: file.filename,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`
      };
    });
    
    res.json({ success: true, files: uploadedFiles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// نقطة النهاية لجلب الملفات
app.get('/files', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan files' });
    }
    
    const fileList = files.map(file => {
      return {
        name: file,
        url: `/uploads/${file}`
      };
    });
    
    res.json(fileList);
  });
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
