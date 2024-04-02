/**
 * Created by initr on 11.09.2017.
 */


function isExistTargetProp(event) {
    return event.originalEvent.dataTransfer.files.length > 0 ? event.originalEvent.dataTransfer.files : false;
}

$.fn.extend({
    filedrop: function (options) {
        var fromBrowser = false;
        var defaults = {
            callback: null
        };
        options = $.extend(defaults, options);
        return this.each(function () {
            var $this = $(this);
            // Stop default browser actions
            $this.unbind('dragstart dragover dragleave drop');
            $this.bind('dragover dragstart', function (event) {

                // if(
                //     !$(event.originalEvent.target).hasClass('dd-dots') &&
                //     !$(event.target).hasClass('imfx-allow-dnd') &&
                //     !event.target.hasAttribute('gridstackitem') &&
                //     !$(event.originalEvent.target).is('.slick-cell, .skipSelection')
                // ) {
                //
                // }
                if ((<any>event.originalEvent).dataTransfer &&
                    (<any>event.originalEvent).dataTransfer.types) {
                    var needPrevent = false;
                    $.each((<any>event.originalEvent).dataTransfer.types, (k, type) => {
                        if (type === 'Files') {
                            needPrevent = true;
                            return false;
                        }
                    });

                    if (needPrevent) {
                        event.originalEvent.preventDefault();
                        if (options.onDragOver && !fromBrowser) {
                            options.onDragOver(event);
                        }
                    }
                }
            });

            $this.bind('dragleave', function (event) {
                if (options.onDragLeave) {
                    options.onDragLeave(event);
                }
            });


            // Catch drop event
            $this.bind('drop', function (event) {
                var files = isExistTargetProp(event);
                if (!!files === false) {
                    return true;
                } else {
                    event.preventDefault();
                    if (fromBrowser) {
                        fromBrowser = false;
                        return false;
                    }
                    if (options.callback) {
                        options.callback(files, event);
                    }
                }
            });
        });
    }
});
