import db from "../models/index";
import bcrypt from "bcryptjs";

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
          raw: true //chi tra ra dung object nhu trong database
        });
        if (user) {
          let check = await bcrypt.compareSync(password, user.password);
          if (check) {
            // true
            userData.errCode = 0;
            userData.errMessage = "Ok";
            delete user.password;//xoa cot password truoc khi gan
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

let checkUserEmail = (usereMail) => {
  return new Promise(async (resole, reject) => {
    try {
      let user = await db.User.findOne({
        //tim user
        where: { email: usereMail },
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

module.exports = {
  handleUserLogin: handleUserLogin,
};
