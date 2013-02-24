if(Meteor.isClient) {
    var getUserMedia =  navigator.getUserMedia ||
                        navigator.webkitGetUserMedia;
    CatWatch = {};
    
    CatWatch.hasWebCam = function () {
        return (getUserMedia ? true : false);
    };

    CatWatch.flipCam = function (context) {
        context.translate(context.canvas.width, 0);
        context.scale(-1, 1);
    };

    CatWatch.drawVideo = function (context, video) {
        context.drawImage(video, 0, 0, video.width, video.height);
    };

    CatWatch.blend = function (canvas, contextSource, contextBlended) {
        var threshold = function (value) {
            return (value > 0x15) ? 0xFF : 0;
        };

        var difference = function (target, data1, data2) {
            if (data1.length != data2.length) return null;
                var i = 0;
                while (i < (data1.length * 0.25)) {
                    var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
                    var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
                    var diff = threshold(Math.abs(average1 - average2));
                    target[4*i] = diff;
                    target[4*i+1] = diff;
                    target[4*i+2] = diff;
                    target[4*i+3] = 0xFF;
                    ++i;
                }
        };

        var width = canvas.width,
            height = canvas.height,
            sourceData = contextSource.getImageData(0, 0, width, height),
            blendedData = contextSource.createImageData(width, height);

        if(!CatWatch.lastImageData) {
            CatWatch.lastImageData = sourceData;
        }

        difference(blendedData.data, sourceData.data, CatWatch.lastImageData.data);
        contextBlended.putImageData(blendedData, 0, 0);
        CatWatch.lastImageData = sourceData;
    };

    CatWatch.checkAreas = function(contextBlended, callback) {
        var blendedData = contextBlended.getImageData(
                                                      0,    // X
                                                      0,    // Y
                                                      640,  // width
                                                      480); // height
        var i = 0,
            average = 0;

        while(i < (blendedData.data.length / 4)) {
            average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
            ++i;
        }

        average = Math.round(average / (blendedData.data.length / 4));

        if(average > 1) {
            callback();
        }
    };

    CatWatch.update = function (contextSource, contextBlended, video, canvas, fps, callback) {
        var args = arguments,
            self = this;
        CatWatch.drawVideo(contextSource, video);
        CatWatch.blend(canvas, contextSource, contextBlended);
        CatWatch.checkAreas(contextBlended, callback);
        CatWatch.timeOut = setTimeout(function () {
            CatWatch.update.apply(self, args);
        }, 1000 / fps);
    };
}