=== Advanced Custom Fields: Annotated Image Field ===
Contributors: Alain Diart for Studio-Goliath
Tags: acf, field type, image, image with notes, annotated image, annotations
Requires at least: 3.5
Tested up to: 3.8.1
Stable tag: trunk
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

An ACF field type to handle image with annotations

== Description ==

With this plugin you can add markers over images with annotations.

= Compatibility =

This ACF field type is compatible with:
* ACF 5 only, no support for ACF 4

== Installation ==

1. Copy the `goliath-acf-annotated-image` folder into your `wp-content/plugins` folder
2. Activate the Image with notes plugin via the plugins admin page
3. Create a new field via ACF and select the Image with notes type
4. Please refer to the description for more info regarding the field type settings

== Use in your theme ==

1. Define your fields of type Annotated Image on ACF admin page
2. To load scripts and css as needed on front, in your functions.php add :

if (function_exists('gacfai_get_field')) {
    wp_register_style('goliath-annotated-image', plugins_url() . "/goliath-acf-annotated-image/assets/css/goliath-annotated-image.css", array(), '1.0');
    wp_register_script('goliath-annotated-image', plugins_url() . "/goliath-acf-annotated-image/assets/js/goliath-annotated-image.js", array('jquery'), '1.0');
}

// Note that you can define here your custom path to your own css and js

3. In your template, instead of get_field, use gacfai_get_field :

echo gacfai_get_field('my-field-name', $post_id, 'thumbnail', false, '');


== Changelog ==

= 1.0.0 =
* Initial Release.
