import db from '../models/index';
import CRUDServices from '../services/CRUDServices';

let getHomePage = async (req, res) => {
    try {
        let data = await db.User.findAll();
        return res.render('homepage.ejs', {
            data: JSON.stringify(data)
        });
    } catch(e) {
        console.log(e);
    }
}

let getAboutPage = (req, res) => {
    return res.render('test/aboutpage.ejs');
}

let getCRUD = (req, res) => {
    return res.render('crud.ejs');
}

let postCRUD = async (req, res) => {
    let message = await CRUDServices.createNewUser(req.body);
    console.log(message);
    return res.send('post CRUD from server');
}

let displayGetCRUD = async (req, res) => {
    let data = await CRUDServices.getAllUser();

    return res.render('displayCRUD.ejs', {
        dataTable: data
    });
}

let getEditCRUD = async (req, res) => {
    let userId = req.query.id;
    console.log(userId);
    if (userId) {
        let userData = await CRUDServices.getUserInforById(userId);

        return res.render('editCRUD.ejs', {
            user: userData
        });
    } else {
        return res.send('User not found');
    }

}

let putCRUD = async (req, res) => {
    let data = req.body;
    let allUsers = await CRUDServices.updateUserData(data);
    return res.render('displayCRUD.ejs', {
        dataTable: allUsers
    });
}

let deleteCRUD = async (req, res) => {
    let id = req.query.id;
    if (id) {
        await CRUDServices.deleteUserById(id);
        return res.send('Delete successed!');
    } else {
        return res.send('Delete user not found');
    }
}

module.exports = {
    getHomePage: getHomePage,
    getAboutPage: getAboutPage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditCRUD: getEditCRUD,
    deleteCRUD: deleteCRUD,
    putCRUD: putCRUD,
}