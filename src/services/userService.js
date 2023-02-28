import bcrypt from 'bcryptjs';
import db from "../models/index";

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            var hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    })
}

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {}
            let isExist = await checkUserEmail(email)

            if (isExist) {
                //User already exist
                
                let user = await db.User.findOne({
                    where: { email: email },
                    attributes: ['id','email', 'roleId', 'password', 'firstName', 'lastName'],
                    raw: true
                })

                if (user) {
                    //compare password
                    let check = await bcrypt.compareSync(password, user.password); 
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = 'OK';
                        
                        delete user.password; //hide password
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password';
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = `User not found`;
                }

            } else {
                //return error
                userData.errCode = 1
                userData.errMessage = `Your email isn't exist in your system. Try again!`
            }
            resolve(userData)
        } catch (e) {
            reject(e)
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: {email: userEmail}
            })

            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                users = db.User.findAll({
                    attributes: {
                        exclude: ['password'] //remove password
                    },
                    include: [
                        { model: db.Allcode, as: 'positionData', attributes: ['valueVi', 'valueEn'] },
                        { model: db.Allcode, as: 'genderData', attributes: ['valueVi', 'valueEn'] },
                        { model: db.Allcode, as: 'roleData', attributes: ['valueVi', 'valueEn'] },
                    ],
                    raw: true,
                })
            }
            if(userId && userId !== 'ALL'){ 
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password'] //remove password
                    }
                })
            }
            resolve(users);
        } catch (e) {
            reject(e);
        }
    })
}

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            //check email exist ??
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your email is already in used, Try other email'
                })    
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    gender: data.gender,
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.image,
                })
                
                resolve({
                    errCode: 0,
                    message: 'OK'
                });
            }
        } catch (e) {
            reject(e);
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        let user = await db.User.findOne({
            where: {id: userId}
        })
        
        if (!user) {
            resolve({
                errCode: 2,
                errMessage: `The user isn't exist`
            })
        }

        console.log('Check: ', user);
        // await user.destroy();
        await db.User.destroy({
            where: {id: userId}
        })

        resolve({
            errCode: 0,
            message: `The user has been deleted`
        })
    })
}

let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.gender || !data.positionId || !data.roleId) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameter'
                })
            }

            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            })

            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.phoneNumber = data.phoneNumber;
                user.gender = data.gender;
                user.positionId = data.positionId;
                user.roleId = data.roleId;
                if (data.image) {
                    user.image = data.image;
                }
                
                await user.save();
                // await db.User.save({
                //     firstName: data.firstName,
                //     lastName: data.lastName,
                //     address: data.address,
                // });

                resolve({
                    errCode: 0,
                    message: `Update the user successed`
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: 'User not found'
                });
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: {type: typeInput}
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    })
}



module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUserData: updateUserData,
    getAllCodeService: getAllCodeService
}