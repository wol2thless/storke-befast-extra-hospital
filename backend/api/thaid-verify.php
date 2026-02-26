<?php
require_once __DIR__ . '/../configs/cors.php';

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['code'])) {
    http_response_code(400);
    echo json_encode(array(
        'success' => false, 
        'message' => 'Missing required field: code'
    ));
    exit();
}

$code = $input['code'];
$redirectUri = isset($input['redirect_uri']) ? $input['redirect_uri'] : 'http://localhost:5173/auth/core';

// Call ThaiD API (same as original PHP code)
$api_url = THAID_API_URL;
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(array(
    'code' => $code,
    'redirect_uri' => $redirectUri
)));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$responseData = json_decode($response, true);
curl_close($ch);

// Return the complete response data (same as your original logic)
if (isset($responseData['save_response']) && $responseData['save_response']['status'] === 'success') {
    echo json_encode(array(
        'success' => true,
        'message' => 'Authentication successful',
        'responseData' => $responseData,
        'code' => $code,
        'redirect_uri' => $redirectUri
    ));
} else {
    echo json_encode(array(
        'success' => false,
        'message' => 'ThaiD authentication failed',
        'responseData' => $responseData,
        'code' => $code,
        'redirect_uri' => $redirectUri
    ));
}
?>