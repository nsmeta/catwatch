if(Meteor.isClient) {
    Meteor.Router.add({
        '/:board': function(board) {
            Session.set('currentBoard', board);
            return 'board';
        },

        '/:board/watch': function(board) {
            Session.set('currentBoard', board);
            return 'watch';
        }
    });
}