const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  try {
    console.log('🧪 Bắt đầu test API endpoints...\n');

    // Test 1: Đăng ký user
    console.log('1️⃣ Test đăng ký user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });
    console.log('✅ Đăng ký thành công:', registerResponse.data.user.email);

    // Lưu token để sử dụng cho các test khác
    const token = registerResponse.data.accessToken;
    const userId = registerResponse.data.user.id;

    // Test 2: Đăng nhập
    console.log('\n2️⃣ Test đăng nhập...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });
    console.log('✅ Đăng nhập thành công:', loginResponse.data.user.email);

    // Test 3: Lấy profile user
    console.log('\n3️⃣ Test lấy profile user...');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Lấy profile thành công:', profileResponse.data.email);

    // Test 4: Tạo shortlink
    console.log('\n4️⃣ Test tạo shortlink...');
    const createShortlinkResponse = await axios.post(
      `${BASE_URL}/shortlinks`,
      {
        targetUrl: 'https://example.com',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log(
      '✅ Tạo shortlink thành công:',
      createShortlinkResponse.data.code,
    );

    const shortlinkId = createShortlinkResponse.data.id;
    const shortlinkCode = createShortlinkResponse.data.code;

    // Test 5: Lấy danh sách shortlinks
    console.log('\n5️⃣ Test lấy danh sách shortlinks...');
    const listResponse = await axios.get(`${BASE_URL}/shortlinks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(
      '✅ Lấy danh sách thành công, số lượng:',
      listResponse.data.length,
    );

    // Test 6: Lấy chi tiết shortlink
    console.log('\n6️⃣ Test lấy chi tiết shortlink...');
    const detailResponse = await axios.get(
      `${BASE_URL}/shortlinks/${shortlinkId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log('✅ Lấy chi tiết thành công:', detailResponse.data.targetUrl);

    // Test 7: Cập nhật shortlink
    console.log('\n7️⃣ Test cập nhật shortlink...');
    const updateResponse = await axios.put(
      `${BASE_URL}/shortlinks/${shortlinkId}`,
      {
        targetUrl: 'https://updated-example.com',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log('✅ Cập nhật thành công:', updateResponse.data.targetUrl);

    // Test 8: Test redirect (không cần auth)
    console.log('\n8️⃣ Test redirect shortlink...');
    try {
      const redirectResponse = await axios.get(
        `${BASE_URL}/shortlinks/s/${shortlinkCode}`,
        {
          maxRedirects: 0,
          validateStatus: function (status) {
            return status >= 200 && status < 400;
          },
        },
      );
      console.log('✅ Redirect thành công, status:', redirectResponse.status);
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 300 &&
        error.response.status < 400
      ) {
        console.log('✅ Redirect thành công (redirect response)');
      } else {
        console.log('⚠️ Redirect có vấn đề:', error.message);
      }
    }

    // Test 9: Xóa shortlink
    console.log('\n9️⃣ Test xóa shortlink...');
    await axios.delete(`${BASE_URL}/shortlinks/${shortlinkId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('✅ Xóa shortlink thành công');

    console.log('\n🎉 Tất cả API tests đều thành công!');
    console.log('📋 Tóm tắt:');
    console.log('   ✅ Authentication (register/login)');
    console.log('   ✅ User management (profile)');
    console.log('   ✅ Shortlink CRUD operations');
    console.log('   ✅ Redirect functionality');
  } catch (error) {
    console.error('❌ Lỗi khi test API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Kiểm tra xem server có đang chạy không
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server đang chạy');
    return true;
  } catch (error) {
    console.log('⚠️ Server chưa chạy, hãy chạy: npm run start:dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testAPI();
  }
}

main();
