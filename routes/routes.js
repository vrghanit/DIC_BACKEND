
/* APP USERS START*/
const users_auth = require("../app/users/auth/authController.js");
const chat = require("../app/users/chat");
const templates = require("../app/admin/template");
const users_admin = require("../app/admin/users");

// const users_notification = require("../app/users/notification/notification.js");
/* APP USERS END*/


/* VALIDATION START*/
const app_validation = require('../validation/app_validation');
const { user } = require("../config/connection.js");
/* VALIDATION END*/

// const forgot_password = require("../app/forgotpassword/forgotpassword.js");

module.exports = function (app) {

    app.get('/', async (req, res) => {
        res.status(200).json({
            status: "OK",
        });
    })

    /* APP USERS START*/
    app.post('/app/registration', app_validation.registration, users_auth.registration);
    app.post('/web/registration', users_auth.update_profile_image, users_auth.registrationWeb);
    app.post('/app/login', app_validation.login, users_auth.login);
    app.post('/app/forgot_password', users_auth.forgot_password);
    app.post('/app/update_profile', users_auth.check_auth, users_auth.update_profile_image, users_auth.profle_update);
    app.post('/app/reset_password', users_auth.resetPassword)
    app.post('/app/search_buca', users_auth.userSearch)
    app.post('/app/make_connection', users_auth.check_auth, users_auth.makeConnection)
    app.get('/app/get_contacts', users_auth.check_auth, users_auth.getContacts)
    app.post('/app/start_chat', users_auth.check_auth, users_auth.startChat)
    app.get('/app/user_details', users_auth.check_auth, users_auth.userDetails);
    app.post('/app/change_password', users_auth.check_auth, users_auth.changePassword)

    // Single Chat
    app.get('/app/getChat', users_auth.check_auth, chat.getUserChat);
    app.post('/app/saveChat', users_auth.check_auth, chat.saveUserChat);
    app.post('/app/archiveChat', users_auth.check_auth, chat.archiveChat);
    app.post('/app/deleteChat', users_auth.check_auth, chat.deleteChat);
    app.post('/app/unArchiveChat', users_auth.check_auth, chat.unArchiveChat);
    app.get('/app/archiveChatList', users_auth.check_auth, chat.archiveChatList);
    app.post('/app/readChat', users_auth.check_auth, chat.readChat);

    // Group Chat
    app.post('/app/createGroup',users_auth.check_auth, chat.createGroup);
    app.get('/app/getGroupChat',users_auth.check_auth, chat.getGroupChat);
    app.post('/app/updateGroupChat',users_auth.check_auth, chat.updateGroupChat);
    app.post('/app/archiveGroupChat',users_auth.check_auth, chat.archiveGroupChat);
    app.post('/app/deleteGroupChat',users_auth.check_auth, chat.deleteGroupChat);
    app.post('/app/unArchiveGroupChat',users_auth.check_auth, chat.unArchiveGroupChat);
    app.get('/app/getArchiveGroupChatList',users_auth.check_auth, chat.getArchiveGroupChatList);
    app.post('/app/readGroupChat', users_auth.check_auth, chat.readGroupChat);

    // For unset a field
    app.get('/app/unsetField', users_auth.check_auth, chat.unsetField);

    app.post('/web/check_email', users_auth.checkEmail)
    app.post('/app/createGroup', users_auth.check_auth, chat.createGroup);
    app.get('/app/getGroupChat', users_auth.check_auth, chat.getGroupChat);
    app.post('/app/updateGroupChat', users_auth.check_auth, chat.updateGroupChat);
    app.post('/app/archiveGroupChat', users_auth.check_auth, chat.archiveGroupChat);
    app.post('/app/deleteGroupChat', users_auth.check_auth, chat.deleteGroupChat);
    app.post('/app/unArchiveGroupChat', users_auth.check_auth, chat.unArchiveGroupChat);
    app.get('/app/getArchiveGroupChatList', users_auth.check_auth, chat.getArchiveGroupChatList);

    app.post('/web/check_email', users_auth.checkEmail)
    app.post('/admin/upload_template', templates.addTemplate)
    app.get('/admin/get_template', templates.getTemplate)
    app.get('/admin/get_users', users_admin.getUsers)
    app.get('/admin/delete_template', templates.deletTemplate)
    app.post('/admin/update_template', templates.updateTemplate)
    app.post('/admin/add_new_template', templates.addNewTemplate)
    app.post('/admin/remove_template', templates.removeColor)
    app.post('/admin/add_color_template', templates.addColor)
    app.post('/admin/send_notification_to_all',users_auth.sendNotification)
    app.post('/app/remove_color', templates.removeOneColor)
    app.post('/app/share_count', users_auth.countShare)

    app.post('/app/buca_request', users_auth.bucaRequest)
    app.get('/app/request_list', users_auth.check_auth, users_auth.getAllRequest)
    app.post('/app/accept_request', users_auth.check_auth, users_auth.acceptConnection, users_auth.makeConnection)
    app.get('/send', users_auth.sendNotic)


    //call notification u
    app.get('/app/call_notification', users_auth.check_auth, users_auth.callNotification)
    app.post('/app/group_call', users_auth.check_auth,users_auth.groupCall)
    app.post('/app/update_notification_status', users_auth.check_auth, users_auth.updateNotifications)
    app.get('/app/get_notifications', users_auth.check_auth, users_auth.getNotifications)
    app.get('/app/get_user', users_auth.getUser)
    app.post('/app/send_message_notification',users_auth.check_auth, users_auth.sendMessageNotification)
    app.post('/app/send_message_notification_group',users_auth.check_auth, users_auth.groupMessage)
    app.get('/app/dissconnect_call',users_auth.check_auth,users_auth.dissconnect_call)

    app.get('/app/get_data', users_auth.get_data)
    // app.post('/app/template-upload',users_auth.templateUpdate)
    app.get('/app/get-template-by-code',users_auth.getTEmplateByCode)
    // app.post('/admin/multipleImages', templates.addTemplateMultiple)


    // app.get('/app/get_notification', users_auth.check_auth, users_notification.get_notification);
    /* APP USERS END*/
    //  app.get('/reset_password', forgot_password.update_consumer_forgot_password)
    //  app.get('/reset_password_action', forgot_password.update_consumer_forgot_password_action)



}
