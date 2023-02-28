import db from "../models/index";
require('dotenv').config();
import _, { reject } from 'lodash';
import emailService from './emailService';

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { roleId: 'R2' },
                order:  [
                    ['createdAt', 'DESC']
                ],
                attributes: {
                    exclude: ['password'] //remove password
                },
                include: [
                    {model: db.Allcode, as: 'positionData', attributes: ['valueVi', 'valueEn']},
                    {model: db.Allcode, as: 'genderData', attributes: ['valueVi', 'valueEn']},
                    {model: db.Allcode, as: 'roleData', attributes: ['valueVi', 'valueEn']},
                ],
                raw: true,
                nest: true,
            })

            resolve({
                errCode: 0,
                data: users,
            })
        } catch (e) {
            reject(e);
        }
    })
}

let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image'] //remove password
                },
            })

            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (e) {
            reject(e);
        }
    })
}

let checkRequiredFailed = (inputData) => {
    let arrFailed = ['doctorId', 'contentHTML', 'contentMarkdown', 'action', 'selectedPrice', 'selectedPayment', 'selectedProvince',
        'nameClinic', 'addressClinic', 'note', 'specialtyId']
    
    let isValid = true;
    let element = '';
    for (let i = 0; i < arrFailed.length; i++){
        if (!inputData[arrFailed[i]]) {
            isValid = false;
            element = arrFailed[i];  
            break;
        }
    }

    return {
        isValid: isValid,
        element: element,
    }
}


let saveInforDoctor = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkObj = checkRequiredFailed(inputData);
            if (checkObj.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing required parameters ${checkObj.element}`
                })
            }
            else {
                if (inputData.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId,
                    })
                }
                else if (inputData.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false,
                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                        doctorMarkdown.description = inputData.description;
                        await doctorMarkdown.save();
                    }
                }

                //upsert to doctors_infor table
                let doctorInfor = await db.Doctors_Infor.findOne({
                    where: {
                        doctorId: inputData.doctorId,
                    },
                    raw: false,
                })

                // !inputData.selectedPrice || !inputData.selectedPayment || !inputData.selectedProvince ||
                // !inputData.nameClinic || inputData.addressClinic || inputData.note

                if (doctorInfor) {
                    doctorInfor.doctorId = inputData.doctorId;
                    doctorInfor.priceId = inputData.selectedPrice;
                    doctorInfor.paymentId = inputData.selectedPayment;
                    doctorInfor.provinceId = inputData.selectedProvince;
                    
                    doctorInfor.nameClinic = inputData.nameClinic;
                    doctorInfor.addressClinic = inputData.addressClinic;
                    doctorInfor.note = inputData.note;

                    doctorInfor.specialtyId = inputData.specialtyId;
                    doctorInfor.clinicId = inputData.clinicId;

                    await doctorInfor.save();
                }
                else {
                    await db.Doctors_Infor.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.selectedPrice,
                        paymentId: inputData.selectedPayment,
                        provinceId: inputData.selectedProvince,
                        
                        nameClinic: inputData.nameClinic,
                        addressClinic: inputData.addressClinic,
                        note: inputData.note,

                        specialtyId: inputData.specialtyId,
                        clinicId: inputData.clinicId,
                    })
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Save infor doctor success'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getDetailDoctorById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: inputId,
                    },
                    attributes: {
                        exclude: ['password'] //remove password
                    },
                    include: [
                        { model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown'] },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueVi', 'valueEn'] },
                        { model: db.Allcode, as: 'genderData', attributes: ['valueVi', 'valueEn'] },
                        {
                            model: db.Doctors_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueVi', 'valueEn'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueVi', 'valueEn'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueVi', 'valueEn'] },
                            ]
                        },
                        
                    ],
                    raw: false,
                    nest: true,
                })
                resolve({
                    errCode: 0,
                    data: data
                })

                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }

                if (!data) {
                    data = {};
                }
            }
        } catch (e) {
            reject(e)
        }
    })
}

let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.formattedDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'missing required parameters'
                })
            } else {
                let schedule = data.arrSchedule
                if(schedule && schedule.length > 0){
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }

                //get all existing data
                let existing = await db.Schedule.findAll({
                    where: { doctorId: data.doctorId, date: data.formattedDate },
                    attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                    raw: true
                })

                //compare diffirent
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date
                })
                  
                //create data
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }

                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getScheduleByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        { model: db.Allcode, as: 'timeTypeData', attributes: ['valueVi', 'valueEn'] },
                        { model: db.User, as: 'doctorData', attributes: ['firstName', 'lastName'] },
                    ],
                    raw: false,
                    nest: true,
                })

                if (!dataSchedule) {
                    dataSchedule = []
                }
                resolve({
                    errCode: 0,
                    data: dataSchedule,
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getDoctorInforExaminationById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let data = await db.Doctors_Infor.findOne({
                    where: {
                        doctorId:inputId,
                    },
                    attributes: {
                        exclude: ['id', 'doctorId']
                    },
                    include: [
                        { model: db.Allcode, as: 'priceTypeData', attributes: ['valueVi', 'valueEn'] },
                        { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueVi', 'valueEn'] },
                        { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueVi', 'valueEn'] },
                    ],
                    raw: false,
                    nest: true,

                })
                if (!data) {
                    data = []
                }
                resolve({
                    errCode: 0, 
                    data: data,
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getIntroductionDoctorById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: inputId,
                    },
                    attributes: {
                        exclude: ['password'] //remove password
                    },
                    include: [
                        { model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown'] },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueVi', 'valueEn'] },
                        { model: db.Allcode, as: 'genderData', attributes: ['valueVi', 'valueEn'] },
                        {
                            model: db.Doctors_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },
                            include: [
                                { model: db.Allcode, as: 'priceTypeData', attributes: ['valueVi', 'valueEn'] },
                                { model: db.Allcode, as: 'paymentTypeData', attributes: ['valueVi', 'valueEn'] },
                                { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueVi', 'valueEn'] },
                            ]
                        },
                        
                    ],
                    raw: false,
                    nest: true,

                })

                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }

                if (!data) {
                    data = {};
                }
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getListAppointment = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {    
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        statusId: 'S2',
                        doctorId: doctorId,
                        date: date,
                    }, 
                    include: [
                        {
                            model: db.User,
                            as: 'patientData',
                            attributes: ['email', 'firstName', 'phoneNumber', 'address', 'gender', 'lastName'], //lastName:reason
                            include: [
                                { model: db.Allcode, as: 'genderData', attributes: ['valueVi', 'valueEn'] },
                            ]
                        },
                        {
                            model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueVi', 'valueEn']
                        },
                    ],
                    raw: false,
                    nest: true,
                })

                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
                reject(e)
            }
        })
}

let sendBill = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.patientId || !data.timeType) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                //update patient status
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                        timeType: data.timeType,
                        statusId: 'S2',
                    },
                    raw: false,
                })

                if (appointment) {
                    appointment.statusId = 'S3'
                    await appointment.save()
                }

                //send bill to email
                console.log('check server: ', data);
                await emailService.sendAttachment(data);

                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }
        } catch (e) {
                reject(e)
            }
        })
}

module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    saveInforDoctor: saveInforDoctor,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateSchedule: bulkCreateSchedule,
    getScheduleByDate: getScheduleByDate,
    getDoctorInforExaminationById: getDoctorInforExaminationById,
    getIntroductionDoctorById: getIntroductionDoctorById,
    getListAppointment: getListAppointment,
    sendBill: sendBill,
}