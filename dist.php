<?php

require __DIR__ . "/vendor/autoload.php";

use Patchwork\JSqueeze;
use MatthiasMullie\Minify;

// js
$jz = new JSqueeze();

$singleLine = true;
$keepImportantComments = false;
$specialVarRx = true;
// Retrieve the content of a JS file
$fatJs = [
	file_get_contents('www/js/vendor/jquery.min.js'),
	file_get_contents('www/js/vendor/modernizr-latest.js'),
	file_get_contents('www/js/vendor/webflow.js'),
	file_get_contents('www/js/vendor/moment-with-locales.min.js'),
	file_get_contents('www/js/vendor/jsrender.min.js'),
	file_get_contents('www/js/vendor/jquery.minicolors.js'),
	file_get_contents('www/js/vendor/jquery.datetimepicker.full.min.js'),
	file_get_contents('www/js/vendor/sweetalert.min.js'),
	file_get_contents('www/js/vendor/html2csv.js'),
	file_get_contents('www/js/firebase.js'),
	file_get_contents('www/js/helper.js'),
	file_get_contents('www/js/main.js')
];

$minifiedJs = $jz->squeeze(
    implode('',$fatJs),
    $singleLine,
    $keepImportantComments,
    $specialVarRx
);

file_put_contents("www/dist/js/vendor.js",$minifiedJs);

// individual 

$fats = ['autorizaciones.js','cuentas.js','implementaciones.js','lostandfound.js','menu.js','propuestas.js','publicaciones.js','reservas.js','telefonos_utiles.js'];

foreach($fats as $jsfile){
	$minified = $jz->squeeze(
	    file_get_contents('www/js/' . $jsfile),
	    $singleLine,
	    $keepImportantComments,
	    $specialVarRx
	);

	file_put_contents("www/dist/js/" . $jsfile,$minified);	
}

// css
$minifier = new Minify\CSS('www/css/normalize.css');
$minifier->add('www/css/webflow.css');
$minifier->add('www/css/lifein.webflow.css');
$minifier->add('www/css/sweetalert.css');
$minifier->add('www/css/slick.css');
$minifier->add('www/css/slick-theme.css');
$minifier->minify('www/dist/css/bundle.css');