if(Meteor.isClient) {
    Template.catboard.currentBoard = function () {
        var currentBoard = Session.get('currentBoard');
        return currentBoard || '';
    };

    Template.catboard.events({
        'keyup #board-name': function (e) {
            var target = e.target,
                value = target.value;
            Meteor.Router.to('/' + value);
        }
    });

    Template.board.photos = function () {
        var currentBoard = Session.get('currentBoard').toLowerCase();
        return Photos.find({board: currentBoard});
    };
}