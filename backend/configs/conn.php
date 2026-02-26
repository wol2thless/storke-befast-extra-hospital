<?php
date_default_timezone_set('Asia/Bangkok');
$servername = '172.16.99.200';
// $servername = '61.19.25.200';
$username = 'hatyaih';
$password = 'Com3274*';
$dbname = "stroke";



try {
    $dsn = "mysql:host=$servername;dbname=$dbname;charset=utf8";
    $conn = new PDO($dsn, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("SET NAMES 'utf8'");
    // echo "Connected successfully";
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}