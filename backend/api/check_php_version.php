<?php
// ไฟล์นี้ใช้สำหรับตรวจสอบ PHP version และ features
header('Content-Type: application/json');

$info = array(
    'php_version' => phpversion(),
    'php_major_version' => PHP_MAJOR_VERSION,
    'php_minor_version' => PHP_MINOR_VERSION,
    'server_software' => isset($_SERVER['SERVER_SOFTWARE']) ? $_SERVER['SERVER_SOFTWARE'] : 'Unknown',
    'features' => array(
        'password_hash' => function_exists('password_hash'),
        'password_verify' => function_exists('password_verify'),
        'json_encode' => function_exists('json_encode'),
        'pdo' => class_exists('PDO'),
        'mysqli' => class_exists('mysqli')
    )
);

echo json_encode($info, JSON_PRETTY_PRINT);
?>
