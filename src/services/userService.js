import db from "../models/index";
import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPassword = await bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (e) {
      reject(e);
    }
  });
};

let handleUserLogin = (email, password) => {
  return new Promise(async (resole, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(email); //lay gia tri true and false
      if (isExist) {
        //neu tra ve true
        let user = await db.User.findOne({
          attributes: ["email", "roleId", "password"],
          where: { email: email },
          raw: true, //chi tra ra dung object nhu trong database
        });
        if (user) {
          let check = await bcrypt.compareSync(password, user.password);
          if (check) {
            // true
            userData.errCode = 0;
            userData.errMessage = "Ok";
            delete user.password; //xoa cot password truoc khi gan
            userData.user = user;
          } else {
            userData.errCode = 3;
            userData.errMessage = "Vui lòng nhập đúng password";
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = "Email này chưa được đăng ký!!!";
        }
      } else {
        //neu tra ve false
        userData.errCode = 1;
        userData.errMessage =
          "Email của bạn không tồn tại trong hệ thống, vui lòng nhập lại email!!!";
      }
      resole(userData);
    } catch (e) {
      reject(e);
    }
  });
};

let checkUserEmail = (userEmail) => {
  return new Promise(async (resole, reject) => {
    try {
      let user = await db.User.findOne({
        //tim user
        where: { email: userEmail },
      });
      if (user) {
        //user khac undefine thi chay vao day
        resole(true);
      } else {
        //user undefine chay vao day
        resole(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllUsers = (userId) => {
  return new Promise(async (resole, reject) => {
    try {
      let users = "";
      if (userId === "ALL") {
        users = await db.User.findAll({
          attributes: {
            exclude: ["password"], //khong lay ra password
          },
        });
      }
      if (userId && userId !== "ALL") {
        users = await db.User.findOne({
          where: { id: userId },
          attributes: {
            exclude: ["password"], //khong lay ra password
          },
        });
      }
      resole(users);
    } catch (e) {
      reject(e);
    }
  });
};

let createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let check = await checkUserEmail(data.email);
      if (check === true) {
        resolve({
          errCode: 1,
          errMessage: "Email đã được sử dụng vui lòng dùng email khác!!!",
        });
      } else {
        let hashPasswordFromBcrypt = await hashUserPassword(data.password);
        await db.User.create({
          email: data.email,
          password: hashPasswordFromBcrypt,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phonenumber: data.phonenumber,
          gender: data.gender === "1" ? true : false,
          roleId: data.roleId,
        });

        resolve({
          errCode: 0,
          message: "OK",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    let foundUser = await db.User.findOne({
      where: { id: userId },
    });
    if (!foundUser) {
      resolve({
        errCode: 2,
        errMessage: "Người dùng không tồn tại",
      });
    }
    await db.User.destroy({
      where: { id: userId },
    });
    resolve({
      errCode: 0,
      message: "Xóa người dùng thành công",
    });
  });
};

let updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.id) {
        resolve({
          errCode: 2,
          errMessage: "Thiếu tham số truyền vào!!!",
        });
        x;
      }
      let user = await db.User.findOne({
        where: { id: data.id },
        raw: false,
      });
      if (user) {
        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.address = data.address;

        await user.save();

        // await db.User.save({
        //   firstName: data.firstName,
        //   lastName: data.lastName,
        //   address: data.address,
        //});
        resolve({
          errCode: 0,
          message: "Sửa thông tin người dùng thành công!",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "Không tìm thấy người dùng!",
        });
      }
    } catch (e) {}
  });
};

module.exports = {
  handleUserLogin: handleUserLogin,
  getAllUsers: getAllUsers,
  createNewUser: createNewUser,
  deleteUser: deleteUser,
  updateUserData: updateUserData,
};
