import specialistService from '../services/specialistService';

let createSpecialist = async (req, res) => {
    try {
        let infor = await specialistService.createSpecialist(req.body);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let getAllSpecialist = async (req, res) => {
    try {
        let infor = await specialistService.getAllSpecialist();
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

let getDetailSpecialistById = async (req, res) => {
    try {
        let infor = await specialistService.getDetailSpecialistById(req.query.id, req.query.location);
        return res.status(200).json(infor);
    } catch (e) {
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server',
        })
    }
}

module.exports = {
    createSpecialist: createSpecialist,
    getAllSpecialist: getAllSpecialist,
    getDetailSpecialistById: getDetailSpecialistById,
}