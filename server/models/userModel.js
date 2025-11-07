const db = require('./db');

class UserModel {
  // Create a new user
  static async create(userData) {
    const { name, email, password_hash } = userData;
    const query = `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `;
    const values = [name, email, password_hash];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to create user: ' + error.message);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    try {
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to find user: ' + error.message);
    }
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, name, email, created_at FROM users WHERE id = $1';
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to find user: ' + error.message);
    }
  }

  // Update user (name only)
  static async update(id, userData) {
    const { name } = userData;
    const query = `
      UPDATE users 
      SET name = $1
      WHERE id = $2
      RETURNING id, name, email, created_at
    `;
    const values = [name, id];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to update user: ' + error.message);
    }
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    try {
      await db.query(query, [id]);
      return true;
    } catch (error) {
      throw new Error('Failed to delete user: ' + error.message);
    }
  }
}

module.exports = UserModel;
