(function($) {
    $.fn.annotatedImage = function() {
        var fieldName = 'notes';
        var animating = false;
        var idx = 0;
        var hndShowAnimate;
        var animTimeFade = 300;
        var animTimeBetweenNotes = 300;
        var initiated = false;

        // On set nos liceneur d'event
        $( document )
            .on({
                keyup: function() {
                    updateNoteText( $(this) );
                },
                focusin: function(){
                    var noteId = $(this).data('note-id');
                    $('#note-' + noteId).addClass('current');
                },
                focusout: function(){
                    var noteId = $(this).data('note-id');
                    $('#note-' + noteId).removeClass('current');
                }
            }, '.annotated-image-wrapper textarea');


        $( document ).on( 'click', '.annotated-image-wrapper span.note' , function() {
            displayRelatedTextarea($(this));
        });

        $( document ).on( 'click', '.annotated-image-wrapper .acf-icon.-cancel' , function( event ) {

            if( $(this).data('name') == 'annotation-remove' ){

                event.preventDefault();

                var noteId = $(this).data('note-id');

                console.log( noteId );
                $(this).parents('.acf-field.textarea').remove();
                $('#note-' + noteId ).remove();

                // Il faut maintenant changer toutes les notes qui on un ID supérieur a celui que l'on supprime
                do{
                    var newId = noteId;
                    noteId++;

                    var nextAnnotationExist = changeAnnotationId( noteId, newId);


                } while ( nextAnnotationExist );

                // On place le prochain id en comptant les notes actuellement placé
                idx = $( '.annotated-image-wrapper .note' ).length + 1;

            }

        });

        var changeAnnotationId = function( oldId, newId){

            var annotationExist = false;

            var $noteToChange = $('#note-' + oldId );

            if( $noteToChange.length > 0 ){

                annotationExist = true;

                $noteToChange.attr('id', 'note-' + newId );

                var $textareaRelated = $('textarea[data-note-id="'+ oldId +'"]');
                $textareaRelated.attr('data-note-id', newId );

                var $deleteButton = $('a[data-note-id="'+ oldId +'"]');
                $deleteButton.attr('data-note-id', newId );

                // On remplace les name de tout les input
                var $filedParents = $textareaRelated.parents('.acf-field.textarea');

                $('input, textarea', $filedParents).each( function () {
                    var name = $(this).attr('name');
                    var newName = name.replace('[notes]['+ oldId +']', '[notes]['+ newId +']' );
                    $(this).attr('name', newName );
                })

                // On remplace l'ID et le label
                var id = $textareaRelated.attr('id');
                var newAttrId = id.replace('notes_'+ oldId , 'notes_'+ newId );
                $textareaRelated.attr('id', newAttrId );
                $('label', $filedParents).attr('for', newAttrId );

                $filedParents.find( '.note-id').html( newId );

            }

            return annotationExist;
        };


        var displayRelatedTextarea = function($note) {

            if (initiated) {
                var noteId = $note.attr('id').substring( 5 );
                var $relatedTextarea = $('textarea[data-note-id="'+ noteId +'"]');
                $relatedTextarea.focus();
            }
        };

        var updateNoteText = function( $textarea ) {


            var text = $textarea.val();
            var noteId = $textarea.data('note-id');
            var $note = $('#note-' + noteId + ' .text' );

            $note.html((text)?text.replace(/\n/g, "<br />"):'');
            $note.css('margin-left', (-Math.ceil($note.width() / 2)).toString() + 'px');
        };

        var getNoteHtml = function( relX, relY, text, id) {
            var noteHtml = '';

            noteHtml = noteHtml + '<span class="note" id="note-'+ id +'" style="left:' + relX.toString() + '%; top:' + relY.toString() + '%">';
            noteHtml = noteHtml + '<span class="marker"></span>';
            noteHtml = noteHtml + '<span class="text"></span>';
            noteHtml = noteHtml + '</span>';

            var $noteHtml = $(noteHtml);

            return $noteHtml;
        };

        var addNote = function($container, relX, relY, text, id) {

            var $noteHtml = getNoteHtml( relX, relY, text, id);

            $('.annotated-image', $container).append($noteHtml);

            displayRelatedTextarea($noteHtml);
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

        var addInputNote = function( $container, relX, relY, text, idx ){

            var noteInputHtml = '';

            noteInputHtml += '<div class="acf-field textarea">';
            noteInputHtml += '<input type="hidden" name="' + fieldName + '[notes][' + idx.toString() + '][x]" value="' + relX.toString() + '" />';
            noteInputHtml += '<input type="hidden" name="' + fieldName + '[notes][' + idx.toString() + '][y]" value="' + relY.toString() + '" />';
            noteInputHtml += '<div class="acf-label"><label for="' + fieldName + '_notes_' + idx.toString() + '_text">Texte de la note n°<span class="note-id">'+ idx +'</span></label></div>';
            noteInputHtml += '<div class="acf-input">';
            noteInputHtml += '<textarea id="' + fieldName + '_notes_' + idx.toString() + '_text" name="' + fieldName + '[notes][' + idx.toString() + '][t]" class="note-input" data-note-id="'+ idx +'">' + text + '</textarea>';
            noteInputHtml += '<a class="acf-icon -cancel" data-name="annotation-remove" data-note-id="'+ idx +'" href="#" title="Remove"></a>';
            noteInputHtml += '</div>';
            noteInputHtml += '</div>';

            $container.append( noteInputHtml );

            updateNoteText( $( 'textarea', noteInputHtml ) );
        }

        var loadData = function($container) {
            var notes = $container.data('annotations');
            if (!notes) {
                notes = false;
            }

            for (var i in notes) {
                if (notes.hasOwnProperty(i)) {
                    var note = notes[i];
                    addNote($container, note.x, note.y, note.t, i);
                }
            }

            var editable = $container.hasClass('editable');

            if( editable ){

                for ( i in notes) {
                    if (notes.hasOwnProperty(i)) {
                        note = notes[i];
                        addInputNote($container, note.x, note.y, note.t, i);
                    }
                }
            }

            idx = Object.keys(notes).length + 1;
        };

        return this.each(function() {

            var $image = $(this);

            var $imageDiv = $('<div class="annotated-image"/>');

            var $container = $('<div class="annotated-image-wrapper" />')
                .addClass( $image.attr('class') )
                .removeClass('annotated-image')
                .append( $imageDiv )

            for( var dataName in $image.data() ){
                $container.attr( 'data-' + dataName, $image.attr( 'data-' + dataName ) );
            }

            if ($container.data('fieldname')) {
                fieldName = $container.data('fieldname');
            }

            $image.attr('class', null);
            $image.attr('data-annotations', null);
            $image.attr('data-fieldname', null);

            $image.after( $container );
            $imageDiv.append( $image );

            var $acfModifyAndDeletedLink = $container.next().remove();
            $container.before( $acfModifyAndDeletedLink );

            loadData($container);

            if ($container.hasClass('editable')) {

                $image.click(function(e) {
                    var parentOffset = $image.offset();
                    var relX = (e.pageX - parentOffset.left) / $image.width() * 100;
                    var relY = (e.pageY - parentOffset.top) / $image.height() * 100;
                    addInputNote($container, relX, relY, '', idx);
                    addNote($container, relX, relY, '', idx);
                    idx++;
                });
            } else {
                animateNotes($container);
            }

            initiated = true;
        });
    };
}(jQuery));
