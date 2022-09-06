const mysql = require("mysql");

const cnn = mysql.createConnection({
  host: "localhost",
  user: "user",
  password: "Xx1023_0901",
  database: "kdt_db",
});

exports.get_visitor = (cb) => {
  var sql = "SELECT * FROM visitor";
  cnn.query(sql, (err, rows) => {
    if (err) throw err;
    console.log("visitors : ", rows);

    cb(rows);
  });
};

exports.post_visitor = (data, cb) => {
  var sql = `INSERT INTO visitor(name, comment) VALUES ('${data.name}', '${data.comment}')`;
  cnn.query(sql, (err, result) => {
    if (err) throw err;
    console.log("visitors : ", result);

    cb(result.insertId);
  });
};

exports.delete_visitor = (id, cb) => {
  var sql = `DELETE FROM visitor WHERE id = ${id}`;
  cnn.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);

    cb();
  });
};

exports.get_visitor_by_id = (id, cb) => {
  var sql = `SELECT * FROM visitor WHERE id = ${id}`;
  cnn.query(sql, (err, rows) => {
    if (err) throw err;

    cb(rows);
  });
};

exports.update_visitor = (data, cb) => {
  var sql = `UPDATE visitor SET name='${data.name}', comment='${data.comment}' WHERE id=${data.id}`;
  cnn.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    cb();
  });
};
