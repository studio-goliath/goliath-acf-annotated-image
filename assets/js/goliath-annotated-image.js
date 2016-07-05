(function($) {
    $.fn.annotatedImage = function() {
        var fieldName = 'notes';
        var idx = 1;
        var animating = false;
        var hndShowAnimate;
        var animTimeFade = 'slow';
        var animTimeBetweenNotes = 1000;
        var initiated = false;

        var displayRelatedTextarea = function($note) {
            $note.parent().parent().find('.textarea').hide();
            var $relatedTextarea = $note.parent().find('.textarea');
            if (initiated) {
                $relatedTextarea.show().find('textarea').focus();
            }
        };

        var attachNoteEvents = function(editable, $noteHtml) {
            if (editable) {
                var $textarea = $noteHtml.find('.textarea');
                $textarea.find('textarea')
                    .keyup(function() {
                        updateNoteText($noteHtml, $(this).val());
                    })
                    .blur(function() {
                        $textarea.hide();
                    });

                $textarea.hide();
                var $note = $noteHtml.find('span.note');
                $note.click(function() {
                    displayRelatedTextarea($(this));
                });
            }
        };

        var updateNoteText = function($parent, text) {
            var $text = $parent.find('span.text');
            $text.html((text)?text.replace(/\n/g, "<br />"):'');
            $text.css('margin-left', (-Math.ceil($text.width() / 2)).toString() + 'px');
        };

        var getNoteHtml = function(editable, relX, relY, text, idx) {
            var noteHtml = '';

            noteHtml = noteHtml + '<span>';
            noteHtml = noteHtml + '<span class="note" style="left:' + relX.toString() + '%; top:' + relY.toString() + '%">';
            noteHtml = noteHtml + '<span class="marker"></span>';
            noteHtml = noteHtml + '<span class="text"></span>';
            noteHtml = noteHtml + '</span>';
            if (editable) {
                noteHtml = noteHtml + '<input type="hidden" name="' + fieldName + '[notes][' + idx.toString() + '][x]" value="' + relX.toString() + '" />';
                noteHtml = noteHtml + '<input type="hidden" name="' + fieldName + '[notes][' + idx.toString() + '][y]" value="' + relY.toString() + '" />';
                noteHtml = noteHtml + '<div class="textarea">';
                noteHtml = noteHtml + '<div class="acf-label"><label for="' + fieldName + '_notes_' + idx.toString() + '_text">Texte de la note</label></div>';
                noteHtml = noteHtml + '<div class="acf-input">';
                noteHtml = noteHtml + '<textarea id="' + fieldName + '_notes_' + idx.toString() + '_text" name="' + fieldName + '[notes][' + idx.toString() + '][t]" class="note-input">' + text + '</textarea>';
                noteHtml = noteHtml + '</div>';
                noteHtml = noteHtml + '</div>';
            }

            noteHtml = noteHtml + '</span>';

            var $noteHtml = $(noteHtml);

            return $noteHtml;
        };

        var addNote = function($container, relX, relY, text) {
            var editable = $container.hasClass('editable');

            var $noteHtml = getNoteHtml(editable, relX, relY, text, idx);

            $container.append($noteHtml);

            updateNoteText($noteHtml, text);
            attachNoteEvents(editable, $noteHtml);
            displayRelatedTextarea($noteHtml);

            idx++;
        };

        var showNextNote = function($container) {
            if (!animating) {
                animating = true;
                var $nextNote = showNextNoteInterval($container);
                if ($nextNote.length > 0) {
                    hndShowAnimate = setInterval(function() {
                        if ($container.filter(':hover').length > 0) {
                            showNextNoteInterval($container);
                        } else {
                            $nextNote = hideNextNoteInterval($container);
                            if ($nextNote.length <= 0) {
                                animating = false;
                                clearInterval(hndShowAnimate);
                            }
                        }
                    }, animTimeBetweenNotes);
                }
            }
        };

        var showNextNoteInterval = function($container) {
            var $nextNote = $container.find('.note .text:not(.shown):first()');
            if ($nextNote.length > 0) {
                $nextNote.fadeIn(animTimeFade, function() {
                    $nextNote.addClass('shown');
                });
            }
            return $nextNote;
        };

        var hideNextNoteInterval = function($container) {
            var $nextNote = $container.find('.note .text.shown:last()');
            if ($nextNote.length > 0) {
                $nextNote.fadeOut(animTimeFade, function() {});
                $nextNote.removeClass('shown');
            }
            return $nextNote;
        };

        var animateNotes = function($container) {
            var $allTexts = $container.find('.note .text');
            $allTexts.hide().removeClass('shown');

            $container.hover(function() { // mouseenter
                showNextNote($container);
            }, function() { // mouseleave
                showNextNote($container);
            });
        };

        var loadData = function($container) {
            var notes = $container.data('annotations');
            if (!notes) {
                notes = false;
            }

            for (var i in notes) {
                if (notes.hasOwnProperty(i)) {
                    var note = notes[i];
                    addNote($container, note.x, note.y, note.t);
                }
            }
        };

        return this.each(function() {

            var $image = $(this);

            var $container =
                $('<div></div>')
                    .attr('class', $image.attr('class'))
                    .attr('data-annotations', $image.attr('data-annotations'))
                    .attr('data-fieldname', $image.attr('data-fieldname'));

            if ($container.data('fieldname')) {
                fieldName = $container.data('fieldname');
            }

            $image.attr('class', null);
            $image.attr('data-annotations', null);
            $image.attr('data-fieldname', null);

            $container = $image.wrap($container).parent();

            loadData($container);

            if ($container.hasClass('editable')) {
                $image.click(function(e) {
                    var parentOffset = $image.offset();
                    var relX = (e.pageX - parentOffset.left) / $image.width() * 100;
                    var relY = (e.pageY - parentOffset.top) / $image.height() * 100;
                    addNote($container, relX, relY, '');
                });
            } else {
                animateNotes($container);
            }

            initiated = true;
        });
    };
}(jQuery));
