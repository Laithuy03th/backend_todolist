const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const logger = require('../utils/logger');

const seedUsers = async () => {
  try {
    const users = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        address: '123 Main St',
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        address: '456 Elm St',
      },
      {
        username: 'alice_wonder',
        email: 'alice@example.com',
        password: 'password123',
        address: '789 Oak St',
      },
      {
        username: 'bob_builder',
        email: 'bob@example.com',
        password: 'password123',
        address: '321 Pine St',
      },
      {
        username: 'charlie_brown',
        email: 'charlie@example.com',
        password: 'password123',
        address: '654 Maple St',
      },
    ];

    for (const user of users) {
      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [user.email]);
      if (existingUser.rows.length > 0) {
        logger.warn(`User with email ${user.email} already exists.`);
        continue;
      }

      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      // Thêm người dùng vào cơ sở dữ liệu
      await pool.query(
        'INSERT INTO users (username, email, password, address) VALUES ($1, $2, $3, $4)',
        [user.username, user.email, hashedPassword, user.address]
      );

      logger.info(`User ${user.username} seeded successfully.`);
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding users: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

seedUsers();
