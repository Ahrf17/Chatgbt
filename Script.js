document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const progressBar = document.getElementById('progressBar');
    const fileGallery = document.getElementById('fileGallery');
    
    // جلب الملفات عند تحميل الصفحة
    fetchFiles();
    
    // معالجة رفع الملفات
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if(fileInput.files.length === 0) {
            alert('الرجاء اختيار ملف واحد على الأقل');
            return;
        }
        
        progressBar.style.display = 'block';
        
        try {
            const formData = new FormData();
            for(let i = 0; i < fileInput.files.length; i++) {
                formData.append('files', fileInput.files[i]);
            }
            
            const response = await fetch('https://your-app-name.herokuapp.com/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if(result.success) {
                alert('تم رفع الملفات بنجاح');
                updateGallery(result.files);
            } else {
                alert('حدث خطأ أثناء رفع الملفات');
            }
        } catch(error) {
            console.error('Error:', error);
            alert('حدث خطأ أثناء رفع الملفات');
        } finally {
            progressBar.style.display = 'none';
            fileInput.value = '';
        }
    });
    
    // جلب الملفات من الخادم
    async function fetchFiles() {
        try {
            const response = await fetch('https://your-app-name.herokuapp.com/files');
            const files = await response.json();
            
            if(files && files.length > 0) {
                updateGallery(files);
            }
        } catch(error) {
            console.error('Error fetching files:', error);
        }
    }
    
    // تحديث معرض الملفات
    function updateGallery(files) {
        fileGallery.innerHTML = '';
        
        files.forEach(file => {
            const fileItem = createFileItem(file);
            fileGallery.appendChild(fileItem);
        });
    }
    
    // إنشاء عنصر ملف للعرض
    function createFileItem(file) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.dataset.id = file.name;
        
        const isImage = file.type ? file.type.startsWith('image/') : 
                        file.name.match(/\.(jpg|jpeg|png|gif)$/i);
        
        if(isImage) {
            item.innerHTML = `
                <img src="${file.url}" alt="${file.name}">
                <div class="file-name">${file.name}</div>
            `;
        } else {
            item.innerHTML = `
                <div class="file-icon ${getFileIconClass(file.name)}"></div>
                <div class="file-name">${file.name}</div>
                <a href="${file.url}" download class="download-btn">تنزيل</a>
            `;
        }
        
        return item;
    }
    
    // تحديد أيقونة الملف حسب النوع
    function getFileIconClass(fileName) {
        if(fileName.match(/\.(pdf)$/i)) return 'icon-pdf';
        if(fileName.match(/\.(doc|docx)$/i)) return 'icon-word';
        if(fileName.match(/\.(xls|xlsx)$/i)) return 'icon-excel';
        return 'icon-file';
    }
});
