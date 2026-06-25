<?php

use App\Http\Controllers\Api\SensorUpdateController;
use Illuminate\Support\Facades\Route;

Route::post('/sensor/update', SensorUpdateController::class)
    ->middleware('throttle:sensor-updates')
    ->name('api.sensor.update');
