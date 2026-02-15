<?php

use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\TrackingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/sensor/reading', [SensorController::class, 'store']);
// routes/api.php
Route::post('/webhooks/tracking', [TrackingController::class, 'handleWebhook']);