<?php
// ==============================================================
//  CORS helper — include ไฟล์นี้แทนการ hardcode origins ในทุก API
//  origins ที่อนุญาตกำหนดใน backend/configs/config.php
// ==============================================================
require_once __DIR__ . '/config.php';

$_cors_origins = array_filter(array_map('trim', explode('|', CORS_ALLOWED_ORIGINS)));

header('Content-Type: application/json; charset=utf-8');

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $_cors_origins)) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
