<?php

/*
 *  Plugin Name:    Advanced Custom Fields: Annotated Image Field
 *  Plugin URI:     https://github.com/studio-goliath/goliath-acf-annotated-image
 *  Description:    An ACF 5 field type to handle annotated images
 *  Version:        1.0.0
 *  Author:         Alain Diart for Studio-Goliath
 *  Author URI:     http://studio-goliath.com
 *  License:        GPLv2 or later
 *  License URI:    http://www.gnu.org/licenses/gpl-2.0.html
 */

if (!defined('ABSPATH'))
    exit;

if (!class_exists('acf_plugin_annotated-image')) :

    class acf_plugin_annotated_image
    {

        function __construct()
        {
            $this->settings = array(
                'version' => '1.0.0',
                'url' => plugin_dir_url(__FILE__),
                'path' => plugin_dir_path(__FILE__)
            );

            load_plugin_textdomain('goliath-acf-annotated-image', false, plugin_basename(dirname(__FILE__)) . '/lang');

            add_action('acf/include_field_types', array($this, 'include_field_types'));
        }

        function include_field_types()
        {
            include_once('fields/acf-annotated-image-v5.php');
            new acf_field_annotated_image($this->settings);
        }

    }

    new acf_plugin_annotated_image();

endif;
