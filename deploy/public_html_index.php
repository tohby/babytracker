<?php

// Front controller for the shared-hosting layout. deploy.sh copies this to
// public_html/index.php and fills in __API_PATH__ with the absolute path to
// the Laravel app (<repo>/api). Don't edit the copy in public_html by hand.

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$apiPath = '__API_PATH__';

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $apiPath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $apiPath.'/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $apiPath.'/bootstrap/app.php';

// public_html lives outside the app folder, so tell Laravel where it is
// (needed for Vite's build/manifest.json and the storage symlink).
$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
