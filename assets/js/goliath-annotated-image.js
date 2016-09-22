(function($) {
    $.fn.annotatedImage = function() {
        var animating = false;
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
                    var noteId =  this.dataset.noteId;
                    $('#note-' + noteId).addClass('current');
                },
                focusout: function(){
                    var noteId =  this.dataset.noteId;
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

                $(this).parents('.acf-field.textarea').remove();
                $('#note-' + noteId ).remove();

                // Il faut maintenant changer toutes les notes qui on un ID supérieur a celui que l'on supprime
                do{
                    var newId = noteId;

                    var intId = noteId.substring( ( noteId.lastIndexOf('-') + 1 ) );
                    noteId = noteId.substring( 0, ( noteId.lastIndexOf('-') + 1 ) ) + ( ++intId );

                    var nextAnnotationExist = changeAnnotationId( noteId, newId);

                } while ( nextAnnotationExist );

            }
        });

        // On ajoute une note en cliquant sur l'image
        $( document ).on( 'click', '.annotated-image-wrapper.editable .annotated-image img' , function( e ) {

            var $image = $( this );
            var $container = $(this).parents( '.annotated-image-wrapper' );


            var idx = $( '.note', $container ).length + 1;

            var parentOffset = $image.offset();
            var relX = (e.pageX - parentOffset.left) / $image.width() * 100;
            var relY = (e.pageY - parentOffset.top) / $image.height() * 100;

            var fieldName = $container.data('fieldname');

            addInputNote($container, relX, relY, '', idx, fieldName);
            addNote($container, relX, relY, '', idx, fieldName);
        } );

        var syncContainerSizeWithImgSize = function($container) {
            var $img = $container.find('img');
            $container.width($img.width());
            $container.height($img.height());
        };

        var changeAnnotationId = function( oldId, newId){

            var annotationExist = false;

            var $noteToChange = $('#note-' + oldId );

            if( $noteToChange.length > 0 ){

                annotationExist = true;

                var intOldId = oldId.substring( ( oldId.lastIndexOf('-') + 1 ) );
                var intNewId = newId.substring( ( newId.lastIndexOf('-') + 1 ) );

                $noteToChange.attr('id', 'note-' + newId );

                var $textareaRelated = $('textarea[data-note-id="'+ oldId +'"]');
                $textareaRelated.attr('data-note-id', newId );

                var $deleteButton = $('a[data-note-id="'+ oldId +'"]');
                $deleteButton.attr('data-note-id', newId );

                // On remplace les name de tout les input
                var $filedParents = $textareaRelated.parents('.acf-field.textarea');

                $('input, textarea', $filedParents).each( function () {
                    var name = $(this).attr('name');
                    var newName = name.replace('[notes]['+ intOldId +']', '[notes]['+ intNewId +']' );
                    $(this).attr('name', newName );
                })

                // On remplace l'ID et le label
                var id = $textareaRelated.attr('id');
                var newAttrId = id.replace('notes_'+ intOldId , 'notes_'+ intNewId );
                $textareaRelated.attr('id', newAttrId );
                $('label', $filedParents).attr('for', newAttrId );

                var labelId = newId.substring( newId.lastIndexOf('-') + 1 );
                $filedParents.find( '.note-id').html( labelId );

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
        };

        var getNoteHtml = function( relX, relY, text, id, fieldname) {
            var noteHtml = '';

            var sanitizedFieldName = sanitizedId( fieldname );

            noteHtml = noteHtml + '<span class="note" id="note-'+ sanitizedFieldName +'-' + id + '" style="left:' + relX.toString() + '%; top:' + relY.toString() + '%">';
            noteHtml = noteHtml + '<span class="marker"></span>';
            noteHtml = noteHtml + '<span class="text">'+text+'</span>';
            noteHtml = noteHtml + '</span>';

            var $noteHtml = $(noteHtml);

            return $noteHtml;
        };

        var addNote = function($container, relX, relY, text, id, fieldname) {

            var $noteHtml = getNoteHtml( relX, relY, text, id, fieldname);

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

        var addInputNote = function( $container, relX, relY, text, idx, fieldName ){

            var noteInputHtml = '';

            var sanitizedFieldName = sanitizedId( fieldName );
            noteInputHtml += '<div class="acf-field textarea">';
            noteInputHtml += '<input type="hidden" name="' + fieldName + '[notes][' + idx.toString() + '][x]" value="' + relX.toString() + '" />';
            noteInputHtml += '<input type="hidden" name="' + fieldName + '[notes][' + idx.toString() + '][y]" value="' + relY.toString() + '" />';
            noteInputHtml += '<div class="acf-label"><label for="' + fieldName + '_notes_' + idx.toString() + '_text">Texte de la note n°<span class="note-id">'+ idx +'</span></label></div>';
            noteInputHtml += '<div class="acf-input">';
            noteInputHtml += '<textarea id="' + fieldName + '_notes_' + idx.toString() + '_text" name="' + fieldName + '[notes][' + idx.toString() + '][t]" class="note-input" data-note-id="'+ sanitizedFieldName +'-' + idx  +'">' + text + '</textarea>';
            noteInputHtml += '<a class="acf-icon -cancel" data-name="annotation-remove" data-note-id="'+ sanitizedFieldName +'-' + idx +'" href="#" title="Remove"></a>';
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

            var fieldname = 'note';
            var containeFieldName = $container.data('fieldname');
            if( typeof containeFieldName != 'undefined' ){
                fieldname = containeFieldName
            }

            for (var i in notes) {
                if (notes.hasOwnProperty(i)) {
                    var note = notes[i];
                    addNote($container, note.x, note.y, note.t, i, fieldname);
                }
            }

            var editable = $container.hasClass('editable');

            if( editable ){

                for ( i in notes) {
                    if (notes.hasOwnProperty(i)) {
                        note = notes[i];
                        addInputNote($container, note.x, note.y, note.t, i, fieldname);
                    }
                }
            }

        };

        var sanitizedId = function( fieldName ){

            return fieldName.replace( /(\[|])/g, '-' );
        }

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

            $image.attr('class', null);
            $image.attr('data-annotations', null);
            $image.attr('data-fieldname', null);

            $image.after( $container );
            $imageDiv.append( $image );

            var $acfModifyAndDeletedLink = $container.next().remove();
            $container.before( $acfModifyAndDeletedLink );

            loadData($container);

            if( ! $container.hasClass('editable')) {
                animateNotes($container);
            }

            $(window).resize(function() {
                syncContainerSizeWithImgSize($container);
            });
            syncContainerSizeWithImgSize($container);

            initiated = true;
        });
    };
}(jQuery));
