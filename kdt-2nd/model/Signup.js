const mysql = require("mysql");

const cnn = mysql.createConnection({
  host: "localhost",
  user: "user",
  password: "Xx1023_0901",
  database: "kdt_db",
});

exports.get_signup = (cb) => {
  var sql = "SELECT * FROM signup";
  cnn.query(sql, (err, rows) => {
    if (err) throw err;
    console.log("signup : ", rows);

    cb(rows);
  });
};

exports.post_signup = (data, cb) => {
  var sql = `INSERT INTO signup(id, name, password) VALUES ('${data.id}', '${data.name}', '${data.password}')`;
  cnn.query(sql, (err, result) => {
    if (err) throw err;
    console.log("signup : ", result);

    cb(result.insertId);
  });
};

exports.get_signup_by_id = (id, cb) => {
  var sql = `SELECT * FROM signup WHERE id = ${id}`;
  cnn.query(sql, (err, rows) => {
    if (err) throw err;

    cb(rows);
  });
};
