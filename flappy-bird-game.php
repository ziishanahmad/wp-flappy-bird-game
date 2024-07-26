<?php
/*
Plugin Name: Flappy Bird Game
Description: A simple Flappy Bird game as a WordPress plugin.
Version: 1.0
Author: Your Name
*/

// Enqueue necessary scripts and styles
function flappy_bird_enqueue_scripts() {
    wp_enqueue_style('flappy-bird-style', plugin_dir_url(__FILE__) . 'css/flappy-bird.css');
    wp_enqueue_script('flappy-bird-script', plugin_dir_url(__FILE__) . 'js/flappy-bird.js', array(), '1.0', true);

    // Pass the base URL to the JavaScript file
    wp_localize_script('flappy-bird-script', 'flappyBirdVars', array(
        'pluginUrl' => plugin_dir_url(__FILE__), // Use plugin_dir_url to get the plugin directory URL
    ));
}
add_action('wp_enqueue_scripts', 'flappy_bird_enqueue_scripts');

// Define the shortcode handler function
function flappy_bird_game_shortcode() {
    // Use output buffering to capture the template content
    ob_start();
    // Include the game template
    include plugin_dir_path(__FILE__) . 'templates/flappy-bird-game-template.php';
    // Return the captured content
    return ob_get_clean();
}

// Register the shortcode
add_shortcode('flappy_bird_game', 'flappy_bird_game_shortcode');
?>
