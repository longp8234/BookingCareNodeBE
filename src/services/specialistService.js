const db = require("../models")


let createSpecialist = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.name || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                })
                resolve({
                    errCode: 0,
                    errMessage: 'Saved information successfully',
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}
 
let getAllSpecialist = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Specialty.findAll();
            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, 'base64').toString('binary')
                    return item;
                })
            }
            resolve({
                errCode: 0,
                errMessage: 'OK',
                data
            })
        } catch (e) {
            reject(e)
        }
        
    })
}

let getDetailSpecialistById = (inputId, location) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId || !location) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let data = await db.Specialty.findOne({ 
                    where: {
                        id: inputId,
                    },
                    attributes: ['descriptionHTML', 'descriptionMarkdown'],
                })

                if (data) {
                    let doctorSpecialty = [];
                    if (location === 'ALL') {
                        doctorSpecialty = await db.Doctors_Infor.findAll({
                            where: { specialtyId: inputId },
                            attributes: ['doctorId', 'provinceId']
                        })
                    } else {
                        //find by location
                        doctorSpecialty = await db.Doctors_Infor.findAll({
                            where: {
                                specialtyId: inputId,
                                provinceId: location,
                            },
                            attributes: ['doctorId', 'provinceId']
                        })
                    }

                    data.doctorSpecialty = doctorSpecialty

                } else {
                    data = {}
                }
                resolve({
                    errCode: 0,
                    errMessage: 'OK',
                    data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createSpecialist: createSpecialist,
    getAllSpecialist: getAllSpecialist,
    getDetailSpecialistById: getDetailSpecialistById,
}