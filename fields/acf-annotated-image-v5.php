<?php
// exit if accessed directly
if (!defined('ABSPATH'))
    exit;


if (!class_exists('acf_field_annotated_image')) :

    class acf_field_annotated_image extends acf_field
    {
        function __construct($settings)
        {
            $this->settings = $settings;

            $this->name = 'annotated-image';
            $this->label = __('Annotated image', 'acf-annotated-image');

            $this->category = 'content';
            $this->defaults = array(
                'preview_size' => 'large',
                'library' => 'all',
                'min_width' => 0,
                'min_height' => 0,
                'min_size' => 0,
                'max_width' => 0,
                'max_height' => 0,
                'max_size' => 0,
                'mime_types' => ''
            );
            $this->l10n = array(
                'select' => __("Select Image", 'acf'),
                'edit' => __("Edit Image", 'acf'),
                'update' => __("Update Image", 'acf'),
                'uploadedTo' => __("Uploaded to this post", 'acf'),
                'all' => __("All images", 'acf'),
            );

            add_filter('get_media_item_args', array($this, 'get_media_item_args'));
            add_filter('wp_prepare_attachment_for_js', array($this, 'wp_prepare_attachment_for_js'), 10, 3);

            parent::__construct();
        }

        function input_admin_enqueue_scripts()
        {
            $url = $this->settings['url'];
            $version = $this->settings['version'];

            wp_register_script('goliath-annotated-image', "{$url}/assets/js/goliath-annotated-image.js", array('jquery'), $version);
            wp_register_script('acf-input-annotated-image', "{$url}/assets/js/input.js", array('acf-input', 'goliath-annotated-image'), $version);

            wp_enqueue_script('jquery');
            wp_enqueue_script('goliath-annotated-image');
            wp_enqueue_script('acf-input-annotated-image');

            wp_register_style('goliath-annotated-image', "{$url}/assets/css/goliath-annotated-image.css", array(), $version);
            wp_register_style('acf-input-annotated-image', "{$url}/assets/css/input.css", array('acf-input'), $version);

            wp_enqueue_style('acf-input-annotated-image');
            wp_enqueue_style('goliath-annotated-image');
        }

        function render_field($field)
        {
            $uploader = acf_get_setting('uploader');

            if ($uploader == 'wp') {
                acf_enqueue_uploader();
            }

            $url = '';
            $alt = '';
            $div = array(
                'class' => 'acf-annotated-image-uploader acf-cf',
                'data-preview_size' => $field['preview_size'],
                'data-library' => $field['library'],
                'data-mime_types' => $field['mime_types'],
                'data-uploader' => $uploader
            );

            $field['value'] = acf_parse_args($field['value'], array(
                'media_id' => '',
                'notes' => '',
            ));

            if ($field['value']) {

                $url = wp_get_attachment_image_src($field['value']['media_id'], $field['preview_size']);
                $alt = get_post_meta($field['value']['media_id'], '_wp_attachment_image_alt', true);

                if ($url) {
                    $url = $url[0];
                }

                if ($url) {
                    $div['class'] .= ' has-value';
                }
            }

            $size = acf_get_image_size($field['preview_size']);
            ?>
            <div <?php acf_esc_attr_e($div); ?>>
                <div class="acf-hidden">
            <?php acf_hidden_input(array('name' => $field['name'] . '[media_id]', 'value' => $field['value']['media_id'], 'class' => 'value-hidden-field')); ?>
                    <?php //acf_hidden_input(array( 'name' => $field['name'].'[notes]', 'value' => $field['value']['notes'], 'class' => 'notes-hidden-field' ));  ?>
                </div>
                <div class="view show-if-value acf-soh" <?php if ($size['width']) echo 'style="max-width: ' . $size['width'] . 'px"'; ?>>
                    <img data-name="image" src="<?php echo $url; ?>" alt="<?php echo $alt; ?>" class="annotated-image editable" data-annotations='<?php echo esc_attr(($field['value']['notes'])?json_encode($field['value']['notes']):''); ?>' data-fieldname="<?php echo $field['name']; ?>"/>
                    <ul class="acf-hl acf-soh-target">
            <?php if ($uploader != 'basic'): ?>
                            <li><a class="acf-icon -pencil dark" data-name="edit" href="#" title="<?php _e('Edit', 'acf'); ?>"></a></li>
                        <?php endif; ?>
                        <li><a class="acf-icon -cancel dark" data-name="remove" href="#" title="<?php _e('Remove', 'acf'); ?>"></a></li>
                    </ul>
                </div>
                <div class="view hide-if-value">
            <?php if ($uploader == 'basic'): ?>

                <?php if ($field['value'] && !is_numeric($field['value'])): ?>
                    <div class="acf-error-message"><p><?php echo $field['value']; ?></p></div>
                <?php endif; ?>

                <input type="file" name="<?php echo $field['name']; ?>" id="<?php echo $field['id']; ?>" />

            <?php else: ?>

                <p style="margin:0;"><?php _e('No image selected', 'acf'); ?> <a data-name="add" class="acf-button button" href="#"><?php _e('Add Image', 'acf'); ?></a></p>

            <?php endif; ?>
                </div>
            </div>
            <?php
        }

        /**
         *  render_field_settings()
         *
         *  Create extra options for your field. This is rendered when editing a field.
         *  The value of $field['name'] can be used (like bellow) to save extra data to the $field
         *
         *  @type	action
         *  @since	3.6
         *  @date	23/01/13
         *
         *  @param	$field	- an array holding all the field's data
         */
        function render_field_settings($field)
        {
            // clear numeric settings
            $clear = array(
                'min_width',
                'min_height',
                'min_size',
                'max_width',
                'max_height',
                'max_size'
            );

            foreach ($clear as $k) {

                if (empty($field[$k])) {

                    $field[$k] = '';
                }
            }

            // preview_size
            acf_render_field_setting($field, array(
                'label' => __('Preview Size', 'acf'),
                'instructions' => __('Shown when entering data', 'acf'),
                'type' => 'select',
                'name' => 'preview_size',
                'choices' => acf_get_image_sizes()
            ));

            // library
            acf_render_field_setting($field, array(
                'label' => __('Library', 'acf'),
                'instructions' => __('Limit the media library choice', 'acf'),
                'type' => 'radio',
                'name' => 'library',
                'layout' => 'horizontal',
                'choices' => array(
                    'all' => __('All', 'acf'),
                    'uploadedTo' => __('Uploaded to post', 'acf')
                )
            ));

            // min
            acf_render_field_setting($field, array(
                'label' => __('Minimum', 'acf'),
                'instructions' => __('Restrict which images can be uploaded', 'acf'),
                'type' => 'text',
                'name' => 'min_width',
                'prepend' => __('Width', 'acf'),
                'append' => 'px',
            ));

            acf_render_field_setting($field, array(
                'label' => '',
                'type' => 'text',
                'name' => 'min_height',
                'prepend' => __('Height', 'acf'),
                'append' => 'px',
                'wrapper' => array(
                    'data-append' => 'min_width'
                )
            ));

            acf_render_field_setting($field, array(
                'label' => '',
                'type' => 'text',
                'name' => 'min_size',
                'prepend' => __('File size', 'acf'),
                'append' => 'MB',
                'wrapper' => array(
                    'data-append' => 'min_width'
                )
            ));

            // max
            acf_render_field_setting($field, array(
                'label' => __('Maximum', 'acf'),
                'instructions' => __('Restrict which images can be uploaded', 'acf'),
                'type' => 'text',
                'name' => 'max_width',
                'prepend' => __('Width', 'acf'),
                'append' => 'px',
            ));

            acf_render_field_setting($field, array(
                'label' => '',
                'type' => 'text',
                'name' => 'max_height',
                'prepend' => __('Height', 'acf'),
                'append' => 'px',
                'wrapper' => array(
                    'data-append' => 'max_width'
                )
            ));

            acf_render_field_setting($field, array(
                'label' => '',
                'type' => 'text',
                'name' => 'max_size',
                'prepend' => __('File size', 'acf'),
                'append' => 'MB',
                'wrapper' => array(
                    'data-append' => 'max_width'
                )
            ));

            // allowed type
            acf_render_field_setting($field, array(
                'label' => __('Allowed file types', 'acf'),
                'instructions' => __('Comma separated list. Leave blank for all types', 'acf'),
                'type' => 'text',
                'name' => 'mime_types',
            ));
        }

        /**
         *  format_value()
         *
         *  This filter is appied to the $value after it is loaded from the db and before it is returned to the template
         *
         *  @type	filter
         *  @since	3.6
         *  @date	23/01/13
         *
         *  @param	$value (mixed) the value which was loaded from the database
         *  @param	$post_id (mixed) the $post_id from which the value was loaded
         *  @param	$field (array) the field array holding all the field options
         *
         *  @return	$value (mixed) the modified value
         */
        function format_value($value, $post_id, $field)
        {
            // bail early if no value
            if (empty($value))
                return false;

            // return
            return $value;
        }

        /**
         *  get_media_item_args
         *
         *  description
         *
         *  @type	function
         *  @date	27/01/13
         *  @since	3.6.0
         *
         *  @param	$vars (array)
         *  @return	$vars
         */
        function get_media_item_args($vars)
        {
            $vars['send'] = true;
            return($vars);
        }

        /**
         *  wp_prepare_attachment_for_js
         *
         *  this filter allows ACF to add in extra data to an attachment JS object
         *  This sneaky hook adds the missing sizes to each attachment in the 3.5 uploader.
         *  It would be a lot easier to add all the sizes to the 'image_size_names_choose' filter but
         *  then it will show up on the normal the_content editor
         *
         *  @type	function
         *  @since:	3.5.7
         *  @date	13/01/13
         *
         *  @param	{int}	$post_id
         *  @return	{int}	$post_id
         */
        function wp_prepare_attachment_for_js($response, $attachment, $meta)
        {
            // only for image
            if ($response['type'] != 'image') {
                return $response;
            }

            // make sure sizes exist. Perhaps they dont?
            if (!isset($meta['sizes'])) {
                return $response;
            }

            $attachment_url = $response['url'];
            $base_url = str_replace(wp_basename($attachment_url), '', $attachment_url);

            if (isset($meta['sizes']) && is_array($meta['sizes'])) {

                foreach ($meta['sizes'] as $k => $v) {

                    if (!isset($response['sizes'][$k])) {

                        $response['sizes'][$k] = array(
                            'height' => $v['height'],
                            'width' => $v['width'],
                            'url' => $base_url . $v['file'],
                            'orientation' => $v['height'] > $v['width'] ? 'portrait' : 'landscape',
                        );
                    }
                }
            }

            return $response;
        }

        /**
         *  update_value()
         *
         *  This filter is appied to the $value before it is updated in the db
         *
         *  @type	filter
         *  @since	3.6
         *  @date	23/01/13
         *
         *  @param	$value - the value which will be saved in the database
         *  @param	$post_id - the $post_id of which the value will be saved
         *  @param	$field - the field array holding all the field options
         *
         *  @return	$value - the modified value
         */
        function update_value($value, $post_id, $field)
        {
            return $value;
        }
    }

endif;
