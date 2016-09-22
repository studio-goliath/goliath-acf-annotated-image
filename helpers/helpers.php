<?php

if (!function_exists('gacfai_get_field')) {

    function gacfai_get_image($field, $size = 'thumbnail', $icon=false, $attr='')
    {
        if ($field) {
            wp_enqueue_script('jquery');
            wp_enqueue_script('goliath-annotated-image');
            wp_enqueue_style('goliath-annotated-image');

            if (isset($field['media_id'])) {
                $attachment_id = $field['media_id'];

                $size_class = $size;
                if ( is_array( $size_class ) ) {
                    $size_class = join( 'x', $size_class );
                }

                $notes = array();
                if (isset($field['notes']) && is_array($notes)) {
                    $notes = $field['notes'];
                }

                $default_attr = array(
                    'class' => " annotated-image attachment-$size_class size-$size_class",
                    'data-annotations' => json_encode($notes),
                );

                $attr = wp_parse_args($attr, $default_attr);

                return wp_get_attachment_image($attachment_id, $size, $icon, $attr);
            }
        }

        return '';
    }

    function gacfai_get_field($selector, $post_id=false, $size = 'thumbnail', $icon=false, $attr='')
    {
        $field = get_field($selector, $post_id);

        return gacfai_get_image($field, $size, $icon, $attr);
    }

    function gacfai_get_sub_field($selector, $post_id=false, $size = 'thumbnail', $icon=false, $attr='')
    {
        $field = get_sub_field($selector, $post_id);

        return gacfai_get_image($field, $size, $icon, $attr);
    }
}