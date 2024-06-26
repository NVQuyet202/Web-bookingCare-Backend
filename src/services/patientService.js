import db from "../models/index";
require("dotenv").config();
import _, { reject } from "lodash";
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";

let buildUrlEmail = (doctorId, token) => {
  let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
  return result;
};

let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.timeType ||
        !data.date ||
        !data.fullName ||
        !data.selectedGender ||
        !data.address ||
        !data.timteId
      ) {
        resolve({
          errCode: 1,
          errMesage: "Missing parameter!",
        });
      } else {
        let schedule = await db.Schedule.findOne({
          where: { id: data.timteId },
          raw: false,
        });
        if (schedule) {
          schedule.currentNumber = 1;

          await schedule.save();
        }
        let token = uuidv4();

        await emailService.sendSimpleEmail({
          receiversEmail: data.email,
          patientName: data.fullName,
          time: data.timeString,
          doctorName: data.doctorName,
          language: data.language,
          redirectLink: buildUrlEmail(data.doctorId, token),
        });

        let user = await db.User.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: "R3",
            address: data.address,
            gender: data.selectedGender,
            phoneNumber: data.phoneNumber,
            firstName: data.fullName,
          },
        });

        if (user && user[0]) {
          await db.Booking.findOrCreate({
            where: {
              patientid: user[0].id,
            },
            defaults: {
              statusId: "S1",
              doctorId: data.doctorId,
              patientid: user[0].id,
              date: data.date,
              timeType: data.timeType,
              token: token,
            },
          });
        }

        resolve({
          errCode: 0,
          errMesage: "Save infor apppointment succeed",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let postVerifyBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.token || !data.doctorId) {
        resolve({
          errCode: 1,
          errMesage: "Missing parameter!",
        });
      } else {
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            token: data.token,
            statusId: "S1",
          },
          raw: false,
        });

        if (appointment) {
          appointment.statusId = "S2";
          await appointment.save();
          resolve({
            errCode: 0,
            errMesage: "Confirm appointment succeed!",
          });
        } else {
          resolve({
            errCode: 2,
            errMesage: "Appointment has been activated or doesn't exist",
          });
        }
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  postBookAppointment,
  postVerifyBookAppointment,
};
