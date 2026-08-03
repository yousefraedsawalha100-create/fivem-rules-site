إصلاح الشاشة البيضاء V14

تم إصلاح جميع المراجع المتبقية إلى safeBookTitle وsafeBookCover خارج نطاق BookReader.
كانت هذه المراجع تسبب ReferenceError في:
- تجهيز كتب الاستيراد
- إنشاء الكتب الأساسية
- تنظيف التكرار
- قائمة إدارة الكتب

الآن تبقى المتغيرات safeBookTitle وsafeBookCover داخل BookReader فقط، وهو نطاقها الصحيح.
