(function($){

    acf.fields.annotated_image = acf.field.extend({

        type: 'annotated_image',
        $el: null,
        $input: null,
        $img: null,

        actions: {
            'ready':	'initialize',
            'append':	'initialize'
        },

        events: {
            'click a[data-name="add"]': 	'add',
            'click a[data-name="edit"]': 	'edit',
            'click a[data-name="remove"]':	'remove',
            'change input[type="file"]':	'change'
        },

        /*
        *  focus
        *
        *  This function will setup variables when focused on a field
        *
        *  @type	function
        *  @date	12/04/2016
        *  @since	5.3.8
        *
        *  @param	n/a
        *  @return	n/a
        */

        focus: function(){

            // vars
            this.$el = this.$field.find('.acf-annotated-image-uploader');
            this.$input = this.$el.find('input[type="hidden"].value-hidden-field');
            this.$img = this.$el.find('img');

            // options
            this.o = acf.get_data( this.$el );

        },


        /*
        *  initialize
        *
        *  This function is used to setup basic upload form attributes
        *
        *  @type	function
        *  @date	12/04/2016
        *  @since	5.3.8
        *
        *  @param	n/a
        *  @return	n/a
        */

        initialize: function(){

            // add attribute to form
            if( this.o.uploader == 'basic' ) {

                this.$el.closest('form').attr('enctype', 'multipart/form-data');

            }


        },


        /*
        *  prepare
        *
        *  This function will prepare an object of attachment data
        *  selecting a library image vs embed an image via url return different data
        *  this function will keep the 2 consistent
        *
        *  @type	function
        *  @date	12/04/2016
        *  @since	5.3.8
        *
        *  @param	attachment (object)
        *  @return	data (object)
        */

        prepare: function( attachment ) {

            // defaults
            attachment = attachment || {};


            // bail ealry if already valid
            if( attachment._valid ) return attachment;


            // vars
            var data = {
                url: '',
                alt: '',
                title: '',
                caption: '',
                description: '',
                width: 0,
                height: 0
            };


            // wp image
            if( attachment.id ) {

                // update data
                data = attachment.attributes;


                // maybe get preview size
                data.url = acf.maybe_get(data, 'sizes.'+this.o.preview_size+'.url', data.url);

            }


            // valid
            data._valid = true;


            // return
            return data;

        },


        /*
        *  render
        *
        *  This function will render the UI
        *
        *  @type	function
        *  @date	12/04/2016
        *  @since	5.3.8
        *
        *  @param	attachment (obj)
        *  @return	n/a
        */

        render: function( data ){

            // prepare
            data = this.prepare(data);


            // update image
            this.$img.attr({
                src: data.url,
                alt: data.alt,
                title: data.title
            });


            // vars
            var val = '';


            // WP attachment
            if( data.id ) {

                val = data.id;

            }


            // update val
            acf.val( this.$input, val );

            // update class
            if( val ) {

                this.$el.addClass('has-value');

            } else {

                this.$el.removeClass('has-value');

            }

        },


        /*
        *  add
        *
        *  event listener
        *
        *  @type	function
        *  @date	12/04/2016
        *  @since	5.3.8
        *
        *  @param	e (event)
        *  @return	n/a
        */

        add: function() {

            // reference
            var self = this,
                $field = this.$field;


            // get repeater
            var $repeater = acf.get_closest_field( this.$field, 'repeater' );


            // popup
            var frame = acf.media.popup({

                title:		acf._e('image', 'select'),
                mode:		'select',
                type:		'image',
                field:		$field.data('key'),
                multiple:	$repeater.exists(),
                library:	this.o.library,
                mime_types: this.o.mime_types,

                select: function( attachment, i ) {

                    // select / add another image field?
                    if( i > 0 ) {

                        // vars
                        var key = $field.data('key'),
                            $tr = $field.closest('.acf-row');


                        // reset field
                        $field = false;


                        // find next image field
                        $tr.nextAll('.acf-row:visible').each(function(){

                            // get next $field
                            $field = acf.get_field( key, $(this) );


                            // bail early if $next was not found
                            if( !$field ) return;


                            // bail early if next file uploader has value
                            if( $field.find('.acf-annotated-image-uploader.has-value').exists() ) {

                                $field = false;
                                return;

                            }


                            // end loop if $next is found
                            return false;

                        });


                        // add extra row if next is not found
                        if( !$field ) {

                            $tr = acf.fields.repeater.doFocus( $repeater ).add();


                            // bail early if no $tr (maximum rows hit)
                            if( !$tr ) return false;


                            // get next $field
                            $field = acf.get_field( key, $tr );

                        }

                    }


                    // render
                    self.set('$field', $field).render( attachment );


                }

            });

        },


        /*
        *  edit
        *
        *  event listener
        *
        *  @type	function
        *  @date	12/04/2016
        *  @since	5.3.8
        *
        *  @param	e (event)
        *  @return	n/a
        */

        edit: function() {

            // reference
            var self = this,
                $field = this.$field;


            // vars
            var val = this.$input.val();


            // bail early if no val
            if( !val ) return;


            // popup
            var frame = acf.media.popup({

                title:		acf._e('image', 'edit'),
                button:		acf._e('image', 'update'),
                mode:		'edit',
                attachment:	val,

                select:	function( attachment, i ) {

                    // render
                    self.set('$field', $field).render( attachment );

                }

            });

        },


        /*
        *  remove
        *
        *  event listener
        *
        *  @type	function
        *  @date	12/04/2016
        *  @since	5.3.8
        *
        *  @param	e (event)
        *  @return	n/a
        */

        remove: function() {

            // vars
            var attachment = {};


            // add file to field
            this.render( attachment );

        },


        /*
        *  change
        *
        *  This function will update the hidden input when selecting a basic file to clear validation errors
        *
        *  @type	function
        *  @date	12/04/2016
        *  @since	5.3.8
        *
        *  @param	e (event)
        *  @return	n/a
        */

        change: function( e ){

            this.$input.val( e.$el.val() );

        }

    });

    acf.add_action('ready', function( $el ){

        // $el will be equivalent to $('body')


        // find a specific field
        $('img.annotated-image').annotatedImage();

    });

/*
    $(document).ready(function() {

        var $img = $('.acf-annotated-image-uploader img');
        $img
            .imgNotes({
                "zoomable": false,
                "canEdit": true,
                "vAll": "bottom",
                "onAdd": function() {
                    return  $(document.createElement('span')).addClass("marker black").html(this.noteCount);
                },
                "onEdit": function(ev, elem) {
                    var $elem = $(elem);
                    $('#NoteDialog').remove();
                    return $('<div id="NoteDialog"></div>').dialog({
                        title: "Note Editor",
                        resizable: false,
                        modal: true,
                        height: "300",
                        width: "450",
                        position: { my: "left bottom", at: "right top", of: elem},
                        buttons: {
                            "Save": function() {
                                var txt = $('textarea', this).val();
                                $elem.data("note", txt);
                                $(this).dialog("close");
                                $('.notes-hidden-field').val(JSON.stringify($img.imgNotes("export")));
                                console.log($img.imgNotes("export"));
                            },
                            "Delete": function() {
                                $elem.trigger("remove");
                                $(this).dialog("close");
                            },
                        },
                        open: function() {
                            $(this).css("overflow", "hidden");
                            var textarea = $('<textarea id="txt" style="height:100%; width:100%;">');
                            $(this).html(textarea);
                            textarea.val($elem.data("note"));
                        }
                    });
                }
            });
    });
*/

})(jQuery);