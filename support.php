<?php
$query = $_POST['query'] ?? '';

$response = "Sorry, I didn't understand that.";

if (stripos($query, 'inventory') !== false) {
  $response = "Project A is an Inventory System used to manage stock in real-time.";
} elseif (stripos($query, 'billing') !== false) {
  $response = "Project B is a Billing App for generating customer invoices.";
} elseif (stripos($query, 'booking') !== false) {
  $response = "Project C is a Booking System for appointments and reservations.";
}

echo $response;
