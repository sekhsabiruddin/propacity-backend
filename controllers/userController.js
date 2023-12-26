const pool = require("../config/database");
const jwt = require("jsonwebtoken");
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExistQuery =
      "SELECT * FROM users WHERE username = $1 OR email = $2";
    const userExistValues = [username, email];
    const userExistResult = await pool.query(userExistQuery, userExistValues);

    if (userExistResult.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Username or email already taken" });
    }

    const insertUserQuery =
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *";
    const insertUserValues = [username, email, password];
    const insertedUser = await pool.query(insertUserQuery, insertUserValues);

    const token = jwt.sign(
      { userId: insertedUser.rows[0].id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({
      token,
      userId: insertedUser.rows[0].id,
      username: insertedUser.rows[0].username,
      email: insertedUser.rows[0].email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const loginUserQuery =
      "SELECT * FROM users WHERE username = $1 AND password = $2";
    const loginUserValues = [username, password]; // Note: Make sure to compare hashed passwords
    const loginUserResult = await pool.query(loginUserQuery, loginUserValues);

    if (loginUserResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate and send JWT token upon successful login
    const token = jwt.sign(
      { userId: loginUserResult.rows[0].id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      token,
      userId: loginUserResult.rows[0].id,
      username: loginUserResult.rows[0].username,
      email: loginUserResult.rows[0].email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
