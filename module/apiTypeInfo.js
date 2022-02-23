const APIInfo = {
    account: {
        login: "post_login",
        logout: "post_logout",
        delete_account: "delete_account",
        modify_account: "put_account",
        create_account: "post_account",
        total_accont: "get_total",
        change_pw: "post_changepw",
        autologin: "get_autologin",
        refresh_session: "get_refreshsession",
        check_session: "get_checksession",
    },
    board: {

    },
    comment: {

    },
    profile: {
        show: "post_profile",
        modify: "put_profile",
    },
    search:{
        search_board: "post_myboard",
        search_comment: "post_mycomment",
    },
}

module.exports = APIInfo;