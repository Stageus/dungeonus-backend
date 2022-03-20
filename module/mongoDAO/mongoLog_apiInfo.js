// In log, name of the place where the API was called

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
        read_posting: "get_posting",
        total_posting: "get_total",
        create_posting: "post_posting",
        update_posting: "put_posting",
        delete_posting: "delete_posting",
        search_title: "post_searchtitle",
        read_board_postings: "get_boardpostings"
    },
    comment: {
        read_comment: "get_comment",
        total_comment: "get_total",
        create_comment: "post_comment",
        update_comment: "put_comment",
        delete_comment: "delete_comment"
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