<?php

use App\Http\Controllers\Api\SensorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/sensor/reading', [SensorController::class, 'store']);
