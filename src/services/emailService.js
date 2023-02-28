require('dotenv').config();
import nodemailer from 'nodemailer';


let sendSimpleEmail = async (dataSend) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
        user: process.env.EMAIL_APP, // generated ethereal user
        pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"BookingCare" <support@bookingcare.vn>', // sender address
        to: dataSend.reciverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh ✔", // Subject line
        html: getBodyHTML(dataSend),
    });
}

let getBodyHTML = (dataSend) => {
    let result = ''
    if (dataSend.language === 'vi') {
        result = `
            <h3>Xin chào ${dataSend.patientName}!</h3>
            <p>Bạn nhận được email này vì đã đặt lịch khám bệnh trên website BookingCare</p>
            <p>Chúng tôi gửi tới bạn thông tin đặt lịch khám bệnh:</p>
            <h4><b>Thời gian: </b>${dataSend.time}</h4>
            <h4><b>Bác sĩ: </b>${dataSend.doctorName}</h4>
            <p>Để hoàn tất đặt lịch hẹn, bạn hãy click vào đường link bên dưới để xác nhận đặt lịch hẹn thành công.</p>
            <p><a href="${dataSend.redirectLink}" target="blank">Click tại đây</a></p>
            <div>Cảm ơn bạn đã sử dụng dịch vụ của BookingCare!</div>
        `
    }

    if (dataSend.language === 'en') {
        result = `
            <h3>Dear ${dataSend.patientName}!</h3>
            <p>You received this email because you booked a medical appointment on the BookingCare website</p>
            <p>We send you information to schedule a medical appointment:</p>
            <h4><b>Time: </b>${dataSend.time}</h4>
            <h4><b>Doctor: </b>${dataSend.doctorName}</h4>
            <p>To complete the appointment, click on the link below to confirm the successful appointment schedule.</p>
            <p><a href="${dataSend.redirectLink}" target="blank">Click here</a></p>
            <div>Thank you for using BookingCare's service!</div>
        `
    }
    return result;
}

let getBodyHTMLBill = (dataSend) => {
    let result = ''
    if (dataSend.language === 'vi') {
        result = `
            <h3>Xin chào ${dataSend.patientName}!</h3>
            <p>Bạn đã đặt lịch hẹn khám thành công!</p>
            <p>Bác sĩ đã xác nhận lịch hẹn khám của bạn!</p>
            <p>Phiếu thông tin của bạn được gửi trong tệp đính kèm. Bạn hãy nhớ đem phiếu này khi đến khám bệnh tại địa điểm đã đặt lịch nhé!</p>
            <div>Cảm ơn bạn đã sử dụng dịch vụ của BookingCare!</div>
        `
    }

    if (dataSend.language === 'en') {
        result = `
            <h3>Dear ${dataSend.patientName}!</h3>
            <p>You have successfully booked your appointment!</p>
            <p>The doctor has confirmed your appointment!</p>
            <p>Your information medical bill is included in the attachment. Please remember to bring this medical bill when you visit the doctor at the scheduled location!</p>
            <div>Thank you for using BookingCare!</div>
        `
    }
    return result;
}

let sendAttachment = async (dataSend) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
        user: process.env.EMAIL_APP, // generated ethereal user
        pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"BookingCare" <support@bookingcare.vn>', // sender address
        to: dataSend.email, // list of receivers
        subject: "Xác nhận thông tin đặt lịch hẹn khám ✔", // Subject line
        html: getBodyHTMLBill(dataSend),
        attachments: [
            {
                filename: `bill-${dataSend.patientId}-${dataSend.patientName}.png`,
                content: dataSend.imgBase64.split("base64,")[1],
                encoding: 'base64',
            }
        ],
    });
}


module.exports = {
    sendSimpleEmail: sendSimpleEmail,
    sendAttachment: sendAttachment,
}