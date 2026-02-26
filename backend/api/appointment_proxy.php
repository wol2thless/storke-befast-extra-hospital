<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST method for this API
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Get input data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Validate required data
    if (!$data || !isset($data['pid'])) {
        http_response_code(400);
        echo json_encode(['error' => 'PID is required']);
        exit();
    }
    
    // Target API URL
    $targetUrl = 'http://192.168.99.225/api/stroke-befast/get_pmk_utable.php';
    
    // Prepare cURL request
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $targetUrl,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Content-Length: ' . strlen(json_encode($data))
        ],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false
    ]);
    
    // Execute request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    // Check for cURL errors
    if ($error) {
        http_response_code(502);
        echo json_encode([
            'error' => 'Proxy connection failed',
            'details' => $error
        ]);
        exit();
    }
    
    // Forward the HTTP status code
    http_response_code($httpCode);
    
    // Return the response
    if ($response === false) {
        echo json_encode(['error' => 'No response from target server']);
    } else {
        // Try to decode JSON to validate format
        $decoded = json_decode($response, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            // Valid JSON, return as-is
            echo $response;
        } else {
            // Invalid JSON, wrap in error response
            echo json_encode([
                'error' => 'Invalid response format from target server',
                'raw_response' => $response
            ]);
        }
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage()
    ]);
}
?>