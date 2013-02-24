if(Meteor.isClient) {
    var changeOccured = function () {
        var timestamp = new Date().getTime();
        if(!CatWatch.callbackLastExecuted) {
            CatWatch.callbackLastExecuted = timestamp;
            return;
        }

        if( (timestamp - CatWatch.callbackLastExecuted) >= 1000) {
            CatWatch.callbackLastExecuted = timestamp;
            var currentBoard = Session.get('currentBoard').toLowerCase(),
                photoSnap = CatWatch.canvasSource.toDataURL(),
                data = {
                    board: currentBoard,
                    data: photoSnap,
                    timestamp: timestamp
                };
            Photos.insert(data);
        }
    };

    Template.webcam.helpers({
        hasWebCam: CatWatch.hasWebCam
    });

    Template.watch.error = function () {
        var errorMsg = Session.get('webcam-error');
        if(errorMsg) {
            return 'Your webcam is not functioning :(';
        }
    };

    Template.webcam.rendered = function () {
        if(CatWatch.hasWebCam()) {
            var self = this,
                video = this.find('#webcam'),
                params = {audio: true, video: true},
                setupStream = function (stream) {
                    if(window.webkitURL) {
                        stream = window.webkitURL.createObjectURL(stream);
                    }
                    video.src = stream;
                    CatWatch.canvasSource = self.find('#canvas-source');

                    (function () {
                        var canvasSource = self.find('#canvas-source'),
                            canvasBlended = self.find('#canvas-blended'),
                            contextSource = canvasSource.getContext('2d'),
                            contextBlended = canvasBlended.getContext('2d');

                        CatWatch.flipCam(contextSource);
                        CatWatch.update(contextSource, contextBlended, video, canvasSource, 25, changeOccured);
                    }());
                },
                handleError = function (e) {
                    Session.set('webcam-error', true);
                };
            if(navigator.getUserMedia) {
                navigator.getUserMedia(params, setupStream, handleError);
            } else if (navigator.webkitGetUserMedia) {
                navigator.webkitGetUserMedia(params, setupStream, handleError);
            }
        }
    };
}