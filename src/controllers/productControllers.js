const { dbCon } = require("./../connections");
const fs = require("fs");

module.exports = {
  addProducts: async (req, res) => {
    console.log("ini req.body", req.body);
    let path = "/products";

    const data = JSON.parse(req.body.data);
    console.log("ini data", data);
    const { products } = req.files;

    // looping filename
    const imagePaths = products.map((val) => {
      return `${path}/${val.filename}`;
    });

    // Proteksi tidak ada foto
    if (!imagePaths.length) {
      return res.status(500).send({ message: "Foto tidak ada" });
    }

    console.log(products);
    console.log(imagePaths);

    let conn, sql;
    try {
      conn = dbCon.promise();
      sql = `insert into product set ?`;
      let insertData = {
        name: data.name,
        price: data.price,
        description: JSON.stringify(data.description),
        warning: JSON.stringify(data.warning),
        usage: JSON.stringify(data.usage),
        quantity: data.quantity,
        unit: data.unit,
        expired_at: data.expired_at,
        no_BPOM: data.no_BPOM,
        hargaJual: data.hargaJual,
        hargaBeli: data.hargaBeli,
        no_obat: data.no_obat,
        is_deleted: data.is_deleted,

        brand_id: data.brand_id,
        type_id: data.type_id,
      };

      let [resultProd] = await conn.query(sql, insertData);
      let prodId = resultProd.insertId;
      sql = `insert into product_image set ?`;
      for (let i = 0; i < imagePaths.length; i++) {
        let insertDataImage = {
          image: imagePaths[i],
          product_id: prodId,
        };
        await conn.query(sql, insertDataImage);
      }

      sql = `insert into stock set ?`;
      let insertDataStock = {
        expired: data.expired_at,
        stock: data.stock,
        product_id: prodId,
      };
      await conn.query(sql, insertDataStock);

      sql = `insert into symptom_product set ?`;
      for (let i = 0; i < data.symptom.length; i++) {
        let insertDataSymptom = {
          symptom_id: data.symptom[i],
          product_id: prodId,
        };
        await conn.query(sql, insertDataSymptom);
      }

      sql = `insert into category_product set ?`;
      for (let i = 0; i < data.category.length; i++) {
        let insertDataCategory = {
          category_id: data.category[i],
          product_id: prodId,
        };
        await conn.query(sql, insertDataCategory);
      }

      return res.status(200).send({ message: "Berhasil Upload Obat" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error.message || error });
    }
  },
  editProducts: async (req, res) => {
    console.log("ini req.body", req.body);

    const data = JSON.parse(req.body.data);
    const { products } = req.files;
    const { id } = req.params;

    console.log(products);
    // res.send("berhasil");
    let conn, sql;
    try {
      conn = dbCon.promise();

      // get ID
      let sql = `select * from product where id = ?`;
      let [result] = await conn.query(sql, [id]);
      if (!result.length) {
        throw { message: "id tidak ditemukan" };
      }

      sql = `update product set ? where id = ?`;
      let [result1] = await conn.query(sql, [data, id]);
      if (!result1.length) {
        throw { message: "id tidak ditemukan" };
      }

      return res.status(200).send({ message: "Berhasil Update Obat" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error.message || error });
    }
  },
  editProductsPicture: async (req, res) => {
    console.log("ini req.body", req.body);
    let path = "/products";

    const { products } = req.files;
    const { product_image_id } = req.params;

    const imagePath = products ? `${path}/${products[0].filename}` : null;

    console.log(products);
    let conn, sql;
    try {
      conn = dbCon.promise();

      // get ID
      sql = `select * from product_image where id = ?`;
      let [result] = await conn.query(sql, [product_image_id]);
      if (!result.length) {
        throw { message: "id tidak ditemukan" };
      }

      sql = `update product_image set ? where id = ?`;

      let editDataPicture = {
        image: imagePath,
      };
      await conn.query(sql, [editDataPicture, product_image_id]);

      // Berhasil edit -> hapus foto lama
      if (imagePath) {
        // klo image baru ada maka hapus image lama
        if (result[0].image) {
          fs.unlinkSync("./public" + result[0].image);
        }
      }

      return res.status(200).send({ message: "Berhasil Update Obat" });
    } catch (error) {
      console.log(error);
      if (imagePath) {
        fs.unlinkSync("./public" + imagePath);
      }
      return res.status(500).send({ message: error.message || error });
    }
  },
  // edit product stock per tanggal expire
  editProductsStock: async (req, res) => {
    console.log("ini req.body", req.body);

    const data = JSON.parse(req.body.data);
    const { stock_id } = req.params;

    console.log(data);
    let conn, sql;
    try {
      conn = dbCon.promise();

      // get ID
      let sql = `select * from stock where id = ?`;
      let [result] = await conn.query(sql, [stock_id]);
      if (!result.length) {
        throw { message: "id tidak ditemukan" };
      }

      sql = `update stock set ? where id = ?`;

      // let [result1] = await conn.query(sql, [data, stock_id]);
      // if (!result1.length) {
      //   throw { message: "id tidak ditemukan" };
      // }
      let editDataStock = {
        stock: data.stock,
        expired: data.expired,
      };
      await conn.query(sql, [editDataStock, stock_id]);

      return res.status(200).send({ message: "Berhasil Update Stock Obat" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error.message || error });
    }
  },

  // masih single
  editProductsSymptom: async (req, res) => {
    console.log("ini req.body", req.body);
    let path = "/products";

    const { products } = req.files;
    const { symptom_product_id } = req.params;

    console.log(products);
    let conn, sql;
    try {
      conn = dbCon.promise();

      // get ID
      sql = `select * from symptom_product where id = ?`;
      let [result] = await conn.query(sql, [symptom_product_id]);
      if (!result.length) {
        throw { message: "id tidak ditemukan" };
      }

      sql = `update symptom_product set ? where id = ?`;

      let editDataSymptom = {
        symptom: data.symptom,
      };
      await conn.query(sql, [editDataSymptom, symptom_product_id]);

      return res.status(200).send({ message: "Berhasil Update Obat" });
    } catch (error) {
      console.log(error);
      if (imagePath) {
        fs.unlinkSync("./public" + imagePath);
      }
      return res.status(500).send({ message: error.message || error });
    }
  },

  deleteProducts: async (req, res) => {
    console.log("ini req.body", req.body);

    const data = JSON.parse(req.body.data);
    const { products } = req.files;
    const { id } = req.params;

    console.log(products);
    let conn, sql;
    try {
      conn = dbCon.promise();

      // get ID
      let sql = `select * from product where id = ?`;
      let [result] = await conn.query(sql, [id]);
      if (!result.length) {
        throw { message: "id tidak ditemukan" };
      }

      sql = `delete from name where id = ?`;

      let [result1] = await conn.query(sql, [id]);
      if (!result1.length) {
        throw { message: "id tidak ditemukan" };
      }

      return res.status(200).send({ message: "Berhasil Menghapus Obat" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error.message || error });
    }
  },
  deleteProductsStock: async (req, res) => {
    console.log("ini req.body", req.body);

    const data = JSON.parse(req.body.data);
    const { stock_id } = req.params;

    console.log(data);
    let conn, sql;
    try {
      conn = dbCon.promise();

      // get ID
      let sql = `select * from stock where id = ?`;
      let [result] = await conn.query(sql, [stock_id]);
      console.log("INI", id);
      if (!result.length) {
        throw { message: "id tidak ditemukan" };
      }

      sql = `delete stock set ? where id = ?`;
      // let [result1] = await conn.query(sql, [data, stock_id]);
      // if (!result1.length) {
      //   throw { message: "id tidak ditemukan" };
      // }
      let editDataStock = {
        stock: data.stock,
        expired: data.expired,
      };
      await conn.query(sql, [editDataStock, stock_id]);

      return res.status(200).send({ message: "Berhasil Delete Stock Obat" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error.message || error });
    }
  },
};
