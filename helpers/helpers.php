<?php

if (!function_exists('gacfai_get_field')) {

    function gacfai_get_field($selector, $post_id=false, $size = 'thumbnail', $icon=false, $attr='')
    {
        $field = get_field($selector, $post_id);

        if ($field) {
            wp_enqueue_script('jquery');
            wp_enqueue_script('goliath-annotated-image');
            wp_enqueue_style('goliath-annotated-image');

            $attachment_id = $field['media_id'];

            $size_class = $size;
            if ( is_array( $size_class ) ) {
                $size_class = join( 'x', $size_class );
            }

            $default_attr = array(
                'class' => " annotated-image attachment-$size_class size-$size_class",
                'data-annotations' => ($field['notes'])?json_encode($field['notes']):'',
            );

            $attr = wp_parse_args($attr, $default_attr);

            return wp_get_attachment_image($attachment_id, $size, $icon, $attr);
        }

        return '';
    }
}