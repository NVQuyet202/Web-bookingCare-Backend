import db from "../models/index";

let createClinic = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.name ||
        !data.address ||
        !data.imageBase64 ||
        !data.descriptionHtml ||
        !data.descriptionMarkdown
      ) {
        resolve({
          errCode: 1,
          errMesage: "Missing parameter!",
        });
      } else {
        await db.Clinic.create({
          name: data.name,
          address: data.address,
          image: data.imageBase64,
          descriptionHtml: data.descriptionHtml,
          descriptionMarkdown: data.descriptionMarkdown,
        });

        resolve({
          errCode: 0,
          errMesage: "Create Succeed!",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllClinic = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await db.Clinic.findAll({});
      if (data && data.length > 0) {
        data.map((item) => {
          item.image = new Buffer(item.image, "base64").toString("binary");

          return item;
        });
      }

      resolve({
        errCode: 0,
        errMesage: "Ok!",
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getDetailClinicById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMesage: "Missing parameter!",
        });
      }

      let data = await db.Clinic.findOne({
        where: {
          id: inputId,
        },
        attributes: [
          "descriptionHtml",
          "descriptionMarkdown",
          "name",
          "address",
        ],
      });

      if (data) {
        let doctorClinic = [];

        doctorClinic = await db.Doctor_Infor.findAll({
          where: { clinicId: inputId },
          attributes: ["doctorId", "provinceId"],
        });
        data.doctorClinic = doctorClinic;
      } else {
        data = {};
      }

      resolve({
        errCode: 0,
        errMesage: "Ok!",
        data: data,
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createClinic,
  getAllClinic,
  getDetailClinicById,
};
