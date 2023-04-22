const express = require("express");
const mysql = require("mysql");
const path = require("path");
const cors = require("cors");
require('dotenv').config()
const multer = require("multer");
const fs = require("fs");
const db = mysql.createConnection({
  host:process.env.RDS_HOST,
  user:process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port:process.env.RDS_PORT,
  database: "products"
});

db.connect(function(err) {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }

  console.log('Connected to database.');
});



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log(req.body, "in");
    cb(null, `${req.body.productId}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors())
app.use(express.json())
app.use('/api/uploads', express.static(path.join(__dirname ,'uploads')));


app.post("/api/thumbnailUpload", upload.single("productThumbnail"), (req, res) => {
  try {
    console.log(req.file) ;
    return res.json({ data: req.file.filename });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.get("/api/products", (req, res) => {
    const q = "select * from product";
    db.query(q, (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else return res.json({ data });
    });
  });
  app.post("/api/products", (req, res) => {
    const q = `insert into product(productId, productTitle, productDescription, productPrice, availableQuantity, productThumbnail)
      values(?)`;
    const values = [...Object.values(req.body)];
    console.log("insert", values);
    db.query(q, [values], (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else return res.json({ data });
    });
  });
  
  app.get("/api/products/:productId", (req, res) => {
    const id = req.params.productId;
    const q = "SELECT * FROM product where productId=?";
    db.query(q, [id], (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else return res.json({ data });
    });
  });
  
  app.put("/api/products/:productId", (req, res) => {
    const id = req.params.productId;
    console.log("updated " + req.body);
    const data = req.body;
    if (data.productPrice) data.productPrice = Number.parseInt(data.productPrice);
    if (data.availableQuantity)
      data.availableQuantity = Number.parseInt(data.availableQuantity);
    const q =
      "update product set " +
      Object.keys(data)
        .map((k) => `${k} = ?`)
        .join(",") +
      " where productId='" +
      id +
      "'";
    console.log(q);
    db.query(q, [...Object.values(data)], (err, out) => {
      console.log(err, out);
      if (err) return res.json({ error: err.message });
      else {
        return res.json({ data: out });
      }
    });
  });
  
  app.delete("/api/products/:productId", (req, res) => {
    const id = req.params.productId;
    console.log("deleting " + id, req.body);
    const { productThumbnail } = req.body;
    console.log(req.body);
    const q = `DELETE FROM product WHERE productId= ?`;
    db.query(q, [id], (err, data) => {
      console.log(err, data);
      if (err) return res.json({ error: err.sqlMessage });
      else res.json({data})
    })
});


app.listen(8081, () => {
  console.log("listening");
});
