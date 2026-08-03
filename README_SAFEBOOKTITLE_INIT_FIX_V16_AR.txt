إصلاح V16

السبب:
safeBookTitle كان يُستخدم قبل تعريفه داخل BookReader.

الإصلاح:
- نقل safeBookId وsafeBookTitle وsafeBookDescription وsafeBookCover إلى أعلى BookReader قبل أي استخدام.
- إزالة التعريف المكرر.
- استخدام القيم الآمنة للأقسام والصفحات المنشأة.
