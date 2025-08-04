const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function testFirebaseConnection() {
  try {
    console.log('🔄 Đang khởi tạo Firebase...');

    // Đọc service account từ file firebase.json
    const serviceAccountPath = path.join(process.cwd(), 'firebase.json');
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf8'),
    );

    console.log('✅ Đọc được service account từ firebase.json');
    console.log(`📋 Project ID: ${serviceAccount.project_id}`);

    // Khởi tạo Firebase
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });

    console.log('✅ Firebase đã được khởi tạo');

    // Test kết nối Firestore
    const db = admin.firestore();
    console.log('🔄 Đang test kết nối Firestore...');

    // Thử đọc một document để test kết nối
    const testCollection = db.collection('test');
    const snapshot = await testCollection.limit(1).get();

    console.log('✅ Kết nối Firestore thành công!');
    console.log(`📊 Số document trong collection test: ${snapshot.size}`);

    // Test tạo document
    console.log('🔄 Đang test tạo document...');
    const testDoc = await testCollection.add({
      message: 'Test connection',
      timestamp: new Date(),
    });

    console.log(`✅ Tạo document thành công với ID: ${testDoc.id}`);

    // Xóa document test
    await testDoc.delete();
    console.log('✅ Đã xóa document test');

    console.log(
      '\n🎉 Tất cả test đều thành công! Firebase đã sẵn sàng sử dụng.',
    );
  } catch (error) {
    console.error('❌ Lỗi khi test Firebase:', error.message);
    console.error('Chi tiết lỗi:', error);
  } finally {
    process.exit(0);
  }
}

testFirebaseConnection();
